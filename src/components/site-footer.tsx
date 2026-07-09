import { Link } from "@tanstack/react-router"

import { useI18n } from "@/i18n/context"
import { Button } from "@/components/ui/button"
import { NewsletterForm } from "@/components/newsletter-form"
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/brand-icons"
import Logo from "@/assets/images/Logo.png"

type SocialIcon = (props: React.SVGProps<SVGSVGElement>) => React.ReactElement

/**
 * Link destinations paralleling the i18n `footer.cols` order (columns × links),
 * so localized labels keep their targets across languages. `null` = plain text.
 */
const LINK_TARGETS: (string | null)[][] = [
  ["/", "/about", "/about", "/about", "/why-adf"],
  ["/blog", "/host-city", "/#speakers", "https://mdiafrica.org/en/", "/contact"],
  [
    "https://www.facebook.com/theafricadigitalforum/",
    "https://www.linkedin.com/company/theafricadigitalforum/",
    "https://x.com/theafricadigitalforum",
    "https://www.instagram.com/theafricadigitalforum/",
    "https://youtube.com/@theafricadigitalforum",
  ],
]

const SOCIALS: { icon: SocialIcon; href: string; label: string; color: string }[] =
  [
    {
      icon: FacebookIcon,
      href: "https://www.facebook.com/theafricadigitalforum/",
      label: "Facebook",
      color: "#1877F2",
    },
    {
      icon: LinkedinIcon,
      href: "https://www.linkedin.com/company/theafricadigitalforum/",
      label: "LinkedIn",
      color: "#0A66C2",
    },
    {
      icon: XIcon,
      href: "https://x.com/theafricadigitalforum",
      label: "X",
      color: "#ffffff",
    },
    {
      icon: InstagramIcon,
      href: "https://www.instagram.com/theafricadigitalforum/",
      label: "Instagram",
      color: "#E4405F",
    },
    {
      icon: YoutubeIcon,
      href: "https://youtube.com/@theafricadigitalforum",
      label: "YouTube",
      color: "#FF0000",
    },
  ]

const LEGAL_LINKS = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Use", to: "/terms" },
  { label: "Cookie Policy", to: "/privacy" },
] as const

const FOOTER_LINK_CLASS =
  "block py-1.5 text-left text-[13.5px] font-medium tracking-[0.04em] text-[#cccccc] transition-all hover:translate-x-1 hover:text-white"

export function SiteFooter() {
  const { t } = useI18n()
  const footer = t.footer
  const copy = t.home.latest.newsletter
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-[1] border-t border-white/[0.12] bg-black font-nav tracking-[0.02em]">
      <div className="mx-auto max-w-[1400px] px-8 py-6">
        <div className="grid gap-9 border-b border-white/[0.12] pb-6 lg:grid-cols-[1.8fr_repeat(3,1fr)]">
          {/* Logo + description + organizer + newsletter */}
          <div>
            <Link
              to="/"
              aria-label="Africa Digital Forum — home"
              className="flex items-center"
            >
              <img
                src={Logo}
                alt="Africa Digital Forum"
                className="h-[100px] w-auto object-contain"
              />
            </Link>

            <p className="mt-0 mb-4 max-w-[300px] text-[13.5px] leading-[1.8] tracking-[0.03em] text-[#cccccc]">
              {footer.desc}
            </p>

            <p className="text-xs tracking-[0.04em] text-[#888888]">
              {footer.organizer}:{" "}
              <a
                href="https://mdiafrica.org/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#aaaaaa] transition-colors hover:text-white"
              >
                {footer.orgName}
              </a>
            </p>

            <div className="mt-6">
              <div className="mb-2.5 text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
                {copy.label}
              </div>
              <NewsletterForm
                inputClassName="h-auto rounded-lg border-white/20 bg-white/[0.06] py-2.5 text-xs tracking-[0.03em] text-white placeholder:text-[#888888] focus-visible:border-primary focus-visible:ring-primary/20"
                buttonClassName="h-auto rounded-lg bg-gradient-to-br from-primary to-[#a066f5] px-[18px] py-2.5 text-xs font-bold tracking-[0.1em] uppercase shadow-[0_4px_16px_rgba(124,58,237,0.3)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(124,58,237,0.5)]"
              />
            </div>
          </div>

          {/* Link columns */}
          {footer.cols.map((col, colIndex) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-bold tracking-[0.12em] text-white uppercase lg:mt-7">
                {col.title}
              </h3>
              {col.links.map((label, i) => {
                const target = LINK_TARGETS[colIndex]?.[i]
                if (!target)
                  return (
                    <span
                      key={label}
                      className="block py-1.5 text-[13.5px] text-[#cccccc]"
                    >
                      {label}
                    </span>
                  )
                if (target.startsWith("http"))
                  return (
                    <a
                      key={label}
                      href={target}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={FOOTER_LINK_CLASS}
                    >
                      {label}
                    </a>
                  )
                return target.startsWith("/#") ? (
                  <a key={label} href={target.slice(1)} className={FOOTER_LINK_CLASS}>
                    {label}
                  </a>
                ) : (
                  <Link key={label} to={target} className={FOOTER_LINK_CLASS}>
                    {label}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-5 pt-2 text-xs text-[#888888]">
          <span className="font-medium tracking-[0.04em]">
            {footer.copy?.replace("2025", String(year)) ??
              `© ${year} Africa Digital Forum. All rights reserved.`}
          </span>

          <div className="flex flex-wrap gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-[11px] font-medium tracking-[0.06em] text-[#888888] transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ icon: Icon, href, label, color }) => (
              <Button
                key={label}
                variant="outline"
                size="icon"
                render={
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                  />
                }
                className="rounded-lg border-white/20 bg-white/[0.08] hover:-translate-y-px hover:border-[#cccccc] hover:bg-white/[0.14] dark:border-white/20 dark:bg-white/[0.08] dark:hover:bg-white/[0.14]"
              >
                <Icon className="size-[18px]" style={{ color }} />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
