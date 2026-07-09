import { and, eq } from "drizzle-orm"
import { createMiddleware } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import {
  type OrgPermissionRequest,
  hasOrgPermission,
} from "@/lib/auth/permissions"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

/**
 * THE security boundary: every server fn touching private data attaches one
 * of these. Route beforeLoad guards are UX only.
 */

/** Requires a signed-in user; exposes `context.auth` to the handler. */
export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const result = await auth.api.getSession({
      headers: getRequest().headers,
    })
    if (!result) throw new Error("UNAUTHORIZED: sign in required")

    let orgRole: string | null = null
    if (result.session.activeOrganizationId) {
      const membership = await db.query.member.findFirst({
        where: and(
          eq(schema.member.userId, result.user.id),
          eq(schema.member.organizationId, result.session.activeOrganizationId)
        ),
        columns: { role: true },
      })
      orgRole = membership?.role ?? null
    }

    return next({
      context: {
        auth: { user: result.user, session: result.session, orgRole },
      },
    })
  }
)

/**
 * Permission gate on top of authMiddleware. Evaluates the shared contracts
 * (same objects the plugins enforce) against the caller's stored roles —
 * super_admin short-circuits first.
 *
 *   createServerFn().middleware([requireOrgPermission({ post: ["publish"] })])
 */
export function requireOrgPermission(request: OrgPermissionRequest) {
  return createMiddleware({ type: "function" })
    .middleware([authMiddleware])
    .server(async ({ next, context }) => {
      const { user, orgRole } = context.auth
      const allowed = hasOrgPermission(
        { globalRole: user.role, orgRole },
        request
      )
      if (!allowed) {
        throw new Error("FORBIDDEN: you don't have permission for this action")
      }
      return next()
    })
}

/**
 * In-handler check for permissions that depend on the payload (e.g. a `save`
 * fn that must require `create` when inserting but only `update` when
 * editing — middleware is static, so the extra verb is asserted here).
 */
export function assertOrgPermission(
  auth: { user: { role?: string | null }; orgRole: string | null },
  request: OrgPermissionRequest
) {
  const allowed = hasOrgPermission(
    { globalRole: auth.user.role, orgRole: auth.orgRole },
    request
  )
  if (!allowed) {
    throw new Error("FORBIDDEN: you don't have permission for this action")
  }
}
