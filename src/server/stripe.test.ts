import { createHmac } from "node:crypto"
import { describe, expect, it } from "vitest"

import { verifyStripeSignature } from "./stripe"

const secret = "whsec_test"
const payload = '{"id":"evt_1"}'
const seconds = 1_700_000_000
const now = seconds * 1000

function sign(timestamp: number, body = payload) {
  const v1 = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex")
  return `t=${timestamp},v1=${v1}`
}

describe("verifyStripeSignature", () => {
  it("accepts a valid signature", () => {
    expect(verifyStripeSignature(payload, sign(seconds), secret, now)).toBe(
      true
    )
  })

  it("rejects a tampered payload", () => {
    expect(
      verifyStripeSignature(payload + "x", sign(seconds), secret, now)
    ).toBe(false)
  })

  it("rejects a wrong secret", () => {
    expect(
      verifyStripeSignature(payload, sign(seconds), "whsec_other", now)
    ).toBe(false)
  })

  it("rejects a stale timestamp", () => {
    expect(
      verifyStripeSignature(payload, sign(seconds - 3600), secret, now)
    ).toBe(false)
  })

  it("rejects a missing or malformed header", () => {
    expect(verifyStripeSignature(payload, null, secret, now)).toBe(false)
    expect(verifyStripeSignature(payload, "garbage", secret, now)).toBe(false)
  })
})
