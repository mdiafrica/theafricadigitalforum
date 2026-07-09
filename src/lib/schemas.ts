import { z } from "zod"

/** Zod fragments shared across domains. */

export const LOCALES = ["en", "fr"] as const
export const localeSchema = z.enum(LOCALES)
export type Locale = z.infer<typeof localeSchema>

/** Standard input for public reads that resolve one locale. */
export const localeInput = z.object({ locale: localeSchema.default("en") })

/** Optional URL form field: a full URL or empty string. */
export const urlOrEmpty = z
  .union([z.url("Enter a full URL (https://…)"), z.literal("")])
  .default("")
