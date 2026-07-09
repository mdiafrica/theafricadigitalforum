import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { teamKeys } from "@/domains/team"
import { authClient, unwrap } from "@/lib/auth/auth-client"
import { getErrorMessage } from "@/lib/error"
import {
  type InviteMemberInput,
  defaultInviteMemberValues,
  inviteMemberSchema,
} from "../model/team.schemas"

export function useInviteMemberForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (input: InviteMemberInput) =>
      unwrap(
        await authClient.organization.inviteMember({
          email: input.email,
          role: input.role,
        })
      ),
    onSuccess: (_data, input) => {
      toast.success(`Invitation sent to ${input.email}.`)
      void queryClient.invalidateQueries({ queryKey: teamKeys.all })
      form.reset()
      onSuccess?.()
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not send the invitation.")),
  })

  const form = useForm({
    defaultValues: defaultInviteMemberValues,
    validators: { onSubmit: inviteMemberSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value).catch(() => {})
    },
  })

  return { form, isSubmitting: mutation.isPending }
}
