import { createFileRoute } from "@tanstack/react-router"

import {
  LegalContact,
  LegalIntro,
  LegalList,
  LegalPage,
  LegalSection,
  LegalText,
} from "@/components/legal-page"

export const Route = createFileRoute("/_public/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | Africa Digital Forum" },
      {
        name: "description",
        content: "Terms of Use for the Africa Digital Forum website.",
      },
    ],
  }),
  component: TermsRoute,
})

const SITE = "https://theafricadigitalforum.com/"
const EMAIL = "contact@theafricadigitalforum.com"

function TermsRoute() {
  return (
    <LegalPage title="Terms of Use" lastUpdated="Last Updated: July 02, 2026">
      <LegalIntro>
        Use of the site <a href={SITE}>{SITE}</a> implies full acceptance of the
        terms described below.
      </LegalIntro>

      <LegalSection title="Intellectual Property">
        <LegalText>
          The name &ldquo;Africa Digital Forum,&rdquo; its logo, textual content
          (Vision, Mission, Pillars), and visual materials are the exclusive
          property of the <strong>Media and Digital Institute (MDI)</strong>,
          unless otherwise stated. Any unauthorized reproduction or exploitation is
          strictly prohibited.
        </LegalText>
      </LegalSection>

      <LegalSection title="Site Usage">
        <LegalText>
          Users agree to use the site in an ethical and professional manner. It is
          prohibited to:
        </LegalText>
        <LegalList
          items={[
            "Attempt to compromise the platform's security.",
            "Publish offensive content or content that undermines the integrity of information.",
            "Use contact forms to send unsolicited communications (spam).",
          ]}
        />
      </LegalSection>

      <LegalSection title="Limitation of Liability">
        <LegalText>
          While we strive to provide accurate and up-to-date information, the ADF
          cannot be held responsible for errors, temporary unavailability of the
          site, or damages resulting from the use of links to third-party sites
          (e.g., Hostinger, speakers' social networks).
        </LegalText>
      </LegalSection>

      <LegalSection title="Updates to Policies">
        <LegalText>
          The Africa Digital Forum may update its policies at any time. We are not
          obliged to notify users of these updates, as users are responsible for
          periodically checking the document for any changes.
        </LegalText>
      </LegalSection>

      <LegalSection title="Contact">
        <LegalText>
          For any questions regarding these policies, please contact the ADF
          executive secretariat:
        </LegalText>
        <LegalContact>
          <p>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>
        </LegalContact>
      </LegalSection>
    </LegalPage>
  )
}
