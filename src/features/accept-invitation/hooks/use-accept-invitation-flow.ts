import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { invitationPreviewQueryOptions, useSessionQuery } from "@/domains/auth"
import { authClient, unwrap } from "@/lib/auth/auth-client"
import { getErrorMessage } from "@/lib/error"
import {
  type ExistingUserInput,
  type NewUserInput,
  existingUserSchema,
  newUserSchema,
} from "../model/accept-invitation.schemas"

export type AcceptInvitationStep =
  | "loading"
  | "invalid"
  | "authed-confirm"
  | "mismatch"
  | "existing-user"
  | "new-user"

/**
 * Invite → accept flow: the invite link proves email ownership, so there is
 * no OTP verification step. New users: gated signUp → signIn →
 * acceptInvitation. Existing users: signIn → accept.
 */
export function useAcceptInvitationFlow(invitationId: string) {
  const navigate = useNavigate()
  const previewQuery = useQuery(invitationPreviewQueryOptions(invitationId))
  const sessionQuery = useSessionQuery()

  const preview = previewQuery.data ?? null
  const session = sessionQuery.data ?? null

  // Full navigation on purpose: busts the session cookie-cache so the new
  // org membership is live for every guard.
  const finish = () => {
    toast.success("Welcome to the Africa Digital Forum team!")
    window.location.assign("/admin")
  }

  const accept = async () => {
    unwrap(await authClient.organization.acceptInvitation({ invitationId }))
  }

  const acceptMutation = useMutation({
    mutationFn: accept,
    onSuccess: finish,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not accept the invitation.")),
  })

  const newUserMutation = useMutation({
    mutationFn: async (input: NewUserInput) => {
      if (!preview) throw new Error("Invitation not loaded.")
      // Sign-up is invite-gated server-side; autoSignIn is off, so sign in
      // explicitly before the session-bound accept call.
      unwrap(
        await authClient.signUp.email({
          email: preview.email,
          name: input.name,
          username: input.username,
          password: input.password,
        })
      )
      unwrap(
        await authClient.signIn.email({
          email: preview.email,
          password: input.password,
        })
      )
      await accept()
    },
    onSuccess: finish,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not create your account.")),
  })

  const existingUserMutation = useMutation({
    mutationFn: async (input: ExistingUserInput) => {
      if (!preview) throw new Error("Invitation not loaded.")
      const result = unwrap(
        await authClient.signIn.email({
          email: preview.email,
          password: input.password,
        })
      )
      // Rare edge: the invitee has TOTP enabled — finish 2FA on the sign-in
      // page, then come back here.
      if (result && "twoFactorRedirect" in result && result.twoFactorRedirect) {
        void navigate({
          to: "/sign-in",
          search: { redirect: `/accept-invitation/${invitationId}` },
        })
        return "two-factor" as const
      }
      await accept()
      return "done" as const
    },
    onSuccess: (outcome) => {
      if (outcome === "done") finish()
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(error, "Sign-in failed. Check your password.")
      ),
  })

  const newUserForm = useForm({
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    } as NewUserInput,
    validators: { onSubmit: newUserSchema },
    onSubmit: async ({ value }) => {
      await newUserMutation.mutateAsync(value).catch(() => {})
    },
  })

  const existingUserForm = useForm({
    defaultValues: { password: "" } as ExistingUserInput,
    validators: { onSubmit: existingUserSchema },
    onSubmit: async ({ value }) => {
      await existingUserMutation.mutateAsync(value).catch(() => {})
    },
  })

  const step: AcceptInvitationStep =
    previewQuery.isPending || sessionQuery.isPending
      ? "loading"
      : !preview || preview.status !== "pending" || preview.expired
        ? "invalid"
        : session
          ? session.user.email === preview.email
            ? "authed-confirm"
            : "mismatch"
          : preview.inviteeHasAccount
            ? "existing-user"
            : "new-user"

  return {
    step,
    preview,
    session,
    newUserForm,
    existingUserForm,
    acceptMutation,
    isSubmitting:
      newUserMutation.isPending ||
      existingUserMutation.isPending ||
      acceptMutation.isPending,
  }
}
