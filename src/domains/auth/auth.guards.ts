import { redirect } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

import { isSuperAdmin } from "@/lib/auth/permissions"
import type { SessionContext } from "./auth.functions"
import { sessionQueryOptions } from "./auth.queries"

/**
 * Route beforeLoad guards — UX only (fast redirects); the real security
 * boundary is the server-fn middleware.
 */

interface GuardArgs {
  context: { queryClient: QueryClient }
  location: { href: string }
}

/** Signed-in or redirect to /sign-in (with return-to). */
export async function requireAuth({
  context,
  location,
}: GuardArgs): Promise<SessionContext> {
  const session = await context.queryClient.ensureQueryData(
    sessionQueryOptions()
  )
  if (!session) {
    throw redirect({ to: "/sign-in", search: { redirect: location.href } })
  }
  return session
}

/** Staff = super_admin or any org member — the /admin shell gate. */
export async function requireStaff(args: GuardArgs): Promise<SessionContext> {
  const session = await requireAuth(args)
  const isStaff = isSuperAdmin(session.user.role) || session.orgRole !== null
  if (!isStaff) throw redirect({ to: "/" })
  return session
}
