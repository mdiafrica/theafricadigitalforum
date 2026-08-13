import { z } from "zod"

import { postSlugSchema } from "@/domains/posts"
import type { PostTranslationsInput } from "@/domains/posts"

/**
 * Client form shape: both locales always present (empty FR = not saved);
 * bodies live in form state as the Plate Value.
 */
const localeFields = z.object({
  title: z.string().trim(),
  excerpt: z
    .string()
    .trim()
    .max(1000, "Keep the excerpt under 1000 characters"),
  body: z.array(z.looseObject({})),
})

export const postFormSchema = z.object({
  slug: postSlugSchema,
  coverMediaId: z.string().nullable(),
  /** Empty string = default byline (the caller / unchanged). */
  authorId: z.string(),
  categoryIds: z.array(z.string()),
  en: localeFields.extend({
    title: z.string().trim().min(1, "The English title is required").max(300),
  }),
  fr: localeFields.extend({
    title: z.string().trim().max(300),
  }),
})
export type PostFormValues = z.infer<typeof postFormSchema>

export const emptyLocaleValues: PostFormValues["fr"] = {
  title: "",
  excerpt: "",
  body: [],
}

/** Form values → server translations payload (FR only when titled). */
export function toTranslationsInput(
  values: PostFormValues
): PostTranslationsInput {
  return {
    en: values.en,
    fr: values.fr.title.trim() ? values.fr : undefined,
  }
}
