import { render } from "@react-email/render"

import { EMAIL_REGISTRY, type EmailKey, type EmailPropsMap } from "./registry"
import { mailFrom, mailTransport } from "./transport"

/**
 * Render + send one transactional email, awaited inline. Throws on failure so callers (better-auth hooks, server
 * fns) decide how to surface it.
 */
export async function sendEmail<K extends EmailKey>(
  key: K,
  to: string,
  props: EmailPropsMap[K]
): Promise<void> {
  const entry = EMAIL_REGISTRY[key]
  const subject =
    typeof entry.subject === "function" ? entry.subject(props) : entry.subject
  const html = await render(entry.component(props))

  try {
    await mailTransport.sendMail({ from: mailFrom, to, subject, html })
  } catch (error) {
    console.error(`[email] failed to send "${key}" to ${to}:`, error)
    throw error
  }
}

export type { EmailKey, EmailPropsMap }
