import { createFileRoute } from "@tanstack/react-router"

import {
  LegalContact,
  LegalIntro,
  LegalList,
  LegalPage,
  LegalSection,
  LegalSubsection,
  LegalTable,
  LegalText,
} from "@/components/legal-page"

export const Route = createFileRoute("/_public/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Africa Digital Forum" },
      {
        name: "description",
        content:
          "Privacy Policy, Terms of Use and Cookie Policy for the Africa Digital Forum.",
      },
    ],
  }),
  component: PrivacyRoute,
})

const SITE = "https://theafricadigitalforum.com/"
const EMAIL = "contact@theafricadigitalforum.com"

function PrivacyRoute() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="Last Updated: July 02, 2026">
      <LegalIntro>
        This page details the Privacy Policy, Terms of Use, and Cookie Policy for
        the official Africa Digital Forum (ADF) website:{" "}
        <a href={SITE}>{SITE}</a>. The ADF is a permanent continental platform
        legally managed and hosted by the{" "}
        <strong>Media and Digital Institute (MDI)</strong>.
      </LegalIntro>

      <LegalSection title="1. Privacy Policy">
        <LegalText>
          This policy explains how the Africa Digital Forum collects, uses, and
          protects your personal data in pursuit of its mission to accelerate
          inclusive digital transformation in Africa.
        </LegalText>

        <LegalSubsection title="Data Collection">
          <LegalText>
            We collect information when you interact with our platform, including
            for:
          </LegalText>
          <LegalList
            items={[
              "Event registration (name, surname, organization, job title, country).",
              "Speaker or startup applications.",
              "Subscription to our updates (ADF Digest) via your email address.",
              "Navigation data collected automatically (IP address, browser type) via analytics tools.",
            ]}
          />
        </LegalSubsection>

        <LegalSubsection title="Purpose of Processing">
          <LegalText>Your data is processed for the following purposes:</LegalText>
          <LegalList
            items={[
              "Managing registration and event logistics.",
              "Communication regarding the program, thematic pillars (AI, Digital Economy, etc.), and investment opportunities.",
              "Connecting startup founders with investors.",
              "Improving user experience and platform security.",
            ]}
          />
        </LegalSubsection>

        <LegalSubsection title="Data Protection and Sharing">
          <LegalText>
            ADF is committed to maintaining the confidentiality of your strategic
            and personal information. We do not share your data with third-party
            partners or sponsors unless we have your explicit consent or it is
            necessary for the performance of forum services.
          </LegalText>
        </LegalSubsection>

        <LegalSubsection title="Your Rights">
          <LegalText>
            In accordance with the principles of digital sovereignty and data
            protection, you have the right to access, rectify, and delete your
            personal data. For any requests, please contact us at:
          </LegalText>
          <p className="legal-links text-[15px] text-[#374151]">
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="2. Terms of Use">
        <LegalText>
          Use of the site <a href={SITE}>{SITE}</a> implies full acceptance of the
          terms described below.
        </LegalText>

        <LegalSubsection title="Intellectual Property">
          <LegalText>
            The name &ldquo;Africa Digital Forum,&rdquo; its logo, textual content
            (Vision, Mission, Pillars), and visual materials are the exclusive
            property of the <strong>Media and Digital Institute (MDI)</strong>,
            unless otherwise stated. Any unauthorized reproduction or exploitation
            is strictly prohibited.
          </LegalText>
        </LegalSubsection>

        <LegalSubsection title="Site Usage">
          <LegalText>
            Users agree to use the site in an ethical and professional manner. It
            is prohibited to:
          </LegalText>
          <LegalList
            items={[
              "Attempt to compromise the platform's security.",
              "Publish offensive content or content that undermines the integrity of information.",
              "Use contact forms to send unsolicited communications (spam).",
            ]}
          />
        </LegalSubsection>

        <LegalSubsection title="Limitation of Liability">
          <LegalText>
            While we strive to provide accurate and up-to-date information, the ADF
            cannot be held responsible for errors, temporary unavailability of the
            site, or damages resulting from the use of links to third-party sites
            (e.g., Hostinger, speakers' social networks).
          </LegalText>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="3. Cookie Policy">
        <LegalText>
          To improve your experience, the Africa Digital Forum website uses
          cookies. A cookie is a small text file stored on your device.
        </LegalText>

        <LegalSubsection title="Types of Cookies Used">
          <LegalTable
            head={["Cookie Type", "Purpose"]}
            rows={[
              [
                <strong>Essential</strong>,
                "Necessary for the technical operation and security of the site.",
              ],
              [
                <strong>Analytical</strong>,
                "Allow us to measure audience and understand which sections (e.g., Startup Village, AI Arena) interest our visitors.",
              ],
              [
                <strong>Preference</strong>,
                "Used for automatic language detection (French/English) based on your geolocation.",
              ],
              [
                <strong>Marketing</strong>,
                "Allow us to track the effectiveness of our campaigns for recruiting sponsors and speakers.",
              ],
            ]}
          />
        </LegalSubsection>

        <LegalSubsection title="Cookie Management">
          <LegalText>
            Upon your first visit, a banner allows you to accept or decline
            non-essential cookies. You can also configure your browser to block
            cookies, although this may limit access to certain site features, such
            as the automatic language selector.
          </LegalText>
        </LegalSubsection>
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
