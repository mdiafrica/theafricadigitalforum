import { z } from "zod"

import { urlOrEmpty } from "@/lib/schemas"

export const savePartnerInput = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Name is required").max(200),
  logoMediaId: z.uuid().nullish(),
  websiteUrl: urlOrEmpty,
  tier: z.string().trim().min(1, "Category is required").max(80),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
})
export type SavePartnerInput = z.infer<typeof savePartnerInput>

export const partnerIdInput = z.object({ id: z.uuid() })

export const savePartnerCategoryInput = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Name is required").max(80),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
})
export type SavePartnerCategoryInput = z.infer<typeof savePartnerCategoryInput>
