import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import {
  listRegistrationsInput,
  registrationIdInput,
  updatePaymentStatusInput,
  updateRegistrationInput,
  type ListRegistrationsInput,
} from "./registrations.schemas"

const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&")

function buildFilter(data: Pick<ListRegistrationsInput, "search" | "passTier">) {
  const term = data.search ? `%${escapeLike(data.search)}%` : undefined
  return and(
    data.passTier ? eq(schema.registration.passTier, data.passTier) : undefined,
    term
      ? or(
          ilike(schema.registration.fullName, term),
          ilike(schema.registration.email, term),
          ilike(schema.registration.organization, term),
          ilike(schema.registration.reference, term)
        )
      : undefined
  )
}

export const listRegistrations = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ submission: ["read"] })])
  .validator(listRegistrationsInput)
  .handler(async ({ data }) => {
    const where = buildFilter(data)
    const [items, [{ total }], tierCounts] = await Promise.all([
      db
        .select()
        .from(schema.registration)
        .where(where)
        .orderBy(desc(schema.registration.createdAt))
        .limit(data.pageSize)
        .offset((data.page - 1) * data.pageSize),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(schema.registration)
        .where(where),
      db
        .select({
          passTier: schema.registration.passTier,
          count: sql<number>`count(*)::int`,
        })
        .from(schema.registration)
        .groupBy(schema.registration.passTier),
    ])
    return { items, total, page: data.page, pageSize: data.pageSize, tierCounts }
  })

export type RegistrationItem = Awaited<
  ReturnType<typeof listRegistrations>
>["items"][number]

export const updateRegistrationPayment = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["update"] })])
  .validator(updatePaymentStatusInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .update(schema.registration)
      .set({ paymentStatus: data.paymentStatus })
      .where(eq(schema.registration.id, data.id))
      .returning({ id: schema.registration.id })
    if (!row) throw new Error("Registration not found")
    return { ok: true as const }
  })

export const updateRegistration = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["update"] })])
  .validator(updateRegistrationInput)
  .handler(async ({ data }) => {
    const { id, linkedinUrl, ...rest } = data
    const [row] = await db
      .update(schema.registration)
      .set({ ...rest, linkedinUrl: linkedinUrl || null })
      .where(eq(schema.registration.id, id))
      .returning({ id: schema.registration.id })
    if (!row) throw new Error("Registration not found")
    return { ok: true as const }
  })

export const deleteRegistration = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["delete"] })])
  .validator(registrationIdInput)
  .handler(async ({ data }) => {
    await db
      .delete(schema.registration)
      .where(eq(schema.registration.id, data.id))
    return { ok: true as const }
  })

// Prefix cells that spreadsheets would execute as formulas.
const csvCell = (value: unknown) => {
  let text = Array.isArray(value) ? value.join("; ") : String(value ?? "")
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export const exportRegistrationsCsv = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ submission: ["read"] })])
  .validator(listRegistrationsInput.pick({ search: true, passTier: true }))
  .handler(async ({ data }) => {
    const rows = await db
      .select()
      .from(schema.registration)
      .where(buildFilter(data))
      .orderBy(desc(schema.registration.createdAt))

    const header = [
      "Reference",
      "Registered at",
      "Title",
      "Full name",
      "Email",
      "Job title",
      "Organization",
      "Country",
      "LinkedIn",
      "Pass",
      "Payment status",
      "Interest areas",
      "Participation",
      "Primary goal",
      "Partnership interest",
      "Communications consent",
      "Terms accepted",
    ]
    const lines = rows.map((row) =>
      [
        row.reference,
        row.createdAt.toISOString(),
        row.title,
        row.fullName,
        row.email,
        row.jobTitle,
        row.organization,
        row.country,
        row.linkedinUrl,
        row.passTier,
        row.paymentStatus,
        row.interestAreas,
        row.participationType,
        row.primaryGoal,
        row.partnershipInterest,
        row.communicationsConsent ? "yes" : "no",
        row.termsAccepted ? "yes" : "no",
      ]
        .map(csvCell)
        .join(",")
    )
    return {
      filename: `adf-registrations-${new Date().toISOString().slice(0, 10)}.csv`,
      csv: "\uFEFF" + [header.map(csvCell).join(","), ...lines].join("\r\n"),
    }
  })
