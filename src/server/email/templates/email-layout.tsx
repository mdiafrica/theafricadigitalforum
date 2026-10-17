import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/theafricadigitalforum/",
  },
  { label: "X", href: "https://x.com/ADFafrica" },
  {
    label: "Facebook",
    href: "https://www.facebook.com/theafricadigitalforum/",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/theafricadigitalforum/",
  },
  { label: "YouTube", href: "https://youtube.com/@theafricadigitalforum" },
] as const

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
  social: {
    color: emailTheme.muted,
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0 0 12px",
    textAlign: "center" as const,
  },
  socialLink: {
    color: emailTheme.brand,
    fontWeight: 600,
    textDecoration: "none",
  },
  footer: {
    color: emailTheme.muted,
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0,
    textAlign: "center" as const,
  },
} as const

export type EmailLocale = "en" | "fr"

export function EmailLayout({
  preview,
  children,
  locale = "en",
}: {
  preview: string
  children: React.ReactNode
  locale?: EmailLocale
}) {
  const fr = locale === "fr"
  return (
    <Html lang={locale}>
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
        <style>{`
          :root { color-scheme: light only; supported-color-schemes: light only; }
          .adf-hero, .adf-hero td { background-color: #5b21b6 !important; background-image: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%) !important; }
          .adf-hero-title, .adf-hero-sub, .adf-hero-eyebrow { color: #ffffff !important; }
          [data-ogsc] .adf-hero, [data-ogsc] .adf-hero td { background-color: #5b21b6 !important; }
          [data-ogsc] .adf-hero-title, [data-ogsc] .adf-hero-sub, [data-ogsc] .adf-hero-eyebrow { color: #ffffff !important; }
          @media (prefers-color-scheme: dark) {
            .adf-hero, .adf-hero td { background-color: #5b21b6 !important; background-image: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%) !important; }
            .adf-hero-title, .adf-hero-sub, .adf-hero-eyebrow { color: #ffffff !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.wordmark}>Africa Digital Forum</Text>
          <Section>{children}</Section>
          <Hr style={styles.hr} />
          <Text style={styles.social}>
            {fr ? "Restons connectés :" : "Stay connected with us:"}{" "}
            {SOCIAL_LINKS.map((link, index) => (
              <span key={link.label}>
                {index > 0 && " · "}
                <Link href={link.href} style={styles.socialLink}>
                  {link.label}
                </Link>
              </span>
            ))}
          </Text>
          <Text style={styles.footer}>
            {fr
              ? "Africa Digital Forum — connecter l’avenir numérique de l’Afrique."
              : "Africa Digital Forum — connecting Africa's digital future."}
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
