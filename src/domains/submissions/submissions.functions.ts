import { desc, eq, inArray, sql } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { sendEmail } from "@/server/email"
import {
  contactInput,
  forwardSubmissionInput,
  listSubmissionsInput,
  newsletterInput,
  replySubmissionInput,
  submissionIdInput,
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

export const deleteContactSubmission = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["delete"] })])
  .validator(submissionIdInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .delete(schema.contactSubmission)
      .where(eq(schema.contactSubmission.id, data.id))
      .returning({ id: schema.contactSubmission.id })
    if (!row) throw new Error("Contact enquiry not found")
    return row
  })

export const replyToContactSubmission = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["update"] })])
  .validator(replySubmissionInput)
  .handler(async ({ data }) => {
    const submission = await db.query.contactSubmission.findFirst({
      where: eq(schema.contactSubmission.id, data.id),
    })
    if (!submission) throw new Error("Contact enquiry not found")

    await sendEmail("contact-reply", submission.email, {
      name: submission.name,
      subject: submission.subject,
      message: data.message,
    })

    return { ok: true as const }
  })

export const listSubmissionRecipients = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ submission: ["read"] })])
  .handler(async () => {
    const members = await db.query.member.findMany({
      with: { user: { columns: { name: true, email: true } } },
    })
    return members.map(({ user }) => ({ name: user.name, email: user.email }))
  })

export const forwardContactSubmission = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["update"] })])
  .validator(forwardSubmissionInput)
  .handler(async ({ data }) => {
    const submission = await db.query.contactSubmission.findFirst({
      where: eq(schema.contactSubmission.id, data.id),
    })
    if (!submission) throw new Error("Contact enquiry not found")

    await Promise.all(
      data.recipients.map((to) =>
        sendEmail("contact-forward", to, {
          name: submission.name,
          email: submission.email,
          subject: submission.subject,
          originalMessage: submission.message,
          note: data.note,
        })
      )
    )
    return { ok: true as const }
  })

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
