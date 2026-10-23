import { describe, expect, it } from "vitest"

import { registrationInput } from "./registrations.schemas"

const base = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  jobTitle: "Engineer",
  organization: "ADF",
  country: "Togo",
  passTier: "general",
  interestAreas: [] as string[],
  participationType: "Attendee",
  primaryGoal: "Securing investment for my startup",
  partnershipInterest: "Not at this time",
  communicationsConsent: true,
  termsAccepted: true,
}

describe("registrationInput “Other” answers", () => {
  it("accepts Other with text", () => {
    const result = registrationInput.safeParse({
      ...base,
      participationType: "Other: Government observer",
      primaryGoal: "Other: Find co-founders",
      interestAreas: ["Other: Space tech"],
    })
    expect(result.success).toBe(true)
  })

  it("rejects Other without text", () => {
    const result = registrationInput.safeParse({
      ...base,
      participationType: "Other: ",
    })
    expect(result.success).toBe(false)
  })

  it("rejects unknown values", () => {
    expect(
      registrationInput.safeParse({ ...base, primaryGoal: "Whatever" }).success
    ).toBe(false)
  })
})
