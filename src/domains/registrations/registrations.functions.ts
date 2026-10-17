import { randomBytes } from "node:crypto"
import { eq, sql } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { db } from "@/server/db"
import { env } from "@/env"
import * as schema from "@/server/db/schema"
import { createCheckoutSession, stripeEnabled } from "@/server/stripe"
import { codeProblem } from "./registrations.codes"
import { sendRegistrationConfirmation } from "./registrations.confirmation"
import { PASS_TIERS } from "./registrations.options"
import { registrationInput } from "./registrations.schemas"

const newReference = () => `ADF-${randomBytes(4).toString("hex").toUpperCase()}`

/**
 * Public registration endpoint. The registration is saved as "pending" and the
 * visitor is sent to Stripe Checkout (or, without Stripe, the pass stays a
 * reservation), unless a valid access code is redeemed: then payment is "waived" and the code's pass tier
 * (if any) overrides the chosen one. A failed confirmation email never fails
 * the registration.
 */
export const submitRegistration = createServerFn({ method: "POST" })
  .validator(registrationInput)
  .handler(async ({ data }) => {
    const reference = newReference()

    const { passTier, waived } = await db.transaction(async (tx) => {
      let passTier: string = data.passTier
      let waived = false

      if (data.accessCode) {
        const [code] = await tx
          .select()
          .from(schema.registrationCode)
          .where(eq(schema.registrationCode.code, data.accessCode))
          .for("update")
        const problem = codeProblem(code)
        if (problem) throw new Error(problem)
        if (code.passTier) passTier = code.passTier
        waived = true
        await tx
          .update(schema.registrationCode)
          .set({ usedCount: sql`${schema.registrationCode.usedCount} + 1` })
          .where(eq(schema.registrationCode.id, code.id))
      }

      await tx.insert(schema.registration).values({
        reference,
        title: data.title,
        fullName: data.fullName,
        email: data.email,
        jobTitle: data.jobTitle,
        organization: data.organization,
        country: data.country,
        nationality: data.nationality,
        linkedinUrl: data.linkedinUrl || null,
        passTier,
        paymentStatus: waived ? "waived" : "pending",
        accessCode: waived ? data.accessCode : null,
        interestAreas: data.interestAreas,
        participationType: data.participationType,
        primaryGoal: data.primaryGoal,
        partnershipInterest: data.partnershipInterest,
        communicationsConsent: data.communicationsConsent,
        termsAccepted: data.termsAccepted,
      })

      // Data consent covers official communications, so subscribe them too.
      if (data.communicationsConsent) {
        await tx
          .insert(schema.newsletterSubscriber)
          .values({ email: data.email })
          .onConflictDoNothing()
      }
      return { passTier, waived }
    })

    const tier = PASS_TIERS.find((item) => item.id === passTier)!
    const common = {
      reference,
      email: data.email,
      fullName: data.fullName,
      title: data.title,
      passTier,
      locale: data.locale,
    }

    // Paid passes go to Stripe Checkout; the confirmation email is sent by the
    // webhook once the payment succeeds. Without Stripe the pass stays reserved.
    if (!waived && stripeEnabled()) {
      const site = env.VITE_PUBLIC_SITE_URL.replace(/\/$/, "")
      const base = `${site}${data.locale === "fr" ? "/fr" : ""}/register`
      try {
        const session = await createCheckoutSession({
          reference,
          email: data.email,
          productName: `Africa Digital Forum 2027 — ${tier.name}`,
          amountUsd: tier.price,
          locale: data.locale,
          successUrl: `${base}?payment=success&ref=${reference}`,
          cancelUrl: `${base}?payment=cancelled&ref=${reference}`,
        })
        return {
          ok: true as const,
          reference,
          passTier,
          waived,
          checkoutUrl: session.url,
        }
      } catch (error) {
        // The registration is saved as pending; fall back to a reservation.
        console.error("[stripe] checkout creation failed:", error)
      }
    }

    await sendRegistrationConfirmation({ ...common, waived }).catch(
      (error: unknown) => {
        console.error("[registration] confirmation email failed:", error)
      }
    )
    return {
      ok: true as const,
      reference,
      passTier,
      waived,
      checkoutUrl: null as string | null,
    }
  })
