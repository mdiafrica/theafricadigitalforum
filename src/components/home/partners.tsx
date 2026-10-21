import { m } from "@/paraglide/messages"
import { useInView } from "@/components/motion"
import { PARTNER_TIERS, usePublicPartnersQuery } from "@/domains/partners"
import type { PartnerTier, PublicPartner } from "@/domains/partners"
import bolingoLogo from "@/assets/images/bolingo-logo.png"
import mdiLogo from "@/assets/images/mdi-logo.png"
import partnersBackground from "@/assets/images/Image2.jpg"

const TIER_LABELS: Record<PartnerTier, () => string> = {
  host: () => m.home_partners_tier_host(),
  cohosts: () => m.home_partners_tier_cohosts(),
  title: () => m.home_partners_tier_title(),
  platinum: () => m.home_partners_tier_platinum(),
  diamond: () => m.home_partners_tier_diamond(),
  gold: () => m.home_partners_tier_gold(),
  silver: () => m.home_partners_tier_silver(),
}

function fallbackLogo(partner: PublicPartner) {
  if (partner.logoUrl) return partner.logoUrl
  if (partner.name === "Bolingo Consult") return bolingoLogo
  if (
    partner.name === "Media & Digital Institute" ||
    partner.name === "IMD University" ||
    partner.name === "Media & Digital Institute Africa Foundation Inc"
  ) {
    return mdiLogo
  }
  return undefined
}

type Tier = { id: PartnerTier; label: () => string; partners: PublicPartner[] }

function groupPartners(partners: PublicPartner[]): Tier[] {
  return PARTNER_TIERS.map((id) => ({
    id,
    label: TIER_LABELS[id],
    partners: partners.filter((partner) => partner.tier === id),
  })).filter((tier) => tier.partners.length > 0)
}

function sortPartners(partners: PublicPartner[]) {
  return [...partners].sort(
    (left, right) =>
      PARTNER_TIERS.indexOf(left.tier) - PARTNER_TIERS.indexOf(right.tier) ||
      left.sortOrder - right.sortOrder
  )
}

export function Partners() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })
  const partnersQuery = usePublicPartnersQuery()
  const tiers = groupPartners(sortPartners(partnersQuery.data ?? []))
  if (
    tiers.length === 0 &&
    !partnersQuery.isPending &&
    !partnersQuery.isError
  ) {
    return null
  }

  return (
    <section
      id="partners"
      className="relative scroll-mt-[85px] overflow-hidden border-b border-primary/20 bg-cover bg-center px-[5%] py-[90px] font-nav"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.84), rgba(0, 0, 0, 0.84)), url(${partnersBackground})`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[320px] bg-[radial-gradient(ellipse_at_50%_100%,rgba(124,58,237,0.28),transparent_70%)]"
      />
      <div
        ref={ref}
        className="relative mx-auto max-w-[960px]"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(30px)",
          transition:
            "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="mb-3 inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.14em] text-primary uppercase">
          <span className="h-0.5 w-6 rounded-sm bg-primary" />
          {m.home_partners_eyebrow()}
        </div>
        <h2 className="mb-3 max-w-[680px] text-2xl font-extrabold tracking-[0.05em] text-white after:mt-3 after:block after:h-[3px] after:w-11 after:rounded-sm after:bg-primary">
          {m.home_partners_title()}
        </h2>
        <p className="mb-10 max-w-[560px] text-[13px] leading-[1.6] text-white/60">
          {m.home_partners_subtitle()}
        </p>

        {partnersQuery.isError && (
          <p role="status" className="mb-6 text-sm text-white/70">
            Partner information is temporarily unavailable.
          </p>
        )}

        {tiers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tiers.map((tier, index) => (
              <article
                key={tier.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/40 sm:p-6"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView
                    ? "translateY(0) scale(1)"
                    : "translateY(24px) scale(0.94)",
                  transition: `opacity 0.65s cubic-bezier(0.4,0,0.2,1) ${index * 0.12}s, transform 0.65s cubic-bezier(0.4,0,0.2,1) ${index * 0.12}s, border-color 0.3s ease, translate 0.3s ease, scale 0.3s ease`,
                }}
              >
                <h3 className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-white/45 uppercase">
                  {tier.label()}
                </h3>
                <ul className="flex flex-col gap-3">
                  {tier.partners.map((partner) => {
                    const logo = fallbackLogo(partner)
                    const details = (
                      <>
                        {logo && (
                          <img
                            src={logo}
                            alt=""
                            loading="lazy"
                            className="h-12 w-16 shrink-0 rounded-lg bg-white object-contain p-2"
                          />
                        )}
                        <span className="text-sm font-semibold text-white">
                          {partner.name}
                        </span>
                      </>
                    )

                    return (
                      <li
                        key={partner.id}
                        className="min-h-20 rounded-xl border border-white/10 bg-black/40 p-3"
                      >
                        {partner.websiteUrl ? (
                          <a
                            href={partner.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex min-h-14 items-center gap-3"
                          >
                            {details}
                          </a>
                        ) : (
                          <div className="flex min-h-14 items-center gap-3">
                            {details}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
