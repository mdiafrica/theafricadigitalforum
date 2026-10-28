import { asc, eq, sql } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

const saveReferralInput = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Please enter a name.").max(200),
})

const referralIdInput = z.object({ id: z.uuid() })

const ordered = [
  asc(schema.referralOption.sortOrder),
  asc(schema.referralOption.name),
]

/** Public: options shown in the registration form's referral field. */
export const listReferralOptions = createServerFn({ method: "GET" }).handler(
  async () =>
    db
      .select({
        id: schema.referralOption.id,
        name: schema.referralOption.name,
      })
      .from(schema.referralOption)
      .orderBy(...ordered)
)

export const listReferralOptionsAdmin = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ submission: ["read"] })])
  .handler(async () =>
    db
      .select({
        id: schema.referralOption.id,
        name: schema.referralOption.name,
        used: sql<number>`(select count(*)::int from ${schema.registration} where ${schema.registration.referral} = ${schema.referralOption.name})`,
      })
      .from(schema.referralOption)
      .orderBy(...ordered)
  )

export type ReferralOptionItem = Awaited<
  ReturnType<typeof listReferralOptionsAdmin>
>[number]

export const saveReferralOption = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["update"] })])
  .validator(saveReferralInput)
  .handler(async ({ data }) => {
    const duplicate = await db.query.referralOption.findFirst({
      where: eq(schema.referralOption.name, data.name),
    })
    if (duplicate && duplicate.id !== data.id)
      throw new Error("That referral already exists.")

    if (data.id) {
      const existing = await db.query.referralOption.findFirst({
        where: eq(schema.referralOption.id, data.id),
      })
      if (!existing) throw new Error("Referral not found")
      await db.transaction(async (tx) => {
        await tx
          .update(schema.referralOption)
          .set({ name: data.name })
          .where(eq(schema.referralOption.id, data.id!))
        // Keep existing registrations pointing at the renamed option.
        await tx
          .update(schema.registration)
          .set({ referral: data.name })
          .where(eq(schema.registration.referral, existing.name))
      })
      return { ok: true as const }
    }

    await db.insert(schema.referralOption).values({
      name: data.name,
      sortOrder: sql`(select coalesce(max(${schema.referralOption.sortOrder}), 0) + 1 from ${schema.referralOption})`,
    })
    return { ok: true as const }
  })

export const deleteReferralOption = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["delete"] })])
  .validator(referralIdInput)
  .handler(async ({ data }) => {
    await db
      .delete(schema.referralOption)
      .where(eq(schema.referralOption.id, data.id))
    return { ok: true as const }
  })
