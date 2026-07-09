import {
  ContactNotificationEmail,
  type ContactNotificationEmailProps,
} from "./templates/contact-notification-email"
import {
  InvitationEmail,
  type InvitationEmailProps,
} from "./templates/invitation-email"
import {
  ResetPasswordEmail,
  type ResetPasswordEmailProps,
} from "./templates/reset-password-email"

/**
 * Email registry: one entry per transactional email,
 * key → { subject, component }. `sendEmail` renders the component inline
 * with @react-email/render — no precompile step, no queue.
 *
 * Adding an email = add its props to EmailPropsMap + one registry entry.
 */
export interface EmailPropsMap {
  invitation: InvitationEmailProps
  "reset-password": ResetPasswordEmailProps
  "contact-notification": ContactNotificationEmailProps
}

export type EmailKey = keyof EmailPropsMap

interface EmailRegistryEntry<K extends EmailKey> {
  subject: string | ((props: EmailPropsMap[K]) => string)
  component: (props: EmailPropsMap[K]) => React.ReactElement
}

export const EMAIL_REGISTRY: { [K in EmailKey]: EmailRegistryEntry<K> } = {
  invitation: {
    subject: "Join the Africa Digital Forum team",
    component: (props) => <InvitationEmail {...props} />,
  },
  "reset-password": {
    subject: "Reset your Africa Digital Forum password",
    component: (props) => <ResetPasswordEmail {...props} />,
  },
  "contact-notification": {
    subject: (props) => `Contact form: ${props.subject}`,
    component: (props) => <ContactNotificationEmail {...props} />,
  },
}
