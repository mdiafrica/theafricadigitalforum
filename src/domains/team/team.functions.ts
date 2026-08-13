import { eq } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { authMiddleware, requireOrgPermission } from "@/domains/auth"
import { OrgRole, isSuperAdmin } from "@/lib/auth/permissions"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { updateMemberProfileInput, updateMyProfileInput } from "./team.schemas"

/**
 * Profile fields (name/bio) live on the user row and have no org-plugin
 * endpoint, so they go through server functions. Role changes stay on the
 * better-auth org client (`updateMemberRole`).
 */

export const updateMemberProfile = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ member: ["update"] })])
  .validator(updateMemberProfileInput)
  .handler(async ({ data, context }) => {
    const target = await db.query.member.findFirst({
      where: eq(schema.member.userId, data.userId),
      columns: { role: true },
    })
    if (!target) throw new Error("Member not found")

    const caller = context.auth
    const callerIsOwner =
      caller.orgRole === OrgRole.Owner || isSuperAdmin(caller.user.role)
    if (target.role === OrgRole.Owner && !callerIsOwner) {
      throw new Error("FORBIDDEN: only the owner can edit the owner's profile")
    }

    await db
      .update(schema.user)
      .set({ name: data.name, bio: data.bio || null })
      .where(eq(schema.user.id, data.userId))
    return { userId: data.userId }
  })

/** Current profile fields for the edit dialog (bio isn't in the org payload). */
export const getMemberProfile = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ member: ["read"] })])
  .validator(updateMemberProfileInput.pick({ userId: true }))
  .handler(async ({ data }) => {
    const row = await db.query.user.findFirst({
      where: eq(schema.user.id, data.userId),
      columns: { id: true, name: true, bio: true },
    })
    if (!row) throw new Error("User not found")
    return { userId: row.id, name: row.name, bio: row.bio ?? "" }
  })

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const row = await db.query.user.findFirst({
      where: eq(schema.user.id, context.auth.user.id),
      columns: { id: true, name: true, bio: true },
    })
    if (!row) throw new Error("User not found")
    return { userId: row.id, name: row.name, bio: row.bio ?? "" }
  })

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateMyProfileInput)
  .handler(async ({ data, context }) => {
    await db
      .update(schema.user)
      .set({ name: data.name, bio: data.bio || null })
      .where(eq(schema.user.id, context.auth.user.id))
    return { userId: context.auth.user.id }
  })
