import { Hr, Section, Text } from "@react-email/components"

import { EmailLayout, emailStyles } from "./email-layout"

export interface ContactForwardEmailProps {
  name: string
  email: string
  subject: string
  originalMessage: string
  note: string
}

export function ContactForwardEmail({
  name,
  email,
  subject,
  originalMessage,
  note,
}: ContactForwardEmailProps) {
  return (
    <EmailLayout preview={`Forwarded enquiry: ${subject}`}>
      <Text style={emailStyles.heading}>Forwarded contact enquiry</Text>
      <Text style={emailStyles.text}>{note}</Text>
      <Section style={{ margin: "16px 0" }}>
        <Text style={{ ...emailStyles.text, fontWeight: 600 }}>{subject}</Text>
        <Text style={emailStyles.hint}>From: {name} ({email})</Text>
        <Hr />
        <Text style={{ ...emailStyles.text, whiteSpace: "pre-wrap" }}>
          {originalMessage}
        </Text>
      </Section>
    </EmailLayout>
  )
}
