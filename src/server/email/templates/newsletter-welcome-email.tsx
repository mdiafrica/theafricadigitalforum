import { Text } from "@react-email/components"

import { EmailLayout, emailStyles, type EmailLocale } from "./email-layout"

export interface NewsletterWelcomeEmailProps {
  locale?: EmailLocale
}

export function NewsletterWelcomeEmail({
  locale = "en",
}: NewsletterWelcomeEmailProps) {
  const fr = locale === "fr"
  return (
    <EmailLayout
      locale={locale}
      preview={
        fr
          ? "Bienvenue dans la newsletter d’Africa Digital Forum"
          : "Welcome to the Africa Digital Forum newsletter"
      }
    >
      <Text style={emailStyles.heading}>
        {fr ? "Vous êtes abonné(e)" : "You're subscribed"}
      </Text>
      <Text style={emailStyles.text}>{fr ? "Bonjour," : "Hello,"}</Text>
      <Text style={emailStyles.text}>
        {fr
          ? "Merci de vous être abonné(e) à la newsletter d’Africa Digital Forum. Vous serez parmi les premiers informés des intervenants, du programme, des inscriptions et des actualités de l’écosystème numérique africain."
          : "Thank you for subscribing to the Africa Digital Forum newsletter. You will be among the first to hear about speakers, programme updates, registration and news from across Africa's digital ecosystem."}
      </Text>
      <Text style={emailStyles.text}>
        {fr
          ? "Suivez-nous sur les réseaux sociaux ci-dessous pour rester en contact entre deux annonces."
          : "Follow us on social media below to stay connected between updates."}
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
