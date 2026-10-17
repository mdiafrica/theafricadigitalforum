import { createHmac, timingSafeEqual } from "node:crypto"

import { env } from "@/env"

/**
 * Minimal Stripe client over the REST API (no SDK dependency): create a
 * Checkout Session and verify webhook signatures.
 */

const API = "https://api.stripe.com/v1"
const TOLERANCE_SECONDS = 300

export const stripeEnabled = () => Boolean(env.STRIPE_SECRET_KEY)

export interface CheckoutInput {
  reference: string
  email: string
  productName: string
  amountUsd: number
  locale: "en" | "fr"
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(input: CheckoutInput) {
  const secret = env.STRIPE_SECRET_KEY
  if (!secret) throw new Error("Stripe is not configured.")

  const body = new URLSearchParams({
    mode: "payment",
    client_reference_id: input.reference,
    customer_email: input.email,
    locale: input.locale,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(
      Math.round(input.amountUsd * 100)
    ),
    "line_items[0][price_data][product_data][name]": input.productName,
    "metadata[reference]": input.reference,
    "metadata[locale]": input.locale,
    "payment_intent_data[metadata][reference]": input.reference,
  })

  const response = await fetch(`${API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `checkout-${input.reference}`,
    },
    body,
  })
  const json = (await response.json()) as {
    id?: string
    url?: string
    error?: { message?: string }
  }
  if (!response.ok || !json.url) {
    throw new Error(json.error?.message ?? "Stripe could not start checkout.")
  }
  return { id: json.id!, url: json.url }
}

/** Verifies the `Stripe-Signature` header against the raw request body. */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  now = Date.now()
) {
  if (!header) return false
  const parts = header.split(",").map((part) => part.trim().split("="))
  const timestamp = parts.find(([key]) => key === "t")?.[1]
  const signatures = parts.filter(([key]) => key === "v1").map(([, v]) => v)
  if (!timestamp || signatures.length === 0) return false
  if (Math.abs(now / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) {
    return false
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest()
  return signatures.some((signature) => {
    const candidate = Buffer.from(signature, "hex")
    return (
      candidate.length === expected.length &&
      timingSafeEqual(candidate, expected)
    )
  })
}
