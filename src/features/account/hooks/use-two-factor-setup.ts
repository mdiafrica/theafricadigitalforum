import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { useInvalidateSession } from "@/domains/auth"
import { authClient, unwrap } from "@/lib/auth/auth-client"
import { getErrorMessage } from "@/lib/error"

export type TwoFactorStep =
  "idle" | "password-prompt" | "showing-uri" | "verify-code" | "done"

/**
 * TOTP setup state machine: password → QR/URI → verify code →
 * backup codes. Disable is a single password-confirmed call.
 */
export function useTwoFactorSetup() {
  const invalidateSession = useInvalidateSession()
  const [step, setStep] = React.useState<TwoFactorStep>("idle")
  const [totpUri, setTotpUri] = React.useState("")
  const [backupCodes, setBackupCodes] = React.useState<string[]>([])

  const enableMutation = useMutation({
    mutationFn: async (password: string) =>
      unwrap(await authClient.twoFactor.enable({ password })),
    onSuccess: (data) => {
      setTotpUri(data?.totpURI ?? "")
      setBackupCodes(data?.backupCodes ?? [])
      setStep("showing-uri")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't start 2FA setup."))
      setStep("idle")
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async (code: string) =>
      unwrap(await authClient.twoFactor.verifyTotp({ code })),
    onSuccess: () => {
      toast.success("Two-factor authentication enabled.")
      setStep("done")
      invalidateSession()
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "That code didn't work. Try again."))
    },
  })

  const disableMutation = useMutation({
    mutationFn: async (password: string) =>
      unwrap(await authClient.twoFactor.disable({ password })),
    onSuccess: () => {
      toast.success("Two-factor authentication disabled.")
      reset()
      invalidateSession()
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't disable 2FA."))
    },
  })

  function start() {
    setStep("password-prompt")
  }

  function submitPassword(password: string) {
    enableMutation.mutate(password)
  }

  function proceedToVerify() {
    setStep("verify-code")
  }

  function verify(code: string) {
    verifyMutation.mutate(code)
  }

  function disable(password: string) {
    disableMutation.mutate(password)
  }

  function reset() {
    setStep("idle")
    setTotpUri("")
    setBackupCodes([])
  }

  return {
    step,
    totpUri,
    backupCodes,
    start,
    submitPassword,
    proceedToVerify,
    verify,
    disable,
    reset,
    isEnabling: enableMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isDisabling: disableMutation.isPending,
  }
}
