import { randomInt } from "node:crypto"

import type { InferSelectModel } from "drizzle-orm"

import type { registrationCode } from "@/server/db/schema/registrations"

export type RegistrationCodeRow = InferSelectModel<typeof registrationCode>

export const CODE_INVALID_MESSAGE =
  "This access code is invalid or no longer available."

// No 0/O/1/I so codes survive being read aloud or retyped.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateCode() {
  const part = () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join(
      ""
    )
  return `ADF-${part()}-${part()}`
}

/** Returns a user-facing problem, or null when the code can be redeemed. */
export function codeProblem(row: RegistrationCodeRow | undefined) {
  if (!row || !row.active) return CODE_INVALID_MESSAGE
  if (row.expiresAt && row.expiresAt.getTime() < Date.now())
    return CODE_INVALID_MESSAGE
  if (row.maxUses !== null && row.usedCount >= row.maxUses)
    return CODE_INVALID_MESSAGE
  return null
}
