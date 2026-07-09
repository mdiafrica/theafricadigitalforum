import { parseArgs } from "node:util"
import { eq } from "drizzle-orm"

import { env } from "@/env"
import { GlobalRole, OrgRole } from "@/lib/auth/permissions"
import { ADF_ORG, auth } from "../auth"
import { db } from "../db"
import * as schema from "../db/schema"

/**
 * Seed the super_admin account + the single permanent org.
 * Idempotent — safe to re-run: existing user/org/membership are kept.
 *
 *   pnpm db:seed [-- --email a@b.c --username admin --name "Super Admin"]
 *
 * Password comes from SEED_ADMIN_PASSWORD (never a CLI arg — stays out of
 * shell history and process lists).
 */

const { values: args } = parseArgs({
  options: {
    email: { type: "string", default: "admin@africadigitalforum.org" },
    username: { type: "string", default: "admin" },
    name: { type: "string", default: "Super Admin" },
  },
})

async function main() {
  const email = args.email!.trim().toLowerCase()
  const username = args.username!.trim()
  const name = args.name!.trim()

  // --- 1. super_admin user ---
  let user = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
    columns: { id: true, role: true },
  })

  if (user) {
    console.log(`user: exists (${email})`)
    if (user.role !== GlobalRole.SuperAdmin) {
      await db
        .update(schema.user)
        .set({ role: GlobalRole.SuperAdmin })
        .where(eq(schema.user.id, user.id))
      console.log("user: role promoted to super_admin")
    }
  } else {
    const created = await auth.api.createUser({
      body: {
        email,
        name,
        password: env.SEED_ADMIN_PASSWORD,
        role: GlobalRole.SuperAdmin,
        data: { username, emailVerified: true },
      },
    })
    user = { id: created.user.id, role: GlobalRole.SuperAdmin }
    // Belt-and-suspenders (awf pattern): guarantee the flag regardless of
    // how createUser treats `data`.
    await db
      .update(schema.user)
      .set({ emailVerified: true })
      .where(eq(schema.user.id, user.id))
    console.log(`user: created (${email}, super_admin)`)
  }

  // --- 2. the single org ---
  let org = await db.query.organization.findFirst({
    where: eq(schema.organization.slug, ADF_ORG.slug),
    columns: { id: true },
  })

  if (org) {
    console.log(`org: exists (${ADF_ORG.slug})`)
  } else {
    const created = await auth.api.createOrganization({
      body: {
        name: ADF_ORG.name,
        slug: ADF_ORG.slug,
        // Creator: membership row is created with the creator role (owner).
        userId: user.id,
      },
    })
    if (!created) throw new Error("createOrganization returned null")
    org = { id: created.id }
    console.log(`org: created (${ADF_ORG.slug})`)
  }

  // --- 3. owner membership (covers pre-existing user + pre-existing org) ---
  const membership = await db.query.member.findFirst({
    where: eq(schema.member.userId, user.id),
    columns: { id: true, role: true },
  })

  if (membership) {
    console.log(`membership: exists (${membership.role})`)
  } else {
    await auth.api.addMember({
      body: {
        userId: user.id,
        organizationId: org.id,
        role: OrgRole.Owner,
      },
    })
    console.log("membership: owner added")
  }

  console.log("✓ seed complete")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("seed failed:", error)
    process.exit(1)
  })
