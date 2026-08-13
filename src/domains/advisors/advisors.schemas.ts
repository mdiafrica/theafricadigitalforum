import { z } from "zod"

import { localeSchema, urlOrEmpty } from "@/lib/schemas"

export const advisorTranslationInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  role: z.string().trim().max(300).default(""),
})

export const advisorTranslationsInput = z.object({
  en: advisorTranslationInput,
  fr: advisorTranslationInput
    .extend({ name: z.string().trim().max(200) })
    .optional(),
})
export type AdvisorTranslationsInput = z.infer<typeof advisorTranslationsInput>

export const saveAdvisorInput = z.object({
  id: z.uuid().optional(),
  photoMediaId: z.uuid().nullish(),
  twitterUrl: urlOrEmpty,
  linkedinUrl: urlOrEmpty,
  sortOrder: z.number().int().min(0).max(10_000).default(0),
  translations: advisorTranslationsInput,
})
export type SaveAdvisorInput = z.infer<typeof saveAdvisorInput>

export const advisorIdInput = z.object({ id: z.uuid() })

export const listPublicAdvisorsInput = z.object({
  locale: localeSchema.default("en"),
})
