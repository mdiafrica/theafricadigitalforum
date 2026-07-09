import { z } from "zod"

import { localeSchema, urlOrEmpty } from "@/lib/schemas"

export const speakerTranslationInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  role: z.string().trim().max(300).default(""),
})

export const speakerTranslationsInput = z.object({
  en: speakerTranslationInput,
  fr: speakerTranslationInput
    .extend({ name: z.string().trim().max(200) })
    .optional(),
})
export type SpeakerTranslationsInput = z.infer<typeof speakerTranslationsInput>

export const saveSpeakerInput = z.object({
  id: z.uuid().optional(),
  photoMediaId: z.uuid().nullish(),
  twitterUrl: urlOrEmpty,
  linkedinUrl: urlOrEmpty,
  sortOrder: z.number().int().min(0).max(10_000).default(0),
  translations: speakerTranslationsInput,
})
export type SaveSpeakerInput = z.infer<typeof saveSpeakerInput>

export const speakerIdInput = z.object({ id: z.uuid() })

export const listPublicSpeakersInput = z.object({
  locale: localeSchema.default("en"),
})
