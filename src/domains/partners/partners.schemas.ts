import { z } from "zod"

import { urlOrEmpty } from "@/lib/schemas"

export const PARTNER_TIERS = [
  "host",
  "cohosts",
  "title",
  "platinum",
  "diamond",
  "gold",
  "silver",
] as const
export const partnerTierSchema = z.enum(PARTNER_TIERS)
export type PartnerTier = (typeof PARTNER_TIERS)[number]

export const savePartnerInput = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Name is required").max(200),
  logoMediaId: z.uuid().nullish(),
  websiteUrl: urlOrEmpty,
  tier: partnerTierSchema,
  sortOrder: z.number().int().min(0).max(10_000).default(0),
})
export type SavePartnerInput = z.infer<typeof savePartnerInput>

export const partnerIdInput = z.object({ id: z.uuid() })
