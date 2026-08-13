import { and, asc, desc, eq, inArray, ne, notInArray, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import {
  pickTranslation,
  upsertTranslationRows,
} from "@/server/db/translations"
import type { DbExecutor } from "@/server/db/translations"
import { mediaVariantUrl } from "@/server/media/variants"
import { resolveEditorialBoard } from "@/domains/page-content/page-content.internal"
import { OrgRole } from "@/lib/auth/permissions"
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

export { pickTranslation, resolveEditorialBoard }

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

/**
 * Byline rule (ADR-0001): the Editorial Board fronts articles whose author
 * is an admin/owner or missing, resolved from the author's current role.
 */
export function isBoardByline(
  authorName: string | null,
  authorOrgRole: string | null
): boolean {
  return (
    !authorName ||
    authorOrgRole === OrgRole.Admin ||
    authorOrgRole === OrgRole.Owner
  )
}

export async function upsertTranslations(
  postId: string,
  translations: PostTranslationsInput,
  tx: DbExecutor = db
) {
  const values = (input: PostTranslationsInput["en"]) => ({
    title: input.title,
    excerpt: input.excerpt,
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

/** Replace a post's category links with the given set. */
export async function syncPostCategories(
  postId: string,
  categoryIds: string[],
  tx: Pick<typeof db, "insert" | "delete"> = db
) {
  await tx
    .delete(schema.postCategory)
    .where(eq(schema.postCategory.postId, postId))
  if (categoryIds.length > 0) {
    await tx
      .insert(schema.postCategory)
      .values(categoryIds.map((categoryId) => ({ postId, categoryId })))
      .onConflictDoNothing()
  }
}

export type PostCategoryRef = {
  id: string
  slug: string
  color: string
  name: string
}

/** Locale-resolved category refs for a set of posts, keyed by post id. */
export async function selectPostCategories(
  postIds: string[],
  locale: Locale
): Promise<Map<string, PostCategoryRef[]>> {
  const map = new Map<string, PostCategoryRef[]>()
  if (postIds.length === 0) return map

  const rows = await db.query.postCategory.findMany({
    where: inArray(schema.postCategory.postId, postIds),
    with: { category: { with: { translations: true } } },
  })

  for (const row of rows) {
    const translation = pickTranslation(row.category.translations, locale)
    if (!translation) continue
    const refs = map.get(row.postId) ?? []
    refs.push({
      id: row.category.id,
      slug: row.category.slug,
      color: row.category.color,
      name: translation.name,
    })
    map.set(row.postId, refs)
  }
  for (const refs of map.values()) {
    refs.sort((a, b) => a.name.localeCompare(b.name))
  }
  return map
}

type PostCardBase = Pick<PostRow, "id" | "slug" | "publishedAt"> &
  Pick<TranslationRow, "title" | "excerpt">

export type PublicPostListItem = PostCardBase & {
  coverUrl: string | null
  coverBlurhash: string | null
  authorName: string
  readTimeMin: number
  categories: PostCategoryRef[]
}

export function mapPublicListItem(
  row: PostCardBase & {
    cover: MediaRow | null
    authorName: string | null
    authorOrgRole: string | null
    body: TranslationRow["body"]
    categories: PostCategoryRef[]
  },
  boardName: string
): PublicPostListItem {
  const { cover, body, authorName, authorOrgRole, ...base } = row
  return {
    ...base,
    ...coverUrls(cover),
    authorName: isBoardByline(authorName, authorOrgRole)
      ? boardName
      : (authorName as string),
    readTimeMin: readTimeMinutes(body),
  }
}

// COALESCE(requested, en) mirrors pickTranslation — EN always exists.
async function queryPublishedListRows(opts: {
  locale: Locale
  categorySlug?: string
  query?: string
  excludeId?: string
  notInIds?: string[]
  /** Order posts sharing ≥1 category with this post first (then newest). */
  sharedCategoryFirstWith?: string
  limit?: number
}) {
  const req = alias(schema.postTranslation, "req_translation")
  const en = alias(schema.postTranslation, "en_translation")

  const title = sql<
    TranslationRow["title"]
  >`coalesce(${req.title}, ${en.title})`
  const excerpt = sql<
    TranslationRow["excerpt"]
  >`coalesce(${req.excerpt}, ${en.excerpt})`
  const body = sql<TranslationRow["body"]>`coalesce(${req.body}, ${en.body})`

  const conditions = [eq(schema.post.status, "published")]
  if (opts.categorySlug) {
    conditions.push(
      sql`exists (select 1 from ${schema.postCategory} pc join ${schema.category} c on c.id = pc.category_id where pc.post_id = ${schema.post.id} and c.slug = ${opts.categorySlug})`
    )
  }
  if (opts.query) {
    const q = `%${opts.query}%`
    conditions.push(
      sql`(${title} ilike ${q} or ${excerpt} ilike ${q} or ${schema.user.name} ilike ${q})`
    )
  }
  if (opts.excludeId) {
    conditions.push(ne(schema.post.id, opts.excludeId))
  }
  if (opts.notInIds && opts.notInIds.length > 0) {
    conditions.push(notInArray(schema.post.id, opts.notInIds))
  }

  const orderBy = [desc(schema.post.publishedAt)]
  if (opts.sharedCategoryFirstWith) {
    const shares = sql`exists (select 1 from ${schema.postCategory} pc where pc.post_id = ${schema.post.id} and pc.category_id in (select category_id from ${schema.postCategory} where post_id = ${opts.sharedCategoryFirstWith}))`
    orderBy.unshift(desc(shares))
  }

  const query = db
    .select({
      id: schema.post.id,
      slug: schema.post.slug,
      publishedAt: schema.post.publishedAt,
      title,
      excerpt,
      body,
      authorName: schema.user.name,
      authorOrgRole: schema.member.role,
      cover: schema.media,
    })
    .from(schema.post)
    .leftJoin(
      req,
      and(eq(req.postId, schema.post.id), eq(req.locale, opts.locale))
    )
    .leftJoin(en, and(eq(en.postId, schema.post.id), eq(en.locale, "en")))
    .leftJoin(schema.media, eq(schema.media.id, schema.post.coverMediaId))
    .leftJoin(schema.user, eq(schema.user.id, schema.post.authorId))
    .leftJoin(schema.member, eq(schema.member.userId, schema.post.authorId))
    .where(and(...conditions))
    .orderBy(...orderBy)

  return opts.limit ? query.limit(opts.limit) : query
}

type PublishedListRow = Awaited<
  ReturnType<typeof queryPublishedListRows>
>[number]

/** Board name + category refs turn raw rows into public list items. */
async function toPublicListItems(
  rows: PublishedListRow[],
  locale: Locale
): Promise<PublicPostListItem[]> {
  const [board, categoriesByPost] = await Promise.all([
    resolveEditorialBoard(locale),
    selectPostCategories(
      rows.map((row) => row.id),
      locale
    ),
  ])
  return rows.map((row) =>
    mapPublicListItem(
      { ...row, categories: categoriesByPost.get(row.id) ?? [] },
      board.name
    )
  )
}

export async function selectPublishedPosts(filters: {
  locale: Locale
  categorySlug?: string
  query?: string
}): Promise<PublicPostListItem[]> {
  const rows = await queryPublishedListRows(filters)
  return toPublicListItems(rows, filters.locale)
}

/**
 * Related = newest posts sharing ≥1 category, topped up with the newest
 * non-matching (single ranked query). More = the newest of the rest.
 */
export async function selectRelatedPosts(opts: {
  postId: string
  locale: Locale
  relatedLimit?: number
  moreLimit?: number
}): Promise<{ related: PublicPostListItem[]; more: PublicPostListItem[] }> {
  const relatedRows = await queryPublishedListRows({
    locale: opts.locale,
    excludeId: opts.postId,
    sharedCategoryFirstWith: opts.postId,
    limit: opts.relatedLimit ?? 4,
  })
  const moreRows = await queryPublishedListRows({
    locale: opts.locale,
    excludeId: opts.postId,
    notInIds: relatedRows.map((row) => row.id),
    limit: opts.moreLimit ?? 3,
  })

  const items = await toPublicListItems(
    [...relatedRows, ...moreRows],
    opts.locale
  )
  return {
    related: items.slice(0, relatedRows.length),
    more: items.slice(relatedRows.length),
  }
}

/** Categories that currently have published posts (for public filters). */
export async function selectPublishedCategories(
  locale: Locale
): Promise<PostCategoryRef[]> {
  const req = alias(schema.categoryTranslation, "req_translation")
  const en = alias(schema.categoryTranslation, "en_translation")
  const name = sql<string>`coalesce(${req.name}, ${en.name})`

  const rows = await db
    .selectDistinct({
      id: schema.category.id,
      slug: schema.category.slug,
      color: schema.category.color,
      name,
    })
    .from(schema.category)
    .innerJoin(
      schema.postCategory,
      eq(schema.postCategory.categoryId, schema.category.id)
    )
    .innerJoin(
      schema.post,
      and(
        eq(schema.post.id, schema.postCategory.postId),
        eq(schema.post.status, "published")
      )
    )
    .leftJoin(
      req,
      and(eq(req.categoryId, schema.category.id), eq(req.locale, locale))
    )
    .leftJoin(
      en,
      and(eq(en.categoryId, schema.category.id), eq(en.locale, "en"))
    )
    .where(sql`${name} is not null`)
    .orderBy(asc(name))

  return rows
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
