import { and, eq } from "drizzle-orm"
import { createFileRoute } from "@tanstack/react-router"

import { sendRegistrationConfirmation } from "@/domains/registrations/registrations.confirmation"
import { env } from "@/env"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { verifyStripeSignature } from "@/server/stripe"

interface CheckoutSessionEvent {
  type: string
  data: {
    object: {
      payment_status?: string
      client_reference_id?: string | null
      metadata?: { reference?: string; locale?: string }
    }
  }
}

const PAID_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
])

/**
 * Stripe webhook: marks the registration paid and sends the confirmation
 * email. The status update is conditional on "pending", so Stripe's retries
 * and duplicate events never send a second email.
 */
export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = env.STRIPE_WEBHOOK_SECRET
        if (!secret)
          return new Response("Webhook not configured", { status: 503 })

        const payload = await request.text()
        if (
          !verifyStripeSignature(
            payload,
            request.headers.get("stripe-signature"),
            secret
          )
        ) {
          return new Response("Invalid signature", { status: 400 })
        }

        const event = JSON.parse(payload) as CheckoutSessionEvent
        const session = event.data.object
        if (!PAID_EVENTS.has(event.type) || session.payment_status !== "paid") {
          return new Response("ignored", { status: 200 })
        }

        const reference =
          session.client_reference_id ?? session.metadata?.reference
        if (!reference) return new Response("no reference", { status: 200 })

        const [row] = await db
          .update(schema.registration)
          .set({ paymentStatus: "paid" })
          .where(
            and(
              eq(schema.registration.reference, reference),
              eq(schema.registration.paymentStatus, "pending")
            )
          )
          .returning()

        if (row) {
          await sendRegistrationConfirmation({
            reference: row.reference,
            email: row.email,
            fullName: row.fullName,
            title: row.title,
            passTier: row.passTier,
            locale: session.metadata?.locale === "fr" ? "fr" : "en",
            paid: true,
          }).catch((error: unknown) => {
            console.error("[stripe] confirmation email failed:", error)
          })
        }
        return new Response("ok", { status: 200 })
      },
    },
  },
})
