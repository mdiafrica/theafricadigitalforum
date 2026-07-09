import { asc, eq } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { assertOrgPermission, requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { mediaVariantUrl } from "@/server/media/variants"
import { saveSponsorInput, sponsorIdInput } from "./sponsors.schemas"

export const saveSponsor = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ sponsor: ["update"] })])
  .validator(saveSponsorInput)
  .handler(async ({ data, context }) => {
    if (!data.id) assertOrgPermission(context.auth, { sponsor: ["create"] })

    const values = {
      name: data.name,
      logoMediaId: data.logoMediaId ?? null,
      websiteUrl: data.websiteUrl || null,
      tier: data.tier || null,
      sortOrder: data.sortOrder,
    }

    if (data.id) {
      const [row] = await db
        .update(schema.sponsor)
        .set(values)
        .where(eq(schema.sponsor.id, data.id))
        .returning({ id: schema.sponsor.id })
      if (!row) throw new Error("Sponsor not found")
      return { id: row.id }
    }

    const [row] = await db
      .insert(schema.sponsor)
      .values(values)
      .returning({ id: schema.sponsor.id })
    return { id: row.id }
  })

export const deleteSponsor = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ sponsor: ["delete"] })])
  .validator(sponsorIdInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .delete(schema.sponsor)
      .where(eq(schema.sponsor.id, data.id))
      .returning({ id: schema.sponsor.id })
    if (!row) throw new Error("Sponsor not found")
    return { id: row.id }
  })

export const listSponsorsAdmin = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ sponsor: ["read"] })])
  .handler(async () => {
    const rows = await db.query.sponsor.findMany({
      with: { logoMedia: true },
      orderBy: [asc(schema.sponsor.sortOrder), asc(schema.sponsor.createdAt)],
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

/** Public list for a future sponsors section (no auth, live rows only). */
export const listPublicSponsors = createServerFn({ method: "GET" }).handler(
  async () => {
    const rows = await db.query.sponsor.findMany({
      with: { logoMedia: true },
      orderBy: [asc(schema.sponsor.sortOrder), asc(schema.sponsor.createdAt)],
    })
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      logoUrl: mediaVariantUrl(row.logoMedia, 320),
      websiteUrl: row.websiteUrl,
      tier: row.tier,
    }))
  }
)

export type SponsorAdminItem = Awaited<
  ReturnType<typeof listSponsorsAdmin>
>[number]
