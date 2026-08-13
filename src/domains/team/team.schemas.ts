import { z } from "zod"

export const bioSchema = z
  .string()
  .trim()
  .max(500, "Keep the bio under 500 characters")
  .default("")

export const updateMemberProfileInput = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(200),
  bio: bioSchema,
})
export type UpdateMemberProfileInput = z.infer<typeof updateMemberProfileInput>

export const updateMyProfileInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  bio: bioSchema,
})
export type UpdateMyProfileInput = z.infer<typeof updateMyProfileInput>
