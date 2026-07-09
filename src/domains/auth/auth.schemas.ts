import { z } from "zod"

/** Isomorphic zod schemas — shared by server fns + forms. */

export const invitationPreviewInput = z.object({
  invitationId: z.string().min(1),
})
export type InvitationPreviewInput = z.infer<typeof invitationPreviewInput>
