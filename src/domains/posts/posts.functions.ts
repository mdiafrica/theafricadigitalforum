import { and, asc, desc, eq, inArray, sql } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { assertOrgPermission, requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { getPublicUrl } from "@/server/storage"
import { indexByLocale } from "@/server/db/translations"
import { OrgRole } from "@/lib/auth/permissions"
import {
  assertSlugAvailable,
  isBoardByline,
  mapPublicListItem,
  pickTranslation,
  resolveEditorialBoard,
  selectPostCategories,
  selectPublishedCategories,
  selectPublishedPosts,
  selectRelatedPosts,
  syncPostCategories,
  upsertTranslations,
} from "./posts.internal"
import {
  createPostInput,
  getPublishedPostInput,
  listPostsAdminInput,
  listPublishedPostCategoriesInput,
  listPublishedPostsInput,
  listRelatedPostsInput,
  postIdInput,
  updatePostInput,
} from "./posts.schemas"

// --- Admin server functions ---

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ post: ["create"] })])
  .validator(createPostInput)
  .handler(async ({ data, context }) => {
    await assertSlugAvailable(data.slug)
    if (data.authorId && data.authorId !== context.auth.user.id) {
      assertOrgPermission(context.auth, { post: ["assignAuthor"] })
    }

    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(schema.post)
        .values({
          slug: data.slug,
          coverMediaId: data.coverMediaId ?? null,
          authorId: data.authorId ?? context.auth.user.id,
        })
        .returning({ id: schema.post.id })

      await upsertTranslations(row.id, data.translations, tx)
      await syncPostCategories(row.id, data.categoryIds, tx)
      return { id: row.id }
    })
  })

export const updatePost = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ post: ["update"] })])
  .validator(updatePostInput)
  .handler(async ({ data, context }) => {
    await assertSlugAvailable(data.slug, data.id)
    if (data.authorId !== undefined) {
      assertOrgPermission(context.auth, { post: ["assignAuthor"] })
    }

    return db.transaction(async (tx) => {
      const [row] = await tx
        .update(schema.post)
        .set({
          slug: data.slug,
          coverMediaId: data.coverMediaId ?? null,
          ...(data.authorId !== undefined ? { authorId: data.authorId } : {}),
        })
        .where(eq(schema.post.id, data.id))
        .returning({ id: schema.post.id })
      if (!row) throw new Error("Post not found")

      await upsertTranslations(data.id, data.translations, tx)
      await syncPostCategories(data.id, data.categoryIds, tx)
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
        categories: { columns: { categoryId: true } },
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
      authorId: row.authorId,
      authorName: row.author?.name ?? null,
      categoryIds: row.categories.map((link) => link.categoryId),
      translations: byLocale,
    }
  })

/** Members the byline can be assigned to (admin-only picker). */
export const listAssignableAuthors = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ post: ["assignAuthor"] })])
  .handler(async () => {
    const rows = await db
      .select({
        userId: schema.member.userId,
        role: schema.member.role,
        name: schema.user.name,
      })
      .from(schema.member)
      .innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
      .where(
        inArray(schema.member.role, [
          OrgRole.Owner,
          OrgRole.Admin,
          OrgRole.Editor,
        ])
      )
      .orderBy(asc(schema.user.name))

    return rows.map((row) => ({
      userId: row.userId,
      name: row.name,
      role: row.role,
      /** Admin/owner bylines render as the Editorial Board. */
      isBoard: isBoardByline(row.name, row.role),
    }))
  })

// --- Public server functions (published only, locale-resolved) ---

export const listPublishedPosts = createServerFn({ method: "GET" })
  .validator(listPublishedPostsInput)
  .handler(({ data }) =>
    selectPublishedPosts({
      locale: data.locale,
      categorySlug: data.categorySlug,
      query: data.query,
    })
  )

export const listPublishedPostCategories = createServerFn({ method: "GET" })
  .validator(listPublishedPostCategoriesInput)
  .handler(({ data }) => selectPublishedCategories(data.locale))

/** Related (4, ≥1 shared category, newest, topped up) + More (next 3). */
export const listRelatedPosts = createServerFn({ method: "GET" })
  .validator(listRelatedPostsInput)
  .handler(async ({ data }) => {
    const row = await db.query.post.findFirst({
      where: and(
        eq(schema.post.slug, data.slug),
        eq(schema.post.status, "published")
      ),
      columns: { id: true },
    })
    if (!row) return { related: [], more: [] }
    return selectRelatedPosts({ postId: row.id, locale: data.locale })
  })

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
        author: { columns: { id: true, name: true, bio: true } },
      },
    })
    if (!row) return null

    const translation = pickTranslation(row.translations, data.locale)
    if (!translation) return null

    const [board, membership, categoriesByPost] = await Promise.all([
      resolveEditorialBoard(data.locale),
      row.author
        ? db.query.member.findFirst({
            where: eq(schema.member.userId, row.author.id),
            columns: { role: true },
          })
        : null,
      selectPostCategories([row.id], data.locale),
    ])

    // Byline rule (ADR-0001): board identity when the author is an
    // admin/owner or missing; the member's own name + bio otherwise.
    const usesBoardByline = isBoardByline(
      row.author?.name ?? null,
      membership?.role ?? null
    )
    const byline = usesBoardByline
      ? { isBoard: true as const, name: board.name, bio: board.bio }
      : {
          isBoard: false as const,
          name: row.author?.name as string,
          bio: row.author?.bio ?? null,
        }

    const listItem = mapPublicListItem(
      {
        id: row.id,
        slug: row.slug,
        title: translation.title,
        excerpt: translation.excerpt,
        cover: row.coverMedia,
        authorName: byline.name,
        authorOrgRole: null,
        publishedAt: row.publishedAt,
        body: translation.body,
        categories: categoriesByPost.get(row.id) ?? [],
      },
      board.name
    )
    return { ...listItem, body: translation.body, byline }
  })

export type PostAdminList = Awaited<ReturnType<typeof listPostsAdmin>>
export type PostAdminDetail = Awaited<ReturnType<typeof getPostAdmin>>
export type AssignableAuthor = Awaited<
  ReturnType<typeof listAssignableAuthors>
>[number]
export type PublicPostListItem = Awaited<
  ReturnType<typeof listPublishedPosts>
>[number]
export type PublicPostCategories = Awaited<
  ReturnType<typeof listPublishedPostCategories>
>
export type PublicPost = NonNullable<
  Awaited<ReturnType<typeof getPublishedPostBySlug>>
>
