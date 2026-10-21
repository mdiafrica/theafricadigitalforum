import { asc, eq } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { assertOrgPermission, requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { mediaVariantUrl } from "@/server/media/variants"
import { partnerIdInput, savePartnerInput } from "./partners.schemas"

export const savePartner = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ partner: ["update"] })])
  .validator(savePartnerInput)
  .handler(async ({ data, context }) => {
    if (!data.id) assertOrgPermission(context.auth, { partner: ["create"] })

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

export type PartnerAdminItem = Awaited<
  ReturnType<typeof listPartnersAdmin>
>[number]
export type PublicPartner = Awaited<
  ReturnType<typeof listPublicPartners>
>[number]
