import { and, desc, eq, sql } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { getPublicUrl } from "@/server/storage"
import { indexByLocale } from "@/server/db/translations"
import {
  assertSlugAvailable,
  mapPublicListItem,
  pickTranslation,
  selectPublishedCategories,
  selectPublishedPosts,
  upsertTranslations,
} from "./posts.internal"
import {
  createPostInput,
  getPublishedPostInput,
  listPostsAdminInput,
  listPublishedPostCategoriesInput,
  listPublishedPostsInput,
  postIdInput,
  updatePostInput,
} from "./posts.schemas"

// --- Admin server functions ---

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ post: ["create"] })])
  .validator(createPostInput)
  .handler(async ({ data, context }) => {
    await assertSlugAvailable(data.slug)

    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(schema.post)
        .values({
          slug: data.slug,
          coverMediaId: data.coverMediaId ?? null,
          authorId: context.auth.user.id,
        })
        .returning({ id: schema.post.id })

      await upsertTranslations(row.id, data.translations, tx)
      return { id: row.id }
    })
  })

export const updatePost = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ post: ["update"] })])
  .validator(updatePostInput)
  .handler(async ({ data }) => {
    await assertSlugAvailable(data.slug, data.id)

    return db.transaction(async (tx) => {
      const [row] = await tx
        .update(schema.post)
        .set({ slug: data.slug, coverMediaId: data.coverMediaId ?? null })
        .where(eq(schema.post.id, data.id))
        .returning({ id: schema.post.id })
      if (!row) throw new Error("Post not found")

      await upsertTranslations(data.id, data.translations, tx)
      return { id: data.id }
    })
  })

export const publishPost = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ post: ["publish"] })])
  .validator(postIdInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .update(schema.post)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(schema.post.id, data.id))
      .returning()
    if (!row) throw new Error("Post not found")
    return { id: row.id, status: row.status }
  })

export const unpublishPost = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ post: ["publish"] })])
  .validator(postIdInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .update(schema.post)
      .set({ status: "draft" })
      .where(eq(schema.post.id, data.id))
      .returning()
    if (!row) throw new Error("Post not found")
    return { id: row.id, status: row.status }
  })

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ post: ["delete"] })])
  .validator(postIdInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .delete(schema.post)
      .where(eq(schema.post.id, data.id))
      .returning({ id: schema.post.id })
    if (!row) throw new Error("Post not found")
    return { id: row.id }
  })

export const listPostsAdmin = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ post: ["read"] })])
  .validator(listPostsAdminInput)
  .handler(async ({ data }) => {
    const offset = (data.page - 1) * data.pageSize
    const [rows, [{ total }]] = await Promise.all([
      db.query.post.findMany({
        with: {
          // The list needs titles and locales, not the body JSONB.
          translations: { columns: { locale: true, title: true } },
          author: { columns: { name: true } },
        },
        orderBy: desc(schema.post.updatedAt),
        limit: data.pageSize,
        offset,
      }),
      db.select({ total: sql<number>`count(*)::int` }).from(schema.post),
    ])

    return {
      items: rows.map((row) => {
        const en = pickTranslation(row.translations, "en")
        return {
          id: row.id,
          slug: row.slug,
          status: row.status,
          title: en?.title ?? "(untitled)",
          locales: row.translations.map((t) => t.locale).sort(),
          authorName: row.author?.name ?? null,
          publishedAt: row.publishedAt,
          updatedAt: row.updatedAt,
        }
      }),
      total,
      page: data.page,
      pageSize: data.pageSize,
    }
  })

export const getPostAdmin = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ post: ["read"] })])
  .validator(postIdInput)
  .handler(async ({ data }) => {
    const row = await db.query.post.findFirst({
      where: eq(schema.post.id, data.id),
      with: {
        translations: true,
        coverMedia: true,
        author: { columns: { name: true } },
      },
    })
    if (!row) throw new Error("Post not found")

    const byLocale = indexByLocale(row.translations, (t) => t)

    return {
      id: row.id,
      slug: row.slug,
      status: row.status,
      coverMediaId: row.coverMediaId,
      coverUrl: row.coverMedia ? getPublicUrl(row.coverMedia.storageKey) : null,
      publishedAt: row.publishedAt,
      authorName: row.author?.name ?? null,
      translations: byLocale,
    }
  })

// --- Public server functions (published only, locale-resolved) ---

export const listPublishedPosts = createServerFn({ method: "GET" })
  .validator(listPublishedPostsInput)
  .handler(({ data }) =>
    selectPublishedPosts({
      locale: data.locale,
      category: data.category,
      query: data.query,
    })
  )

export const listPublishedPostCategories = createServerFn({ method: "GET" })
  .validator(listPublishedPostCategoriesInput)
  .handler(({ data }) => selectPublishedCategories(data.locale))

export const getPublishedPostBySlug = createServerFn({ method: "GET" })
  .validator(getPublishedPostInput)
  .handler(async ({ data }) => {
    const row = await db.query.post.findFirst({
      where: and(
        eq(schema.post.slug, data.slug),
        eq(schema.post.status, "published")
      ),
      with: {
        translations: true,
        coverMedia: true,
        author: { columns: { name: true } },
      },
    })
    if (!row) return null

    const translation = pickTranslation(row.translations, data.locale)
    if (!translation) return null

    const listItem = mapPublicListItem({
      id: row.id,
      slug: row.slug,
      title: translation.title,
      excerpt: translation.excerpt,
      category: translation.category,
      cover: row.coverMedia,
      authorName: row.author?.name ?? null,
      publishedAt: row.publishedAt,
      body: translation.body,
    })
    return { ...listItem, body: translation.body }
  })

export type PostAdminList = Awaited<ReturnType<typeof listPostsAdmin>>
export type PostAdminDetail = Awaited<ReturnType<typeof getPostAdmin>>
export type PublicPostListItem = Awaited<
  ReturnType<typeof listPublishedPosts>
>[number]
export type PublicPostCategories = Awaited<
  ReturnType<typeof listPublishedPostCategories>
>
export type PublicPost = NonNullable<
  Awaited<ReturnType<typeof getPublishedPostBySlug>>
>
