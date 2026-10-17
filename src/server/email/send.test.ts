import { beforeEach, describe, expect, it, vi } from "vitest"

import { sendEmail } from "./index"

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }))

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock }
  },
}))

vi.mock("@/env", () => ({
  env: {
    RESEND_API_KEY: "re_test",
    MAIL_DEFAULT_EMAIL: "noreply@example.com",
    MAIL_DEFAULT_NAME: "Africa Digital Forum",
    MAIL_REPLY_TO: "contact@example.com",
  },
}))

describe("sendEmail", () => {
  beforeEach(() => {
    sendMock.mockReset()
    sendMock.mockResolvedValue({ data: { id: "email-id" }, error: null })
  })

  it("renders and sends an invitation through Resend", async () => {
    await sendEmail("invitation", "invitee@example.com", {
      inviteLink: "https://example.com/accept-invitation/test-id",
      invitedByName: "Test Admin",
      invitedByEmail: "admin@example.com",
      role: "editor",
    })

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Africa Digital Forum" <noreply@example.com>',
        to: "invitee@example.com",
        replyTo: "contact@example.com",
        subject: "Join the Africa Digital Forum team",
        html: expect.stringContaining("Test Admin"),
      })
    )
  })

  it("maps inline attachment content IDs to Resend's attachment format", async () => {
    const content = Buffer.from("image")

    await sendEmail(
      "registration-confirmation",
      "attendee@example.com",
      {
        name: "Test User",
        title: "Dr",
        reference: "ADF-12345678",
        passName: "General",
        waived: false,
      },
      [{ filename: "pass.png", content, contentType: "image/png", cid: "pass" }]
    )

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          {
            filename: "pass.png",
            content,
            contentType: "image/png",
            contentId: "pass",
          },
        ],
      })
    )
  })

  it("sends the contact confirmation and newsletter welcome with social links", async () => {
    await sendEmail("contact-confirmation", "visitor@example.com", {
      name: "Visitor",
    })
    await sendEmail("newsletter-welcome", "visitor@example.com", {})

    const [contact, newsletter] = sendMock.mock.calls.map(
      ([payload]) => payload as { subject: string; html: string }
    )
    expect(contact.subject).toBe("We have received your message")
    expect(contact.html).toContain("Visitor")
    expect(newsletter.subject).toBe(
      "Welcome to the Africa Digital Forum newsletter"
    )
    for (const { html } of [contact, newsletter]) {
      expect(html).toContain("linkedin.com/company/theafricadigitalforum")
      expect(html).toContain("x.com/ADFafrica")
    }
  })

  it("throws and logs when Resend returns an error", async () => {
    const error = new Error("Resend rejected the message")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    sendMock.mockResolvedValueOnce({ data: null, error })

    await expect(
      sendEmail("invitation", "invitee@example.com", {
        inviteLink: "https://example.com/invite",
        invitedByName: "Test Admin",
        invitedByEmail: "admin@example.com",
        role: "editor",
      })
    ).rejects.toThrow("Resend rejected the message")

    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
