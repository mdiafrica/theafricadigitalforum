import { z } from "zod"

import { localeSchema } from "@/lib/schemas"

export const contactInput = z.object({
  locale: localeSchema.default("en"),
  name: z.string().trim().min(1, "Please enter your name.").max(200),
  email: z.email("A valid email address is required.").trim().toLowerCase(),
  subject: z.string().trim().max(300).default(""),
  message: z
    .string()
    .trim()
    .min(10, "Please enter a message of at least 10 characters.")
    .max(5000),
})
export type ContactInput = z.infer<typeof contactInput>

export const newsletterInput = z.object({
  locale: localeSchema.default("en"),
  email: z.email("A valid email address is required.").trim().toLowerCase(),
})
export type NewsletterInput = z.infer<typeof newsletterInput>

export const listSubmissionsInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
})

export const submissionIdInput = z.object({ id: z.uuid() })

export const replySubmissionInput = z.object({
  id: z.uuid(),
  message: z.string().trim().min(1).max(5000),
})

export const forwardSubmissionInput = z.object({
  id: z.uuid(),
  recipients: z.array(z.email()).min(1).max(20),
  note: z.string().trim().max(5000).default(""),
})
export type ListSubmissionsInput = z.infer<typeof listSubmissionsInput>
