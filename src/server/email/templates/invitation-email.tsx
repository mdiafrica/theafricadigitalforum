import { Button, Section, Text } from "@react-email/components"

import { EmailLayout, emailStyles } from "./email-layout"

export interface InvitationEmailProps {
  inviteLink: string
  invitedByName: string
  invitedByEmail: string
  role: string
}

export function InvitationEmail({
  inviteLink,
  invitedByName,
  invitedByEmail,
  role,
}: InvitationEmailProps) {
  return (
    <EmailLayout preview="You've been invited to the Africa Digital Forum team">
      <Text style={emailStyles.heading}>You&apos;ve been invited</Text>
      <Text style={emailStyles.text}>
        {invitedByName} ({invitedByEmail}) invited you to join the Africa
        Digital Forum team as <strong>{role}</strong>.
      </Text>
      <Text style={emailStyles.text}>
        Accept the invitation to create your account and get started.
      </Text>
      <Section style={{ margin: "24px 0" }}>
        <Button href={inviteLink} style={emailStyles.button}>
          Accept invitation
        </Button>
      </Section>
      <Text style={emailStyles.hint}>
        This invitation expires in 7 days. If you weren&apos;t expecting it, you
        can safely ignore this email.
      </Text>
    </EmailLayout>
  )
}
