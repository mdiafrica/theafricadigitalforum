import { and, desc, eq, ne, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import {
  pickTranslation,
  upsertTranslationRows,
  type DbExecutor,
} from "@/server/db/translations"
import { mediaVariantUrl } from "@/server/media/variants"
import type { Locale } from "@/lib/schemas"
import type { PostTranslationsInput } from "./posts.schemas"

/**
 * Server-side data helpers behind the posts server functions — separated so
 * integration tests can exercise them without importing the auth middleware
 * chain.
 */

export type PostRow = typeof schema.post.$inferSelect
export type TranslationRow = typeof schema.postTranslation.$inferSelect
export type MediaRow = typeof schema.media.$inferSelect

export { pickTranslation }

export function coverUrls(coverMedia: MediaRow | null) {
  return {
    // The 1024 WebP rendition suits cards/heroes.
    coverUrl: mediaVariantUrl(coverMedia, 1024),
    coverBlurhash: coverMedia?.blurhash ?? null,
  }
}

/** ~200 wpm over the Plate body's concatenated text. */
export function readTimeMinutes(body: unknown[]): number {
  let words = 0
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return
    const record = node as Record<string, unknown>
    if (typeof record.text === "string") {
      words += record.text.split(/\s+/).filter(Boolean).length
    }
    if (Array.isArray(record.children)) record.children.forEach(walk)
  }
  body.forEach(walk)
  return Math.max(1, Math.round(words / 200))
}

export async function upsertTranslations(
  postId: string,
  translations: PostTranslationsInput,
  tx: DbExecutor = db
) {
  const values = (input: PostTranslationsInput["en"]) => ({
    title: input.title,
    excerpt: input.excerpt,
    category: input.category || null,
    body: input.body as schema.PostBodyNode[],
  })

  await upsertTranslationRows({
    tx,
    table: schema.postTranslation,
    parentKey: "postId",
    parentColumn: schema.postTranslation.postId,
    localeColumn: schema.postTranslation.locale,
    parentId: postId,
    en: values(translations.en),
    fr: translations.fr?.title.trim() ? values(translations.fr) : undefined,
  })
}

type PostCardBase = Pick<PostRow, "id" | "slug" | "publishedAt"> &
  Pick<TranslationRow, "title" | "excerpt" | "category">

export type PublicPostListItem = PostCardBase & {
  coverUrl: string | null
  coverBlurhash: string | null
  authorName: string
  readTimeMin: number
}

export function mapPublicListItem(
  row: PostCardBase & {
    cover: MediaRow | null
    authorName: string | null
    body: TranslationRow["body"]
  }
): PublicPostListItem {
  const { cover, body, authorName, ...base } = row
  return {
    ...base,
    ...coverUrls(cover),
    authorName: authorName ?? "ADF Editorial",
    readTimeMin: readTimeMinutes(body),
  }
}

// COALESCE(requested, en) mirrors pickTranslation — EN always exists.
export async function selectPublishedPosts(filters: {
  locale: Locale
  category?: string
  query?: string
}): Promise<PublicPostListItem[]> {
  const req = alias(schema.postTranslation, "req_translation")
  const en = alias(schema.postTranslation, "en_translation")

  const title = sql<TranslationRow["title"]>`coalesce(${req.title}, ${en.title})`
  const excerpt = sql<TranslationRow["excerpt"]>`coalesce(${req.excerpt}, ${en.excerpt})`
  const category = sql<TranslationRow["category"]>`coalesce(${req.category}, ${en.category})`
  const body = sql<TranslationRow["body"]>`coalesce(${req.body}, ${en.body})`

  const conditions = [eq(schema.post.status, "published")]
  if (filters.category) {
    conditions.push(sql`${category} = ${filters.category}`)
  }
  if (filters.query) {
    const q = `%${filters.query}%`
    conditions.push(
      sql`(${title} ilike ${q} or ${excerpt} ilike ${q} or ${category} ilike ${q} or ${schema.user.name} ilike ${q})`
    )
  }

  const rows = await db
    .select({
      id: schema.post.id,
      slug: schema.post.slug,
      publishedAt: schema.post.publishedAt,
      title,
      excerpt,
      category,
      body,
      authorName: schema.user.name,
      cover: schema.media,
    })
    .from(schema.post)
    .leftJoin(
      req,
      and(eq(req.postId, schema.post.id), eq(req.locale, filters.locale))
    )
    .leftJoin(en, and(eq(en.postId, schema.post.id), eq(en.locale, "en")))
    .leftJoin(schema.media, eq(schema.media.id, schema.post.coverMediaId))
    .leftJoin(schema.user, eq(schema.user.id, schema.post.authorId))
    .where(and(...conditions))
    .orderBy(desc(schema.post.publishedAt))

  return rows.map(mapPublicListItem)
}

export async function selectPublishedCategories(
  locale: Locale
): Promise<string[]> {
  const req = alias(schema.postTranslation, "req_translation")
  const en = alias(schema.postTranslation, "en_translation")
  const category = sql<string>`coalesce(${req.category}, ${en.category})`

  const rows = await db
    .selectDistinct({ category })
    .from(schema.post)
    .leftJoin(
      req,
      and(eq(req.postId, schema.post.id), eq(req.locale, locale))
    )
    .leftJoin(en, and(eq(en.postId, schema.post.id), eq(en.locale, "en")))
    .where(and(eq(schema.post.status, "published"), sql`${category} is not null`))
    .orderBy(category)

  return rows.map((row) => row.category).filter((c): c is string => Boolean(c))
}

export async function assertSlugAvailable(slug: string, excludeId?: string) {
  const clash = await db.query.post.findFirst({
    where: excludeId
      ? and(eq(schema.post.slug, slug), ne(schema.post.id, excludeId))
      : eq(schema.post.slug, slug),
    columns: { id: true },
  })
  if (clash) throw new Error(`The slug "${slug}" is already in use`)
}
