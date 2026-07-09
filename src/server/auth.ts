import { and, eq } from "drizzle-orm"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { admin } from "better-auth/plugins/admin"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { organization } from "better-auth/plugins/organization"
import { twoFactor } from "better-auth/plugins/two-factor"
import { username } from "better-auth/plugins/username"

import { env } from "@/env"
import {
  ADF_ORG,
  GlobalRole,
  adminContract,
  organizationContract,
} from "@/lib/auth/permissions"
import { db } from "./db"
import * as schema from "./db/schema"
import { sendEmail } from "./email"

/**
 * better-auth server instance. Mounted at /api/auth/$.
 * Single-tenant: one permanent org, invite-only accounts, two permission
 * layers (admin plugin = global super_admin; org plugin = admin/secretary).
 */

/** awf's username rule: starts with a letter, 3–30 chars, [a-zA-Z0-9._], no doubled or trailing separators. */
function validateUsername(value: string) {
  return /^[a-zA-Z](?!.*[._]{2})[a-zA-Z0-9._]{2,29}(?<![._])$/.test(value)
}

/** Pending, unexpired invitation for this email — the only door into sign-up. */
async function findOpenInvitation(email: string) {
  const invitation = await db.query.invitation.findFirst({
    where: and(
      eq(schema.invitation.email, email),
      eq(schema.invitation.status, "pending")
    ),
    columns: { id: true, expiresAt: true },
  })
  if (!invitation) return null
  return invitation.expiresAt.getTime() >= Date.now() ? invitation : null
}

export const auth = betterAuth({
  appName: "Africa Digital Forum",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // baseURL is trusted automatically. In prod also trust the public site
  // origin (may differ from the auth origin, e.g. apex vs www); in dev trust
  // any localhost port so the app works whether it runs on 3000, 3005, etc.
  trustedOrigins:
    env.NODE_ENV === "production"
      ? [env.VITE_PUBLIC_SITE_URL]
      : ["http://localhost:*", "http://127.0.0.1:*"],

  database: drizzleAdapter(db, { provider: "pg", schema }),

  emailAndPassword: {
    enabled: true,
    // Explicit sign-in after sign-up (accept-invitation flow controls the sequence).
    autoSignIn: false,
    // The invite link proves email ownership — no verification step.
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail("reset-password", user.email, {
        name: user.name || user.email,
        resetLink: url,
      })
    },
  },

  session: {
    cookieCache: { enabled: true, maxAge: 300 },
  },

  hooks: {
    // Invite-only gate: public sign-up is rejected unless a
    // pending invitation exists for the email. Scoped to the sign-up path so
    // admin-plugin createUser (seed CLI, super_admin actions) is unaffected.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return

      const rawEmail = (ctx.body as { email?: unknown } | undefined)?.email
      if (typeof rawEmail !== "string") return
      const email = rawEmail.trim().toLowerCase()
      if (!email) return

      const existing = await db.query.user.findFirst({
        where: eq(schema.user.email, email),
        columns: { id: true },
      })
      // Let better-auth's own duplicate-user error path handle this so the
      // response shape stays consistent.
      if (existing) return

      if (await findOpenInvitation(email)) return

      throw new APIError("FORBIDDEN", {
        code: "INVITATION_REQUIRED_FOR_SIGN_UP",
        message:
          "Sign-up is by invitation only. Ask an administrator to send you an invitation.",
      })
    }),
  },

  databaseHooks: {
    user: {
      create: {
        // The invite link proves email ownership — mark invited
        // sign-ups verified at creation, no separate verification step.
        async before(user) {
          if (user.emailVerified) return { data: user }
          const invited = await findOpenInvitation(user.email)
          if (!invited) return { data: user }
          return { data: { ...user, emailVerified: true } }
        },
      },
    },
    session: {
      create: {
        // Auto-activate the single org on every session — org
        // permission checks throw NO_ACTIVE_ORGANIZATION without this.
        async before(session) {
          if (session.activeOrganizationId) return { data: session }

          const org = await db.query.organization.findFirst({
            where: eq(schema.organization.slug, ADF_ORG.slug),
            columns: { id: true },
          })
          // Org not seeded yet (fresh install) — leave the session as-is.
          if (!org) return { data: session }

          return { data: { ...session, activeOrganizationId: org.id } }
        },
      },
    },
  },

  plugins: [
    admin({
      // Reuses better-auth's built-in admin ac — only roles need passing
      // (the concrete defaultAc type doesn't satisfy AdminOptions['ac']).
      roles: adminContract.roles,
      adminRoles: [GlobalRole.SuperAdmin],
      defaultRole: GlobalRole.User,
    }),
    username({ usernameValidator: validateUsername }),
    organization({
      ...organizationContract,
      allowUserToCreateOrganization: false,
      disableOrganizationDeletion: true,
      cancelPendingInvitationsOnReInvite: true,
      invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
      sendInvitationEmail: async (data) => {
        await sendEmail("invitation", data.email, {
          inviteLink: new URL(
            `/accept-invitation/${data.id}`,
            env.BETTER_AUTH_URL
          ).toString(),
          invitedByName: data.inviter.user.name || data.inviter.user.email,
          invitedByEmail: data.inviter.user.email,
          role: data.role,
        })
      },
    }),
    twoFactor(),
    // Sets cookies through TanStack Start when auth.api.* is called
    // server-side — must stay the last plugin.
    tanstackStartCookies(),
  ],
})

export type Auth = typeof auth
export { ADF_ORG }
