import { and, asc, eq, ne, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { createServerFn } from "@tanstack/react-start"

import { assertOrgPermission, requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { indexByLocale } from "@/server/db/translations"
import {
  categoryIdInput,
  listPublicCategoriesInput,
  saveCategoryInput,
} from "./categories.schemas"

async function assertCategorySlugAvailable(slug: string, excludeId?: string) {
  const clash = await db.query.category.findFirst({
    where: excludeId
      ? and(eq(schema.category.slug, slug), ne(schema.category.id, excludeId))
      : eq(schema.category.slug, slug),
    columns: { id: true },
  })
  if (clash) throw new Error(`The slug "${slug}" is already in use`)
}

export const listCategoriesAdmin = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ category: ["read"] })])
  .handler(async () => {
    const rows = await db.query.category.findMany({
      with: {
        translations: true,
        posts: { columns: { postId: true } },
      },
      orderBy: asc(schema.category.slug),
    })

    return rows.map((row) => {
      const byLocale = indexByLocale(row.translations, (t) => t.name)
      return {
        id: row.id,
        slug: row.slug,
        color: row.color,
        nameEn: byLocale.en ?? "",
        nameFr: byLocale.fr ?? "",
        postCount: row.posts.length,
        updatedAt: row.updatedAt,
      }
    })
  })

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ category: ["update"] })])
  .validator(saveCategoryInput)
  .handler(async ({ data, context }) => {
    if (!data.id) assertOrgPermission(context.auth, { category: ["create"] })
    await assertCategorySlugAvailable(data.slug, data.id)

    return db.transaction(async (tx) => {
      let id = data.id
      if (id) {
        const [row] = await tx
          .update(schema.category)
          .set({ slug: data.slug, color: data.color })
          .where(eq(schema.category.id, id))
          .returning({ id: schema.category.id })
        if (!row) throw new Error("Category not found")
      } else {
        const [row] = await tx
          .insert(schema.category)
          .values({ slug: data.slug, color: data.color })
          .returning({ id: schema.category.id })
        id = row.id
      }

      const upsertName = (locale: "en" | "fr", name: string) =>
        tx
          .insert(schema.categoryTranslation)
          .values({ categoryId: id, locale, name })
          .onConflictDoUpdate({
            target: [
              schema.categoryTranslation.categoryId,
              schema.categoryTranslation.locale,
            ],
            set: { name },
          })

      await upsertName("en", data.nameEn)
      if (data.nameFr.trim()) {
        await upsertName("fr", data.nameFr)
      } else {
        await tx
          .delete(schema.categoryTranslation)
          .where(
            and(
              eq(schema.categoryTranslation.categoryId, id),
              eq(schema.categoryTranslation.locale, "fr")
            )
          )
      }

      return { id }
    })
  })

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ category: ["delete"] })])
  .validator(categoryIdInput)
  .handler(async ({ data }) => {
    const [{ inUse }] = await db
      .select({ inUse: sql<number>`count(*)::int` })
      .from(schema.postCategory)
      .where(eq(schema.postCategory.categoryId, data.id))
    if (inUse > 0) {
      throw new Error(
        `This category is used by ${inUse} article${inUse === 1 ? "" : "s"}. Reassign them before deleting it.`
      )
    }

    const [row] = await db
      .delete(schema.category)
      .where(eq(schema.category.id, data.id))
      .returning({ id: schema.category.id })
    if (!row) throw new Error("Category not found")
    return { id: row.id }
  })

/** Public list — locale-resolved names (requested first, EN fallback). */
export const listPublicCategories = createServerFn({ method: "GET" })
  .validator(listPublicCategoriesInput)
  .handler(async ({ data }) => {
    const req = alias(schema.categoryTranslation, "req_translation")
    const en = alias(schema.categoryTranslation, "en_translation")
    const name = sql<string>`coalesce(${req.name}, ${en.name})`

    const rows = await db
      .select({
        id: schema.category.id,
        slug: schema.category.slug,
        color: schema.category.color,
        name,
      })
      .from(schema.category)
      .leftJoin(
        req,
        and(
          eq(req.categoryId, schema.category.id),
          eq(req.locale, data.locale)
        )
      )
      .leftJoin(
        en,
        and(eq(en.categoryId, schema.category.id), eq(en.locale, "en"))
      )
      .where(sql`${name} is not null`)
      .orderBy(name)

    return rows
  })

export type CategoryAdminItem = Awaited<
  ReturnType<typeof listCategoriesAdmin>
>[number]
export type PublicCategory = Awaited<
  ReturnType<typeof listPublicCategories>
>[number]
