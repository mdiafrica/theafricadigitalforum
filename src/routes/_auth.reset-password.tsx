import { Link, createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ResetPasswordForm } from "@/features/password-reset/ui/reset-password-form"

/** better-auth appends ?token=… to the redirectTo link in the reset email. */
export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: z.object({ token: z.string().optional() }),
  head: () => ({ meta: [{ title: "Reset password | Africa Digital Forum" }] }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid reset link</CardTitle>
          <CardDescription>
            This link is missing its token — it may have been truncated. Request
            a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            render={<Link to="/forgot-password" />}
          >
            Request a new link
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <ResetPasswordForm token={token} />
}
