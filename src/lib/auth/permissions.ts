import { createAccessControl } from "better-auth/plugins/access"
import {
  adminAc as globalAdminAc,
  defaultAc as globalDefaultAc,
  userAc as globalUserAc,
} from "better-auth/plugins/admin/access"
import { defaultStatements as orgDefaultStatements } from "better-auth/plugins/organization/access"

/**
 * Shared auth-contracts — the single source of truth for roles
 * and permissions, imported by BOTH the better-auth server plugins and the
 * client plugins/UI so client gating never drifts from server enforcement.
 *
 * Two independent layers (they read different columns, no auto-bridge):
 * - admin plugin  → global `user.role`   → GlobalRole (super_admin short-circuits everything)
 * - org plugin    → `member.role`        → OrgRole (operational/content permissions)
 */

// --- Role enums (tier-1: backend-shared closed sets) ---

export enum GlobalRole {
  SuperAdmin = "super_admin",
  User = "user",
}

export enum OrgRole {
  /** Seeded super_admin's org membership (belt-and-suspenders). */
  Owner = "owner",
  Admin = "admin",
  Secretary = "secretary",
}

// --- The single permanent organization (single-tenant) ---

export const ADF_ORG = {
  name: "Africa Digital Forum",
  slug: "africa-digital-forum",
} as const

// --- Organization-layer access control ---

/** Content that goes through a draft → published workflow. */
const PUBLISHABLE = ["create", "read", "update", "publish", "delete"] as const
const CRUD = ["create", "read", "update", "delete"] as const

export const orgStatements = {
  // better-auth org defaults (organization, member, invitation, team, ac) —
  // kept so team-management checks use the same access controller. member/
  // invitation get a `read` action on top so list views can
  // permission-gate consistently.
  ...orgDefaultStatements,
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "cancel"],
  post: PUBLISHABLE,
  event: PUBLISHABLE,
  speaker: CRUD,
  sponsor: CRUD,
  pageContent: ["read", "update"],
  media: ["upload", "delete"],
  submission: ["read"],
} as const

export const orgAccessControl = createAccessControl(orgStatements)

/** Permission-matrix rows. */
export const orgRoles = {
  // Owner: everything, including the org-default management statements.
  [OrgRole.Owner]: orgAccessControl.newRole(orgStatements),

  // Admin runs the site: publish + delete + team management.
  [OrgRole.Admin]: orgAccessControl.newRole({
    post: PUBLISHABLE,
    event: PUBLISHABLE,
    speaker: CRUD,
    sponsor: CRUD,
    pageContent: ["read", "update"],
    media: ["upload", "delete"],
    submission: ["read"],
    member: ["create", "read", "update", "delete"],
    invitation: ["create", "read", "cancel"],
  }),

  // Secretary drafts/edits but can't publish, delete, or manage people.
  [OrgRole.Secretary]: orgAccessControl.newRole({
    post: ["create", "read", "update"],
    event: ["create", "read", "update"],
    speaker: ["read", "update"],
    sponsor: ["read", "update"],
    pageContent: ["read", "update"],
    media: ["upload"],
    submission: ["read"],
  }),
} as const

/** Passed to both organization() (server) and organizationClient(). */
export const organizationContract = {
  ac: orgAccessControl,
  roles: orgRoles,
} as const

// --- Admin (global) layer — better-auth's built-in admin statements ---

/** Passed to both admin() (server) and adminClient(). */
export const adminContract = {
  ac: globalDefaultAc,
  roles: {
    [GlobalRole.SuperAdmin]: globalAdminAc,
    [GlobalRole.User]: globalUserAc,
  },
} as const

// --- Sync client-side checks (UI gating only — never the security boundary) ---

export type OrgPermissionRequest = {
  [K in keyof typeof orgStatements]?: Array<(typeof orgStatements)[K][number]>
}

export function isSuperAdmin(globalRole: string | null | undefined): boolean {
  return globalRole === GlobalRole.SuperAdmin
}

/**
 * Evaluate org-layer permissions for a member role, with the super_admin
 * short-circuit applied first (guards check the admin layer first).
 */
export function hasOrgPermission(
  {
    globalRole,
    orgRole,
  }: {
    globalRole: string | null | undefined
    orgRole: string | null | undefined
  },
  request: OrgPermissionRequest
): boolean {
  if (isSuperAdmin(globalRole)) return true
  if (!orgRole) return false
  const role = orgRoles[orgRole as OrgRole]
  if (!role) return false
  return role.authorize(request as never).success
}
