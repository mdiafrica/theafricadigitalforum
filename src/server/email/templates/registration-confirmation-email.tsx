import { Hr, Img, Section, Text } from "@react-email/components"

import { EmailLayout, emailTheme } from "./email-layout"

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
}

const s = {
  hero: {
    backgroundColor: emailTheme.brand,
    backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
    borderRadius: "12px",
    padding: "32px 24px",
    textAlign: "center" as const,
  },
  eyebrow: {
    color: "#ddd6fe",
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
    color: "#ede9fe",
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
}: RegistrationConfirmationEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || name
  const formalName = [title, name].filter(Boolean).join(" ")
  const isReservation = !waived

  return (
    <EmailLayout
      preview={
        isReservation
          ? `Your ${passName} is reserved, ${firstName}. Payment instructions will follow.`
          : `You're in, ${firstName}! See you in Lomé, June 2–4, 2026.`
      }
    >
      <Section style={s.hero}>
        <Text style={s.eyebrow}>
          {isReservation
            ? "Pass reservation received"
            : "Registration confirmed"}
        </Text>
        <Text style={s.title}>
          {isReservation
            ? `Your pass is reserved, ${firstName}.`
            : `You're in, ${firstName}! 🎉`}
        </Text>
        <Text style={s.heroSub}>
          {isReservation
            ? "Online payment is not available yet. Our team will email you payment instructions."
            : "Get ready for Africa Digital Forum 2026, where Africa's digital future takes shape."}
        </Text>
      </Section>

      <Text style={s.text}>
        Dear {formalName},{" "}
        {isReservation
          ? "thank you for your reservation. Your"
          : "thank you for registering. Your"}{" "}
        <strong>{passName}</strong> is reserved
        {isReservation
          ? ". No payment has been taken online. Our team will email you payment instructions."
          : ", and no payment is required for this pass."}{" "}
        Join government leaders, tech founders, investors and innovators for
        three days of ideas, deals and connections.
      </Text>

      <Section style={s.ticket}>
        <Text style={s.passName}>{passName}</Text>
        <Text style={s.label}>Your registration reference</Text>
        <Text style={s.reference}>{reference}</Text>
        <Img
          src={`cid:${REGISTRATION_QR_CID}`}
          alt={`QR code for ${reference}`}
          width={200}
          height={200}
          style={{ margin: "0 auto", display: "block" }}
        />
        <Text style={s.hint}>
          {isReservation
            ? "Keep this reservation reference for your records. Our team will contact you with payment instructions."
            : "Your personal entry pass. Show this QR code at the door for check-in."}
        </Text>
      </Section>

      <Section style={{ margin: "24px 0 0" }}>
        <Text style={s.detailLabel}>When</Text>
        <Text style={s.detailValue}>June 2–4, 2026</Text>
        <Text style={s.detailLabel}>Where</Text>
        <Text style={s.detailValue}>Lomé, Togo</Text>
        <Text style={s.detailLabel}>Host</Text>
        <Text style={s.detailValue}>Media and Digital Institute (MDI)</Text>
      </Section>

      <Hr style={{ borderColor: "#e2e8f0", margin: "8px 0 20px" }} />

      <Text style={s.stepsTitle}>What happens next</Text>
      {isReservation ? (
        <Step icon="check-circle">
          Our team will email you instructions for completing payment.
        </Step>
      ) : (
        <Step icon="check-circle">
          Save this email. Your QR code is your ticket.
        </Step>
      )}
      <Step icon="calendar">Mark June 2–4, 2026 in your calendar.</Step>
      <Step icon="megaphone">
        We&apos;ll share the official program as soon as it&apos;s published.
      </Step>

      <Text style={s.hint}>
        Questions? Contact our secretariat at contact@theafricadigitalforum.com.
      </Text>
    </EmailLayout>
  )
}
