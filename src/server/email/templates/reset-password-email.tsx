import { Button, Section, Text } from "@react-email/components"

import { EmailLayout, emailStyles } from "./email-layout"

export interface ResetPasswordEmailProps {
  name: string
  resetLink: string
}

export function ResetPasswordEmail({
  name,
  resetLink,
}: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Reset your Africa Digital Forum password">
      <Text style={emailStyles.heading}>Reset your password</Text>
      <Text style={emailStyles.text}>Hi {name},</Text>
      <Text style={emailStyles.text}>
        We received a request to reset the password for your Africa Digital
        Forum account. Click the button below to choose a new one.
      </Text>
      <Section style={{ margin: "24px 0" }}>
        <Button href={resetLink} style={emailStyles.button}>
          Reset password
        </Button>
      </Section>
      <Text style={emailStyles.hint}>
        This link expires shortly for security reasons. If you didn&apos;t
        request a reset, you can safely ignore this email — your password will
        stay unchanged.
      </Text>
    </EmailLayout>
  )
}
