import { Resend } from "resend"

import { env } from "@/env"

export const resend = new Resend(env.RESEND_API_KEY)

/** Resend sender in `"Name" <email>` format. */
export const mailFrom = `"${env.MAIL_DEFAULT_NAME}" <${env.MAIL_DEFAULT_EMAIL}>`

export const mailReplyTo = env.MAIL_REPLY_TO
