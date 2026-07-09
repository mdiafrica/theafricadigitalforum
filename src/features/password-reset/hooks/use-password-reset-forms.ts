import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { authClient, unwrap } from "@/lib/auth/auth-client"
import { getErrorMessage } from "@/lib/error"
import {
  type ForgotPasswordInput,
  type ResetPasswordInput,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../model/password-reset.schemas"

export function useForgotPasswordForm() {
  const [sent, setSent] = useState(false)

  const mutation = useMutation({
    mutationFn: async (input: ForgotPasswordInput) =>
      unwrap(
        await authClient.requestPasswordReset({
          email: input.email,
          redirectTo: "/reset-password",
        })
      ),
    // Always the same outcome — success shape never leaks whether the
    // account exists.
    onSuccess: () => setSent(true),
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not send the reset email.")),
  })

  const form = useForm({
    defaultValues: { email: "" } as ForgotPasswordInput,
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value).catch(() => {})
    },
  })

  return { form, sent, isSubmitting: mutation.isPending }
}

export function useResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (input: ResetPasswordInput) =>
      unwrap(
        await authClient.resetPassword({ newPassword: input.password, token })
      ),
    onSuccess: () => {
      toast.success("Password updated — sign in with your new password.")
      void navigate({ to: "/sign-in" })
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(
          error,
          "Could not reset your password. The link may have expired."
        )
      ),
  })

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" } as ResetPasswordInput,
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value).catch(() => {})
    },
  })

  return { form, isSubmitting: mutation.isPending }
}
