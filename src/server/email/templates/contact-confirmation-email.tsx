import { Text } from "@react-email/components"

import { EmailLayout, emailStyles, type EmailLocale } from "./email-layout"

export interface ContactConfirmationEmailProps {
  name: string
  locale?: EmailLocale
}

export function ContactConfirmationEmail({
  name,
  locale = "en",
}: ContactConfirmationEmailProps) {
  const fr = locale === "fr"
  return (
    <EmailLayout
      locale={locale}
      preview={fr ? "Nous avons bien reçu votre message" : "We have received your message"}
    >
      <Text style={emailStyles.heading}>
        {fr ? "Merci de nous avoir contactés" : "Thank you for contacting us"}
      </Text>
      <Text style={emailStyles.text}>
        {fr ? "Bonjour" : "Hello"} {name},
      </Text>
      <Text style={emailStyles.text}>
        {fr
          ? "Nous avons bien reçu votre message et un membre de l’équipe Africa Digital Forum vous répondra dans les plus brefs délais. Vous pouvez répondre directement à cet e-mail si vous souhaitez ajouter quelque chose."
          : "We have received your message and a member of the Africa Digital Forum team will get back to you as soon as possible. You can reply directly to this email if you would like to add anything."}
      </Text>
      <Text style={emailStyles.text}>
        {fr ? "Cordialement," : "Best regards,"}
      </Text>
      <Text style={emailStyles.hint}>
        {fr ? "L’équipe Africa Digital Forum" : "The Africa Digital Forum team"}
      </Text>
    </EmailLayout>
  )
}
