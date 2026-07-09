import nodemailer from "nodemailer"

import { env } from "@/env"

/**
 * SMTP transport — provider-agnostic nodemailer. Dev points at
 * the Mailpit container; prod at any SMTP provider via the same MAIL_* vars.
 */
export const mailTransport = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_SECURE,
  requireTLS: env.MAIL_REQUIRE_TLS,
  ignoreTLS: env.MAIL_IGNORE_TLS,
  auth: env.MAIL_USER
    ? { user: env.MAIL_USER, pass: env.MAIL_PASSWORD }
    : undefined,
})

/** RFC 5322 `"Name" <email>` default sender. */
export const mailFrom = `"${env.MAIL_DEFAULT_NAME}" <${env.MAIL_DEFAULT_EMAIL}>`
