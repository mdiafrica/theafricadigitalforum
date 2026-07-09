import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

import { sessionQueryOptions } from "@/domains/auth"
import { SignInForm } from "@/features/sign-in/ui/sign-in-form"

export const Route = createFileRoute("/_auth/sign-in")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      sessionQueryOptions()
    )
    if (session) throw redirect({ to: "/admin" })
  },
  head: () => ({ meta: [{ title: "Sign in | Africa Digital Forum" }] }),
  component: SignInPage,
})

function SignInPage() {
  const { redirect: redirectTo } = Route.useSearch()
  return <SignInForm redirectTo={redirectTo} />
}
