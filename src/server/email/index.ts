import { render } from "@react-email/render"

import type { EmailKey, EmailPropsMap } from "./registry"
import { EMAIL_REGISTRY } from "./registry"
import { mailFrom, mailReplyTo, resend } from "./transport"

interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  cid?: string
}

/**
 * Render + send one transactional email, awaited inline. Throws on failure so callers (better-auth hooks, server
 * fns) decide how to surface it.
 */
export async function sendEmail<TKey extends EmailKey>(
  key: TKey,
  to: string,
  props: EmailPropsMap[TKey],
  attachments?: EmailAttachment[]
): Promise<void> {
  const entry = EMAIL_REGISTRY[key]
  const subject =
    typeof entry.subject === "function" ? entry.subject(props) : entry.subject
  const html = await render(entry.component(props))
  const text = await render(entry.component(props), { plainText: true })

  try {
    const { error } = await resend.emails.send({
      from: mailFrom,
      to,
      ...(mailReplyTo ? { replyTo: mailReplyTo } : {}),
      subject,
      html,
      text,
      attachments: attachments?.map(({ cid, ...attachment }) => ({
        ...attachment,
        ...(cid ? { contentId: cid } : {}),
      })),
    })
    if (error) throw new Error(error.message)
  } catch (error) {
    console.error(`[email] failed to send "${key}" to ${to}:`, error)
    throw error
  }
}

export type { EmailKey, EmailPropsMap }
