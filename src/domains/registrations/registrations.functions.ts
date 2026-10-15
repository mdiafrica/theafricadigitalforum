import { randomBytes } from "node:crypto"
import { eq, sql } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"
import QRCode from "qrcode"

import { db } from "@/server/db"
import { env } from "@/env"
import * as schema from "@/server/db/schema"
import { sendEmail } from "@/server/email"
import { renderEmailIcon } from "@/server/email/email-icons"
import {
  REGISTRATION_EMAIL_ICONS,
  REGISTRATION_QR_CID,
  registrationIconCid,
} from "@/server/email/templates/registration-confirmation-email"
import { codeProblem } from "./registrations.codes"
import { PASS_TIERS } from "./registrations.options"
import { registrationInput } from "./registrations.schemas"

const newReference = () =>
  `ADF-${randomBytes(4).toString("hex").toUpperCase()}`

/**
 * Public registration endpoint. Payment is not collected online yet, so the
 * pass is recorded as reserved with a "pending" payment status, unless a valid
 * access code is redeemed: then payment is "waived" and the code's pass tier
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
      return { passTier, waived }
    })

    const tier = PASS_TIERS.find((item) => item.id === passTier)!

    await Promise.allSettled([
      (async () => {
        const qr = await QRCode.toBuffer(
          `${env.VITE_PUBLIC_SITE_URL.replace(/\/$/, "")}/verify/${reference}`,
          {
            width: 400,
            margin: 2,
            errorCorrectionLevel: "M",
          }
        )
        const icons = await Promise.all(
          REGISTRATION_EMAIL_ICONS.map(async (name) => ({
            filename: `${name}.png`,
            content: await renderEmailIcon(name),
            contentType: "image/png",
            cid: registrationIconCid(name),
          }))
        )
        await sendEmail(
          "registration-confirmation",
          data.email,
          {
            name: data.fullName,
            title: data.title,
            reference,
            passName: tier.name,
            waived,
          },
          [
            {
              filename: `${reference}.png`,
              content: qr,
              contentType: "image/png",
              cid: REGISTRATION_QR_CID,
            },
            ...icons,
          ]
        )
      })(),
    ])

    return { ok: true as const, reference, passTier, waived }
  })
