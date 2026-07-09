import { describe, expect, it } from "vitest"

import { sendEmail } from "./index"

/**
 * Integration test — requires the dev containers (`docker compose up -d`):
 * sends through the real transport into Mailpit and asserts via its API.
 * Run explicitly: pnpm vitest run src/server/email/send.integration.test.ts
 */
const MAILPIT_API = `http://localhost:${process.env.MAILPIT_UI_PORT ?? "8026"}/api/v1`

describe("sendEmail (integration, needs docker compose up)", () => {
  it("renders and delivers the invitation email to Mailpit", async () => {
    const to = `invite-test-${Date.now()}@example.test`

    await sendEmail("invitation", to, {
      inviteLink: "http://localhost:3000/accept-invitation/test-id",
      invitedByName: "Test Admin",
      invitedByEmail: "admin@example.test",
      role: "secretary",
    })

    const res = await fetch(`${MAILPIT_API}/search?query=to:"${to}"`)
    const body = (await res.json()) as {
      messages: Array<{ Subject: string; To: Array<{ Address: string }> }>
    }

    expect(body.messages).toHaveLength(1)
    expect(body.messages[0].Subject).toBe("Join the Africa Digital Forum team")
    expect(body.messages[0].To[0].Address).toBe(to)
  })

  it("delivers the reset-password email", async () => {
    const to = `reset-test-${Date.now()}@example.test`

    await sendEmail("reset-password", to, {
      name: "Test User",
      resetLink: "http://localhost:3000/reset-password?token=test",
    })

    const res = await fetch(`${MAILPIT_API}/search?query=to:"${to}"`)
    const body = (await res.json()) as { messages: Array<{ Subject: string }> }

    expect(body.messages).toHaveLength(1)
    expect(body.messages[0].Subject).toBe(
      "Reset your Africa Digital Forum password"
    )
  })
})
