import { Hr, Img, Section, Text } from "@react-email/components"

import { EmailLayout, emailTheme, type EmailLocale } from "./email-layout"

export const REGISTRATION_QR_CID = "registration-qr@adf"

export const REGISTRATION_EMAIL_ICONS = [
  "check-circle",
  "calendar",
  "megaphone",
] as const

export const registrationIconCid = (
  name: (typeof REGISTRATION_EMAIL_ICONS)[number]
) => `icon-${name}@adf`

function Step({
  icon,
  children,
}: {
  icon: (typeof REGISTRATION_EMAIL_ICONS)[number]
  children: React.ReactNode
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      style={{ margin: "0 0 10px", width: "100%" }}
    >
      <tbody>
        <tr>
          <td style={{ width: "32px", verticalAlign: "top" }}>
            <Img
              src={`cid:${registrationIconCid(icon)}`}
              alt=""
              width={22}
              height={22}
              style={{ display: "block" }}
            />
          </td>
          <td style={{ verticalAlign: "top" }}>
            <Text style={{ ...s.step, margin: 0 }}>{children}</Text>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export interface RegistrationConfirmationEmailProps {
  name: string
  title?: string
  reference: string
  passName: string
  waived?: boolean
  paid?: boolean
  locale?: EmailLocale
}

const s = {
  hero: {
    backgroundColor: "#5b21b6",
    backgroundImage: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
    borderRadius: "12px",
    padding: "32px 24px",
    textAlign: "center" as const,
  },
  eyebrow: {
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    margin: "0 0 8px",
    textTransform: "uppercase" as const,
  },
  title: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 800,
    lineHeight: "34px",
    margin: "0 0 8px",
  },
  heroSub: {
    color: "#ffffff",
    fontSize: "15px",
    lineHeight: "22px",
    margin: 0,
  },
  text: {
    color: emailTheme.ink,
    fontSize: "15px",
    lineHeight: "24px",
    margin: "24px 0 16px",
  },
  ticket: {
    border: "2px dashed #c4b5fd",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center" as const,
    backgroundColor: "#faf5ff",
  },
  passName: {
    color: emailTheme.brand,
    fontSize: "18px",
    fontWeight: 800,
    margin: "0 0 12px",
  },
  label: {
    color: emailTheme.muted,
    fontSize: "11px",
    letterSpacing: "0.1em",
    margin: "0 0 4px",
    textTransform: "uppercase" as const,
  },
  reference: {
    color: emailTheme.ink,
    fontFamily: "'Courier New', monospace",
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: "0 0 12px",
  },
  detailLabel: {
    color: emailTheme.muted,
    fontSize: "12px",
    letterSpacing: "0.08em",
    margin: 0,
    textTransform: "uppercase" as const,
  },
  detailValue: {
    color: emailTheme.ink,
    fontSize: "15px",
    fontWeight: 600,
    margin: "2px 0 14px",
  },
  hint: {
    color: emailTheme.muted,
    fontSize: "13px",
    lineHeight: "20px",
    margin: "12px 0 0",
  },
  stepsTitle: {
    color: emailTheme.ink,
    fontSize: "16px",
    fontWeight: 700,
    margin: "0 0 8px",
  },
  step: {
    color: emailTheme.ink,
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0 0 6px",
  },
}

export function RegistrationConfirmationEmail({
  name,
  title,
  reference,
  passName,
  waived,
  paid,
  locale = "en",
}: RegistrationConfirmationEmailProps) {
  const fr = locale === "fr"
  const firstName = name.trim().split(/\s+/)[0] || name
  const formalName = [title, name].filter(Boolean).join(" ")
  const isReservation = !waived && !paid
  const dates = fr ? "2–4 Juin 2027" : "June 2–4, 2027"

  return (
    <EmailLayout
      locale={locale}
      preview={
        fr
          ? isReservation
            ? `Votre ${passName} est réservé, ${firstName}. Les instructions de paiement suivront.`
            : `Vous êtes inscrit(e), ${firstName} ! Rendez-vous à Lomé, du 2 au 4 Juin 2027.`
          : isReservation
            ? `Your ${passName} is reserved, ${firstName}. Payment instructions will follow.`
            : `You're in, ${firstName}! See you in Lomé, June 2–4, 2027.`
      }
    >
      <Section className="adf-hero" style={s.hero}>
        <Text className="adf-hero-eyebrow" style={s.eyebrow}>
          {isReservation
            ? fr
              ? "Réservation de pass reçue"
              : "Pass reservation received"
            : fr
              ? "Inscription confirmée"
              : "Registration confirmed"}
        </Text>
        <Text className="adf-hero-title" style={s.title}>
          {isReservation
            ? fr
              ? `Votre pass est réservé, ${firstName}.`
              : `Your pass is reserved, ${firstName}.`
            : fr
              ? `Vous êtes inscrit(e), ${firstName} ! 🎉`
              : `You're in, ${firstName}! 🎉`}
        </Text>
        <Text className="adf-hero-sub" style={s.heroSub}>
          {isReservation
            ? fr
              ? "Le paiement en ligne n’est pas encore disponible. Notre équipe vous enverra les instructions de paiement par e-mail."
              : "Online payment is not available yet. Our team will email you payment instructions."
            : fr
              ? "Préparez-vous pour Africa Digital Forum 2027, où se construit l’avenir numérique de l’Afrique."
              : "Get ready for Africa Digital Forum 2027, where Africa's digital future takes shape."}
        </Text>
      </Section>

      <Text style={s.text}>
        {fr ? "Bonjour" : "Dear"} {formalName},{" "}
        {fr
          ? isReservation
            ? "merci pour votre réservation. Votre"
            : "merci pour votre inscription. Votre"
          : isReservation
            ? "thank you for your reservation. Your"
            : "thank you for registering. Your"}{" "}
        <strong>{passName}</strong>{" "}
        {fr
          ? isReservation
            ? "est réservé. Aucun paiement n’a été prélevé en ligne. Notre équipe vous enverra les instructions de paiement."
            : paid
              ? "est confirmé. Nous avons bien reçu votre paiement, merci !"
              : "est réservé, et aucun paiement n’est requis pour ce pass."
          : isReservation
            ? "is reserved. No payment has been taken online. Our team will email you payment instructions."
            : paid
              ? "is confirmed. We have received your payment, thank you!"
              : "is reserved, and no payment is required for this pass."}{" "}
        {fr
          ? "Rejoignez dirigeants gouvernementaux, fondateurs de startups, investisseurs et innovateurs pendant trois jours d’idées, d’affaires et de rencontres."
          : "Join government leaders, tech founders, investors and innovators for three days of ideas, deals and connections."}
      </Text>

      <Section style={s.ticket}>
        <Text style={s.passName}>{passName}</Text>
        <Text style={s.label}>
          {fr ? "Votre référence d’inscription" : "Your registration reference"}
        </Text>
        <Text style={s.reference}>{reference}</Text>
        <Img
          src={`cid:${REGISTRATION_QR_CID}`}
          alt={fr ? `Code QR pour ${reference}` : `QR code for ${reference}`}
          width={200}
          height={200}
          style={{ margin: "0 auto", display: "block" }}
        />
        <Text style={s.hint}>
          {isReservation
            ? fr
              ? "Conservez cette référence de réservation. Notre équipe vous contactera avec les instructions de paiement."
              : "Keep this reservation reference for your records. Our team will contact you with payment instructions."
            : fr
              ? "Votre pass d’entrée personnel. Présentez ce code QR à l’entrée pour l’enregistrement."
              : "Your personal entry pass. Show this QR code at the door for check-in."}
        </Text>
      </Section>

      <Section style={{ margin: "24px 0 0" }}>
        <Text style={s.detailLabel}>{fr ? "Quand" : "When"}</Text>
        <Text style={s.detailValue}>{dates}</Text>
        <Text style={s.detailLabel}>{fr ? "Où" : "Where"}</Text>
        <Text style={s.detailValue}>Lomé, Togo</Text>
        <Text style={s.detailLabel}>{fr ? "Organisateur" : "Host"}</Text>
        <Text style={s.detailValue}>
          {fr
            ? "Institut des Médias et du Numérique (MDI)"
            : "Media and Digital Institute (MDI)"}
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e2e8f0", margin: "8px 0 20px" }} />

      <Text style={s.stepsTitle}>
        {fr ? "Et ensuite ?" : "What happens next"}
      </Text>
      {isReservation ? (
        <Step icon="check-circle">
          {fr
            ? "Notre équipe vous enverra les instructions pour finaliser le paiement."
            : "Our team will email you instructions for completing payment."}
        </Step>
      ) : (
        <Step icon="check-circle">
          {fr
            ? "Conservez cet e-mail. Votre code QR est votre billet."
            : "Save this email. Your QR code is your ticket."}
        </Step>
      )}
      <Step icon="calendar">
        {fr
          ? `Notez ${dates} dans votre agenda.`
          : `Mark ${dates} in your calendar.`}
      </Step>
      <Step icon="megaphone">
        {fr
          ? "Nous partagerons le programme officiel dès sa publication."
          : "We'll share the official program as soon as it's published."}
      </Step>

      <Text style={s.hint}>
        {fr
          ? "Des questions ? Contactez notre secrétariat à contact@theafricadigitalforum.com."
          : "Questions? Contact our secretariat at contact@theafricadigitalforum.com."}
      </Text>
    </EmailLayout>
  )
}
