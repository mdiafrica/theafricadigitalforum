import { asc, eq } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { assertOrgPermission, requireOrgPermission } from "@/domains/auth"
import { slugify } from "@/domains/posts/posts.schemas"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { mediaVariantUrl } from "@/server/media/variants"
import {
  partnerIdInput,
  savePartnerCategoryInput,
  savePartnerInput,
} from "./partners.schemas"

async function uniqueCategorySlug(name: string) {
  const base = slugify(name) || "category"
  let candidate = base
  for (let suffix = 2; ; suffix += 1) {
    const existing = await db.query.partnerCategory.findFirst({
      where: eq(schema.partnerCategory.slug, candidate),
      columns: { id: true },
    })
    if (!existing) return candidate
    candidate = `${base}-${suffix}`
  }
}

export const savePartner = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ partner: ["update"] })])
  .validator(savePartnerInput)
  .handler(async ({ data, context }) => {
    if (!data.id) assertOrgPermission(context.auth, { partner: ["create"] })

    const category = await db.query.partnerCategory.findFirst({
      where: eq(schema.partnerCategory.slug, data.tier),
      columns: { id: true },
    })
    if (!category) throw new Error("Choose a valid category")

    const values = {
      name: data.name,
      logoMediaId: data.logoMediaId ?? null,
      websiteUrl: data.websiteUrl || null,
      tier: data.tier,
      sortOrder: data.sortOrder,
    }

    if (data.id) {
      const rows = await db
        .update(schema.partner)
        .set(values)
        .where(eq(schema.partner.id, data.id))
        .returning({ id: schema.partner.id })
      const row = rows.at(0)
      if (!row) throw new Error("Partner not found")
      return { id: row.id }
    }

    const [row] = await db
      .insert(schema.partner)
      .values(values)
      .returning({ id: schema.partner.id })
    return { id: row.id }
  })

export const deletePartner = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ partner: ["delete"] })])
  .validator(partnerIdInput)
  .handler(async ({ data }) => {
    const rows = await db
      .delete(schema.partner)
      .where(eq(schema.partner.id, data.id))
      .returning({ id: schema.partner.id })
    const row = rows.at(0)
    if (!row) throw new Error("Partner not found")
    return { id: row.id }
  })

export const listPartnersAdmin = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ partner: ["read"] })])
  .handler(async () => {
    const rows = await db.query.partner.findMany({
      with: { logoMedia: true },
      orderBy: [asc(schema.partner.sortOrder), asc(schema.partner.createdAt)],
    })
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      logoMediaId: row.logoMediaId,
      logoUrl: mediaVariantUrl(row.logoMedia, 320),
      websiteUrl: row.websiteUrl,
      tier: row.tier,
      sortOrder: row.sortOrder,
    }))
  })

export const listPublicPartners = createServerFn({ method: "GET" }).handler(
  async () => {
    const rows = await db.query.partner.findMany({
      with: { logoMedia: true },
      orderBy: [asc(schema.partner.sortOrder), asc(schema.partner.createdAt)],
    })
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      logoUrl: mediaVariantUrl(row.logoMedia, 320),
      websiteUrl: row.websiteUrl,
      tier: row.tier,
      sortOrder: row.sortOrder,
    }))
  }
)

export const listPartnerCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const rows = await db.query.partnerCategory.findMany({
      orderBy: [
        asc(schema.partnerCategory.sortOrder),
        asc(schema.partnerCategory.createdAt),
      ],
    })
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      sortOrder: row.sortOrder,
    }))
  }
)

export const savePartnerCategory = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ partner: ["update"] })])
  .validator(savePartnerCategoryInput)
  .handler(async ({ data, context }) => {
    if (!data.id) assertOrgPermission(context.auth, { partner: ["create"] })

    if (data.id) {
      const rows = await db
        .update(schema.partnerCategory)
        .set({ name: data.name, sortOrder: data.sortOrder })
        .where(eq(schema.partnerCategory.id, data.id))
        .returning({ id: schema.partnerCategory.id })
      const row = rows.at(0)
      if (!row) throw new Error("Category not found")
      return { id: row.id }
    }

    const [row] = await db
      .insert(schema.partnerCategory)
      .values({
        name: data.name,
        slug: await uniqueCategorySlug(data.name),
        sortOrder: data.sortOrder,
      })
      .returning({ id: schema.partnerCategory.id })
    return { id: row.id }
  })

export const deletePartnerCategory = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ partner: ["delete"] })])
  .validator(partnerIdInput)
  .handler(async ({ data }) => {
    const category = await db.query.partnerCategory.findFirst({
      where: eq(schema.partnerCategory.id, data.id),
    })
    if (!category) throw new Error("Category not found")

    const inUse = await db.query.partner.findFirst({
      where: eq(schema.partner.tier, category.slug),
      columns: { id: true },
    })
    if (inUse) {
      throw new Error(
        "This category still has partners. Move or remove them first."
      )
    }

    await db
      .delete(schema.partnerCategory)
      .where(eq(schema.partnerCategory.id, data.id))
    return { id: data.id }
  })

export type PartnerAdminItem = Awaited<
  ReturnType<typeof listPartnersAdmin>
>[number]
export type PublicPartner = Awaited<
  ReturnType<typeof listPublicPartners>
>[number]
export type PartnerCategoryItem = Awaited<
  ReturnType<typeof listPartnerCategories>
>[number]
