import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { authClient, unwrap } from "@/lib/auth/auth-client"
import { getErrorMessage } from "@/lib/error"
import {
  type SignInInput,
  type TotpInput,
  defaultSignInValues,
  signInSchema,
  totpSchema,
} from "../model/sign-in.schemas"

export function useSignInForm({ redirectTo }: { redirectTo?: string }) {
  const [step, setStep] = useState<"credentials" | "totp">("credentials")

  // Full navigation on purpose: busts the better-auth session cookie-cache
  // and re-runs every route guard against the fresh session.
  const finish = () => {
    window.location.assign(redirectTo ?? "/admin")
  }

  const signInMutation = useMutation({
    mutationFn: async (input: SignInInput) => {
      const isEmail = input.identifier.includes("@")
      return isEmail
        ? unwrap(
            await authClient.signIn.email({
              email: input.identifier,
              password: input.password,
            })
          )
        : unwrap(
            await authClient.signIn.username({
              username: input.identifier,
              password: input.password,
            })
          )
    },
    onSuccess: (data) => {
      // Users with TOTP enabled get a challenge instead of a session.
      if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
        setStep("totp")
        return
      }
      finish()
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(error, "Sign-in failed. Check your credentials.")
      ),
  })

  const totpMutation = useMutation({
    mutationFn: async (input: TotpInput) =>
      unwrap(await authClient.twoFactor.verifyTotp({ code: input.code })),
    onSuccess: finish,
    onError: (error) =>
      toast.error(getErrorMessage(error, "That code didn't work. Try again.")),
  })

  const form = useForm({
    defaultValues: defaultSignInValues,
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      await signInMutation.mutateAsync(value).catch(() => {})
    },
  })

  const totpForm = useForm({
    defaultValues: { code: "" } as TotpInput,
    validators: { onSubmit: totpSchema },
    onSubmit: async ({ value }) => {
      await totpMutation.mutateAsync(value).catch(() => {})
    },
  })

  return {
    step,
    form,
    totpForm,
    isSubmitting: signInMutation.isPending || totpMutation.isPending,
  }
}
