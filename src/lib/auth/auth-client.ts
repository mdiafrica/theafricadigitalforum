import {
  adminClient,
  organizationClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { adminContract, organizationContract } from "./permissions"

/**
 * better-auth client — same-origin (no baseURL), plugin set mirroring the
 * server, wired to the shared contracts so checkRolePermission/hasPermission
 * evaluate the exact roles the server enforces.
 */
export const authClient = createAuthClient({
  plugins: [
    adminClient({ roles: adminContract.roles }),
    organizationClient(organizationContract),
    usernameClient(),
    twoFactorClient(),
  ],
})

export type AuthSession = typeof authClient.$Infer.Session

/**
 * better-auth client calls return `{ data, error }` — unwrap to throw-style
 * so mutations and hooks handle failures uniformly.
 */
export function unwrap<T>(result: {
  data?: T | null
  error?: { message?: string; statusText?: string } | null
}): T {
  if (result.error) {
    throw new Error(
      result.error.message || result.error.statusText || "Authentication error"
    )
  }
  return result.data as T
}
