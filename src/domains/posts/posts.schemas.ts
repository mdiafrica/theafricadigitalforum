import { z } from "zod"

import { localeSchema } from "@/lib/schemas"

export const postSlugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(200)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and hyphens (e.g. my-post-title)"
  )

/** One locale's editable text. Body is the Plate Value (element array). */
export const postTranslationInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  excerpt: z.string().trim().max(1000).default(""),
  category: z.string().trim().max(100).default(""),
  body: z.array(z.looseObject({})).default([]),
})
export type PostTranslationInput = z.infer<typeof postTranslationInput>

/**
 * EN is the required source locale; FR is optional and only saved when it
 * has a title.
 */
export const postTranslationsInput = z.object({
  en: postTranslationInput,
  fr: postTranslationInput.optional(),
})
export type PostTranslationsInput = z.infer<typeof postTranslationsInput>

export const createPostInput = z.object({
  slug: postSlugSchema,
  coverMediaId: z.uuid().nullish(),
  translations: postTranslationsInput,
})
export type CreatePostInput = z.infer<typeof createPostInput>

export const updatePostInput = z.object({
  id: z.uuid(),
  slug: postSlugSchema,
  coverMediaId: z.uuid().nullish(),
  translations: postTranslationsInput,
})
export type UpdatePostInput = z.infer<typeof updatePostInput>

export const postIdInput = z.object({
  id: z.uuid(),
})
export type PostIdInput = z.infer<typeof postIdInput>

export const listPostsAdminInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})
export type ListPostsAdminInput = z.infer<typeof listPostsAdminInput>

export const listPublishedPostsInput = z.object({
  locale: localeSchema.default("en"),
  category: z.string().trim().max(100).optional(),
  query: z.string().trim().max(200).optional(),
})
export type ListPublishedPostsInput = z.infer<typeof listPublishedPostsInput>

export const listPublishedPostCategoriesInput = z.object({
  locale: localeSchema.default("en"),
})
export type ListPublishedPostCategoriesInput = z.infer<
  typeof listPublishedPostCategoriesInput
>

export const getPublishedPostInput = z.object({
  slug: z.string().trim().min(1),
  locale: localeSchema.default("en"),
})
export type GetPublishedPostInput = z.infer<typeof getPublishedPostInput>

/** Derive a slug from a title (client-side helper for the form). */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200)
}
