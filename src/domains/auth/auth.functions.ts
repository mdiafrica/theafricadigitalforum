import { and, eq } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { auth } from "@/server/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { invitationPreviewInput } from "./auth.schemas"

/**
 * Session context for guards + UI: the better-auth session plus the caller's
 * org-member role (one server round trip for everything gating needs).
 */
export const getSessionContext = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await auth.api.getSession({
      headers: getRequest().headers,
    })
    if (!result) return null

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

    return { user: result.user, session: result.session, orgRole }
  }
)

/** Inferred — no hand-written DTO. */
export type SessionContext = NonNullable<
  Awaited<ReturnType<typeof getSessionContext>>
>

/**
 * Public invitation preview for the accept page (awf pattern: better-auth's
 * own getInvitation requires a signed-in matching user, which the invitee
 * doesn't have yet). Exposes only what the page needs.
 */
export const getInvitationPreview = createServerFn({ method: "GET" })
  .validator(invitationPreviewInput)
  .handler(async ({ data }) => {
    const invitation = await db.query.invitation.findFirst({
      where: eq(schema.invitation.id, data.invitationId),
      with: {
        inviter: { columns: { name: true, email: true } },
      },
    })
    if (!invitation) return null

    const existingInvitee = await db.query.user.findFirst({
      where: eq(schema.user.email, invitation.email),
      columns: { id: true },
    })

    return {
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expired: invitation.expiresAt.getTime() < Date.now(),
      inviterName: invitation.inviter.name || invitation.inviter.email,
      inviteeHasAccount: !!existingInvitee,
    }
  })

export type InvitationPreview = NonNullable<
  Awaited<ReturnType<typeof getInvitationPreview>>
>
