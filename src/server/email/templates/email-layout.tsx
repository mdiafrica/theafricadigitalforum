import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

/**
 * Shared shell for all ADF transactional emails. Inline styles only —
 * broadest email-client support, no runtime Tailwind compilation.
 */

export const emailTheme = {
  brand: "#7c3aed", // ≈ --brand-violet
  ink: "#0f172a",
  muted: "#64748b",
  bg: "#f4f4f7",
  card: "#ffffff",
} as const

const styles = {
  body: {
    backgroundColor: emailTheme.bg,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "24px 0",
  },
  container: {
    backgroundColor: emailTheme.card,
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "32px",
  },
  wordmark: {
    color: emailTheme.brand,
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    margin: "0 0 24px",
  },
  hr: { borderColor: "#e2e8f0", margin: "28px 0 16px" },
  footer: {
    color: emailTheme.muted,
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0,
    textAlign: "center" as const,
  },
} as const

export function EmailLayout({
  preview,
  children,
}: {
  preview: string
  children: React.ReactNode
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.wordmark}>Africa Digital Forum</Text>
          <Section>{children}</Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            Africa Digital Forum — connecting Africa&apos;s digital future.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

/** Shared text/button styles for template bodies. */
export const emailStyles = {
  heading: {
    color: emailTheme.ink,
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: "28px",
    margin: "0 0 16px",
  },
  text: {
    color: emailTheme.ink,
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 16px",
  },
  hint: {
    color: emailTheme.muted,
    fontSize: "13px",
    lineHeight: "20px",
    margin: "16px 0 0",
  },
  button: {
    backgroundColor: emailTheme.brand,
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 24px",
    textDecoration: "none",
  },
} as const
