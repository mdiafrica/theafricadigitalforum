import { desc, inArray, sql } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { sendEmail } from "@/server/email"
import {
  contactInput,
  listSubmissionsInput,
  newsletterInput,
} from "./submissions.schemas"

/**
 * Public form endpoints (anonymous visitors) + the staff inbox reads.
 * Contact enquiries additionally notify every org admin/owner by email —
 * a failed notification never fails the submission.
 */

async function notifyAdmins(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const admins = await db.query.member.findMany({
    where: inArray(schema.member.role, ["owner", "admin"]),
    with: { user: { columns: { email: true } } },
  })
  const recipients = [...new Set(admins.map((m) => m.user.email))]

  await Promise.allSettled(
    recipients.map((to) => sendEmail("contact-notification", to, data))
  )
}

export const submitContact = createServerFn({ method: "POST" })
  .validator(contactInput)
  .handler(async ({ data }) => {
    const subject = data.subject || "General enquiry"

    await db.insert(schema.contactSubmission).values({
      name: data.name,
      email: data.email,
      subject,
      message: data.message,
    })

    // Fire-and-forget style but awaited (serverless-safe); errors are logged
    // per-recipient by allSettled and never bubble to the visitor.
    await notifyAdmins({ ...data, subject })

    return { ok: true as const }
  })

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator(newsletterInput)
  .handler(async ({ data }) => {
    // Duplicate signups succeed silently — no address enumeration.
    await db
      .insert(schema.newsletterSubscriber)
      .values({ email: data.email })
      .onConflictDoNothing()

    return { ok: true as const }
  })

export const listContactSubmissions = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ submission: ["read"] })])
  .validator(listSubmissionsInput)
  .handler(async ({ data }) => {
    const offset = (data.page - 1) * data.pageSize
    const [items, [{ total }]] = await Promise.all([
      db.query.contactSubmission.findMany({
        orderBy: desc(schema.contactSubmission.createdAt),
        limit: data.pageSize,
        offset,
      }),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(schema.contactSubmission),
    ])
    return { items, total, page: data.page, pageSize: data.pageSize }
  })

export type ContactSubmissionItem = Awaited<
  ReturnType<typeof listContactSubmissions>
>["items"][number]

export const listNewsletterSubscribers = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ submission: ["read"] })])
  .validator(listSubmissionsInput)
  .handler(async ({ data }) => {
    const offset = (data.page - 1) * data.pageSize
    const [items, [{ total }]] = await Promise.all([
      db.query.newsletterSubscriber.findMany({
        orderBy: desc(schema.newsletterSubscriber.createdAt),
        limit: data.pageSize,
        offset,
      }),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(schema.newsletterSubscriber),
    ])
    return { items, total, page: data.page, pageSize: data.pageSize }
  })

export type NewsletterSubscriberItem = Awaited<
  ReturnType<typeof listNewsletterSubscribers>
>["items"][number]
