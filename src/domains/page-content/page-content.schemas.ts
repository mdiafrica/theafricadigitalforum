import { z } from "zod"

import { localeSchema } from "@/lib/schemas"

const keySchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only")

/** JSON-safe value (mirrors schema PostBodyNode's JsonValue). */
const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
)

export const savePageContentInput = z.object({
  page: keySchema,
  section: keySchema,
  locale: localeSchema,
  data: z.record(z.string(), jsonValueSchema),
})
export type SavePageContentInput = z.infer<typeof savePageContentInput>

export const getPageContentInput = z.object({
  page: keySchema,
  locale: localeSchema.default("en"),
})
export type GetPageContentInput = z.infer<typeof getPageContentInput>

export const listPageContentAdminInput = z.object({
  page: keySchema,
})
