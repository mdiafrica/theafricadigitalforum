import { Hr, Section, Text } from "@react-email/components"

import { EmailLayout, emailStyles } from "./email-layout"

export interface ContactNotificationEmailProps {
  name: string
  email: string
  subject: string
  message: string
}

export function ContactNotificationEmail({
  name,
  email,
  subject,
  message,
}: ContactNotificationEmailProps) {
  return (
    <EmailLayout preview={`New contact enquiry from ${name}`}>
      <Text style={emailStyles.heading}>New contact enquiry</Text>
      <Text style={emailStyles.text}>
        <strong>{name}</strong> ({email}) wrote via the contact form:
      </Text>
      <Section style={{ margin: "16px 0" }}>
        <Text style={{ ...emailStyles.text, fontWeight: 600 }}>{subject}</Text>
        <Hr />
        <Text style={{ ...emailStyles.text, whiteSpace: "pre-wrap" }}>
          {message}
        </Text>
      </Section>
      <Text style={emailStyles.hint}>
        The full inbox lives in the admin panel under Submissions.
      </Text>
    </EmailLayout>
  )
}
