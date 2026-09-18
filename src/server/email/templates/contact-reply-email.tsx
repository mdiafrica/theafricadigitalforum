import { Hr, Section, Text } from "@react-email/components"

import { EmailLayout, emailStyles } from "./email-layout"

export interface ContactReplyEmailProps {
  name: string
  subject: string
  message: string
}

export function ContactReplyEmail({
  name,
  subject,
  message,
}: ContactReplyEmailProps) {
  return (
    <EmailLayout preview={`Reply from Africa Digital Forum: ${subject}`}>
      <Text style={emailStyles.heading}>Africa Digital Forum</Text>
      <Text style={emailStyles.text}>Hello {name},</Text>
      <Section style={{ margin: "16px 0" }}>
        <Text style={{ ...emailStyles.text, fontWeight: 600 }}>{subject}</Text>
        <Hr />
        <Text style={{ ...emailStyles.text, whiteSpace: "pre-wrap" }}>
          {message}
        </Text>
      </Section>
      <Text style={emailStyles.text}>Best regards,</Text>
      <Text style={emailStyles.hint}>The Africa Digital Forum team</Text>
    </EmailLayout>
  )
}
