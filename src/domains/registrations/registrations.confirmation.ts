import QRCode from "qrcode"

import { env } from "@/env"
import { sendEmail } from "@/server/email"
import { renderEmailIcon } from "@/server/email/email-icons"
import {
  REGISTRATION_EMAIL_ICONS,
  REGISTRATION_QR_CID,
  registrationIconCid,
} from "@/server/email/templates/registration-confirmation-email"
import { trFor, trTitleFor } from "./registrations.i18n"
import { PASS_TIERS } from "./registrations.options"

export interface ConfirmationInput {
  reference: string
  email: string
  fullName: string
  title: string
  passTier: string
  locale: "en" | "fr"
  /** Payment waived by an access code. */
  waived?: boolean
  /** Payment received through Stripe. */
  paid?: boolean
}

/** Sends the registration confirmation (with QR ticket) in the user's language. */
export async function sendRegistrationConfirmation(input: ConfirmationInput) {
  const tier = PASS_TIERS.find((item) => item.id === input.passTier)
  const qr = await QRCode.toBuffer(
    `${env.VITE_PUBLIC_SITE_URL.replace(/\/$/, "")}/verify/${input.reference}`,
    { width: 400, margin: 2, errorCorrectionLevel: "M" }
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
    input.email,
    {
      name: input.fullName,
      title: trTitleFor(input.locale, input.title),
      reference: input.reference,
      passName: trFor(input.locale, tier?.name ?? input.passTier),
      waived: input.waived,
      paid: input.paid,
      locale: input.locale,
    },
    [
      {
        filename: `${input.reference}.png`,
        content: qr,
        contentType: "image/png",
        cid: REGISTRATION_QR_CID,
      },
      ...icons,
    ]
  )
}
