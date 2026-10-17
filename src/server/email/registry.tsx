import {
  ContactConfirmationEmail,
  type ContactConfirmationEmailProps,
} from "./templates/contact-confirmation-email"
import {
  ContactNotificationEmail,
  type ContactNotificationEmailProps,
} from "./templates/contact-notification-email"
import {
  ContactReplyEmail,
  type ContactReplyEmailProps,
} from "./templates/contact-reply-email"
import {
  ContactForwardEmail,
  type ContactForwardEmailProps,
} from "./templates/contact-forward-email"
import {
  InvitationEmail,
  type InvitationEmailProps,
} from "./templates/invitation-email"
import {
  NewsletterWelcomeEmail,
  type NewsletterWelcomeEmailProps,
} from "./templates/newsletter-welcome-email"
import {
  RegistrationConfirmationEmail,
  type RegistrationConfirmationEmailProps,
} from "./templates/registration-confirmation-email"
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
  "contact-confirmation": ContactConfirmationEmailProps
  "newsletter-welcome": NewsletterWelcomeEmailProps
  "contact-reply": ContactReplyEmailProps
  "contact-forward": ContactForwardEmailProps
  "registration-confirmation": RegistrationConfirmationEmailProps
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
  "contact-confirmation": {
    subject: (props) =>
      props.locale === "fr"
        ? "Nous avons bien reçu votre message"
        : "We have received your message",
    component: (props) => <ContactConfirmationEmail {...props} />,
  },
  "newsletter-welcome": {
    subject: (props) =>
      props.locale === "fr"
        ? "Bienvenue dans la newsletter d’Africa Digital Forum"
        : "Welcome to the Africa Digital Forum newsletter",
    component: (props) => <NewsletterWelcomeEmail {...props} />,
  },
  "contact-reply": {
    subject: (props) => `Re: ${props.subject}`,
    component: (props) => <ContactReplyEmail {...props} />,
  },
  "contact-forward": {
    subject: (props) => `Fwd: ${props.subject}`,
    component: (props) => <ContactForwardEmail {...props} />,
  },
  "registration-confirmation": {
    subject: (props) =>
      props.locale === "fr"
        ? props.waived || props.paid
          ? "Votre inscription à Africa Digital Forum est confirmée"
          : "Votre pass Africa Digital Forum est réservé"
        : props.waived || props.paid
          ? "Your Africa Digital Forum registration is confirmed"
          : "Your Africa Digital Forum pass is reserved",
    component: (props) => <RegistrationConfirmationEmail {...props} />,
  },
}
