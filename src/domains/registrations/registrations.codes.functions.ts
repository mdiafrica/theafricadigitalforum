import { desc, eq } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import {
  codeProblem,
  generateCode,
  type RegistrationCodeRow,
} from "./registrations.codes"
import {
  createCodeInput,
  registrationIdInput,
  setCodeActiveInput,
  updateCodeInput,
  validateCodeInput,
} from "./registrations.schemas"

/** Public: lets the form confirm a code and lock the pass before submitting. */
export const validateRegistrationCode = createServerFn({ method: "POST" })
  .validator(validateCodeInput)
  .handler(async ({ data }) => {
    const row = await db.query.registrationCode.findFirst({
      where: eq(schema.registrationCode.code, data.code),
    })
    const problem = codeProblem(row)
    if (problem || !row) throw new Error(problem ?? "Invalid code")
    return { label: row.label, passTier: row.passTier }
  })

export const listRegistrationCodes = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ submission: ["read"] })])
  .handler(async () =>
    db.query.registrationCode.findMany({
      orderBy: desc(schema.registrationCode.createdAt),
    })
  )

export type RegistrationCodeItem = RegistrationCodeRow

export const createRegistrationCode = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["update"] })])
  .validator(createCodeInput)
  .handler(async ({ data }) => {
    const code = data.code ?? generateCode()
    const [row] = await db
      .insert(schema.registrationCode)
      .values({
        code,
        label: data.label,
        passTier: data.passTier ?? null,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ?? null,
      })
      .onConflictDoNothing()
      .returning()
    if (!row) throw new Error("That code already exists.")
    return row
  })

export const setRegistrationCodeActive = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["update"] })])
  .validator(setCodeActiveInput)
  .handler(async ({ data }) => {
    await db
      .update(schema.registrationCode)
      .set({ active: data.active })
      .where(eq(schema.registrationCode.id, data.id))
    return { ok: true as const }
  })

export const updateRegistrationCode = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["update"] })])
  .validator(updateCodeInput)
  .handler(async ({ data }) => {
    await db
      .update(schema.registrationCode)
      .set({ expiresAt: data.expiresAt, maxUses: data.maxUses })
      .where(eq(schema.registrationCode.id, data.id))
    return { ok: true as const }
  })

export const deleteRegistrationCode = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ submission: ["delete"] })])
  .validator(registrationIdInput)
  .handler(async ({ data }) => {
    await db
      .delete(schema.registrationCode)
      .where(eq(schema.registrationCode.id, data.id))
    return { ok: true as const }
  })
