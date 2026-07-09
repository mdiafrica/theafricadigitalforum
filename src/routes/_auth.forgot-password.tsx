import { createFileRoute } from "@tanstack/react-router"

import { ForgotPasswordForm } from "@/features/password-reset/ui/forgot-password-form"

export const Route = createFileRoute("/_auth/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password | Africa Digital Forum" }] }),
  component: ForgotPasswordForm,
})
