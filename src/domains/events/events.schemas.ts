import { z } from "zod"

import { localeSchema } from "@/lib/schemas"

export const eventTranslationInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  summary: z.string().trim().max(5000).default(""),
  expectedOutcome: z.string().trim().max(5000).default(""),
  beneficiaries: z.string().trim().max(5000).default(""),
  speaker: z.string().trim().max(1000).default(""),
  dayDescription: z.string().trim().max(1000).default(""),
  description: z.string().trim().max(2000).default(""),
})

export const eventTranslationsInput = z.object({
  en: eventTranslationInput,
  fr: eventTranslationInput
    .extend({ title: z.string().trim().max(300) })
    .optional(),
})
export type EventTranslationsInput = z.infer<typeof eventTranslationsInput>

export const saveEventInput = z.object({
  id: z.uuid().optional(),
  day: z.string().trim().max(200).default(""),
  /** ISO datetime strings (form inputs); empty = unscheduled. */
  startsAt: z
    .union([z.iso.datetime({ local: true }), z.literal("")])
    .default(""),
  endsAt: z.union([z.iso.datetime({ local: true }), z.literal("")]).default(""),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
  translations: eventTranslationsInput,
})
export type SaveEventInput = z.infer<typeof saveEventInput>

export const eventIdInput = z.object({ id: z.uuid() })

export const listPublicEventsInput = z.object({
  locale: localeSchema.default("en"),
})
