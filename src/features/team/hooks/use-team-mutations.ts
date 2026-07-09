import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { teamKeys } from "@/domains/team"
import { authClient, unwrap } from "@/lib/auth/auth-client"
import { getErrorMessage } from "@/lib/error"
import type { InvitableRole } from "../model/team.schemas"

/** Member/invitation actions — all enforced server-side by the org/admin plugins. */
export function useTeamMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: teamKeys.all })

  const updateRole = useMutation({
    mutationFn: async (input: { memberId: string; role: InvitableRole }) =>
      unwrap(
        await authClient.organization.updateMemberRole({
          memberId: input.memberId,
          role: input.role,
        })
      ),
    onSuccess: () => {
      toast.success("Role updated.")
      void invalidate()
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not update the role.")),
  })

  const removeMember = useMutation({
    mutationFn: async (input: { memberId: string }) =>
      unwrap(
        await authClient.organization.removeMember({
          memberIdOrEmail: input.memberId,
        })
      ),
    onSuccess: () => {
      toast.success("Member removed.")
      void invalidate()
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not remove the member.")),
  })

  const cancelInvitation = useMutation({
    mutationFn: async (input: { invitationId: string }) =>
      unwrap(
        await authClient.organization.cancelInvitation({
          invitationId: input.invitationId,
        })
      ),
    onSuccess: () => {
      toast.success("Invitation cancelled.")
      void invalidate()
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not cancel the invitation.")),
  })

  /** super_admin only (admin plugin enforces adminRoles). */
  const banUser = useMutation({
    mutationFn: async (input: { userId: string; reason?: string }) =>
      unwrap(
        await authClient.admin.banUser({
          userId: input.userId,
          banReason: input.reason,
        })
      ),
    onSuccess: () => {
      toast.success("User banned.")
      void invalidate()
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not ban the user.")),
  })

  const unbanUser = useMutation({
    mutationFn: async (input: { userId: string }) =>
      unwrap(await authClient.admin.unbanUser({ userId: input.userId })),
    onSuccess: () => {
      toast.success("User unbanned.")
      void invalidate()
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not unban the user.")),
  })

  return { updateRole, removeMember, cancelInvitation, banUser, unbanUser }
}
