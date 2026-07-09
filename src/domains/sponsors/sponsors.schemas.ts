import { z } from "zod"

import { urlOrEmpty } from "@/lib/schemas"

export const SPONSOR_TIERS = ["platinum", "gold", "silver", "partner"] as const
export const sponsorTierSchema = z.enum(SPONSOR_TIERS)

export const saveSponsorInput = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Name is required").max(200),
  logoMediaId: z.uuid().nullish(),
  websiteUrl: urlOrEmpty,
  tier: z.union([sponsorTierSchema, z.literal("")]).default(""),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
})
export type SaveSponsorInput = z.infer<typeof saveSponsorInput>

export const sponsorIdInput = z.object({ id: z.uuid() })
