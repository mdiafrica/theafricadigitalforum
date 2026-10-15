import { eq } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

const referenceInput = z.object({
  reference: z.string().trim().toUpperCase().min(1).max(40),
})

const select = {
  id: schema.registration.id,
  reference: schema.registration.reference,
  title: schema.registration.title,
  fullName: schema.registration.fullName,
  jobTitle: schema.registration.jobTitle,
  organization: schema.registration.organization,
  country: schema.registration.country,
  passTier: schema.registration.passTier,
  paymentStatus: schema.registration.paymentStatus,
  participationType: schema.registration.participationType,
  checkedInAt: schema.registration.checkedInAt,
}

/** Looks up a ticket from a scanned QR value or a typed reference. */
export const findRegistrationByReference = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["read"] })])
  .validator(referenceInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .select(select)
      .from(schema.registration)
      .where(eq(schema.registration.reference, data.reference))
      .limit(1)
    return row ?? null
  })

export const checkInRegistration = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["update"] })])
  .validator(referenceInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .update(schema.registration)
      .set({ checkedInAt: new Date() })
      .where(eq(schema.registration.reference, data.reference))
      .returning(select)
    if (!row) throw new Error("Registration not found.")
    return row
  })

export const undoCheckIn = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["update"] })])
  .validator(referenceInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .update(schema.registration)
      .set({ checkedInAt: null })
      .where(eq(schema.registration.reference, data.reference))
      .returning(select)
    if (!row) throw new Error("Registration not found.")
    return row
  })

/** Public, minimal confirmation: no contact details are exposed. */
export const verifyRegistration = createServerFn({ method: "GET" })
  .validator(referenceInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .select({
        fullName: schema.registration.fullName,
        passTier: schema.registration.passTier,
        checkedInAt: schema.registration.checkedInAt,
      })
      .from(schema.registration)
      .where(eq(schema.registration.reference, data.reference))
      .limit(1)
    if (!row) return { registered: false as const }
    const [first, ...rest] = row.fullName.trim().split(/\s+/)
    const initial = rest.length ? ` ${rest[rest.length - 1]![0]}.` : ""
    return {
      registered: true as const,
      name: `${first}${initial}`,
      passTier: row.passTier,
      checkedIn: row.checkedInAt !== null,
    }
  })

export const getCheckInStats = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ submission: ["read"] })])
  .handler(async () => {
    const rows = await db
      .select({ checkedInAt: schema.registration.checkedInAt })
      .from(schema.registration)
    return {
      total: rows.length,
      checkedIn: rows.filter((row) => row.checkedInAt !== null).length,
    }
  })

export type CheckInTicket = NonNullable<
  Awaited<ReturnType<typeof findRegistrationByReference>>
>
