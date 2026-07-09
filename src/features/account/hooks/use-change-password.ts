import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { authClient, unwrap } from "@/lib/auth/auth-client"
import { getErrorMessage } from "@/lib/error"
import {
  type ChangePasswordInput,
  changePasswordSchema,
  defaultChangePasswordValues,
} from "../model/account.schemas"

export function useChangePassword() {
  const mutation = useMutation({
    mutationFn: async (input: ChangePasswordInput) =>
      unwrap(
        await authClient.changePassword({
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
          revokeOtherSessions: true,
        })
      ),
    onSuccess: () => {
      toast.success("Password updated. Other sessions were signed out.")
      form.reset()
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't update your password."))
    },
  })

  const form = useForm({
    defaultValues: defaultChangePasswordValues,
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value).catch(() => {})
    },
  })

  return { form, isSubmitting: mutation.isPending }
}
