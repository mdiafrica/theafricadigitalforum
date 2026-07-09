import { z } from "zod"

export const contactInput = z.object({
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
  email: z.email("A valid email address is required.").trim().toLowerCase(),
})
export type NewsletterInput = z.infer<typeof newsletterInput>

export const listSubmissionsInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
})
export type ListSubmissionsInput = z.infer<typeof listSubmissionsInput>
