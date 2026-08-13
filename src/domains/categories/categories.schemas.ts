import { z } from "zod"

import { localeSchema } from "@/lib/schemas"

export const categorySlugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and hyphens (e.g. digital-policy)"
  )

/**
 * Preset pill palette (tier-2 FE options) — legacy site colors plus two
 * extras. Values are stored as plain hex so the palette can evolve without
 * a migration.
 */
export const CATEGORY_COLOR_PALETTE = [
  "#7C3AED",
  "#1D4ED8",
  "#065F46",
  "#92400E",
  "#9F1239",
  "#1E3A5F",
  "#0F766E",
  "#BE185D",
  "#0369A1",
  "#4D7C0F",
] as const

export const categoryColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Pick a color")

export const saveCategoryInput = z.object({
  id: z.uuid().optional(),
  slug: categorySlugSchema,
  color: categoryColorSchema,
  nameEn: z.string().trim().min(1, "The English name is required").max(100),
  nameFr: z.string().trim().max(100).default(""),
})
export type SaveCategoryInput = z.infer<typeof saveCategoryInput>

export const categoryIdInput = z.object({ id: z.uuid() })

export const listPublicCategoriesInput = z.object({
  locale: localeSchema.default("en"),
})
