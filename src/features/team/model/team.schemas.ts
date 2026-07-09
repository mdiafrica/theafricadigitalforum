import { z } from "zod"

import { OrgRole } from "@/lib/auth/permissions"

/** Tier-2 options array: FE set needing labels. */
export const INVITABLE_ROLE_OPTIONS = [
  { value: OrgRole.Admin, label: "Admin" },
  { value: OrgRole.Secretary, label: "Secretary" },
] as const

export const invitableRole = z.union([
  z.literal(OrgRole.Admin),
  z.literal(OrgRole.Secretary),
])
export type InvitableRole = z.infer<typeof invitableRole>

export const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email address"),
  role: invitableRole,
})
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>

export const defaultInviteMemberValues: InviteMemberInput = {
  email: "",
  role: OrgRole.Secretary,
}
