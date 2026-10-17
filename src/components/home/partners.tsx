import { m } from "@/paraglide/messages"
import { useInView } from "@/components/motion"

type Tier = { label: () => string; names: Array<string> }

// Tiers with no names are hidden. Add a name here to show it on the homepage.
const TIERS: Array<Tier> = [
  { label: () => m.home_partners_tier_host(), names: ["MDI"] },
  {
    label: () => m.home_partners_tier_cohosts(),
    names: ["IMD University", "MDI Africa Foundation Inc"],
  },
  { label: () => m.home_partners_tier_title(), names: [] },
  { label: () => m.home_partners_tier_platinum(), names: [] },
  { label: () => m.home_partners_tier_diamond(), names: [] },
  { label: () => m.home_partners_tier_gold(), names: [] },
  { label: () => m.home_partners_tier_silver(), names: ["Bolingo Consult"] },
]

export function Partners() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })
  const tiers = TIERS.filter((tier) => tier.names.length > 0)
  if (tiers.length === 0) return null

  return (
    <section className="relative overflow-hidden border-b border-primary/20 bg-black px-[5%] py-[90px] font-nav">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[320px] bg-[radial-gradient(ellipse_at_50%_100%,rgba(124,58,237,0.28),transparent_70%)]"
      />
      <div
        ref={ref}
        className="relative mx-auto max-w-[1100px]"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(30px)",
          transition:
            "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <p className="mb-3 text-[13px] font-semibold text-primary">
          {m.home_partners_eyebrow()}
        </p>
        <h2 className="mb-3 max-w-[760px] text-[clamp(30px,4.5vw,56px)] leading-[1.05] font-extrabold tracking-[-0.03em] text-white">
          {m.home_partners_title()}
        </h2>
        <p className="mb-14 text-[15px] text-white/55">
          {m.home_partners_subtitle()}
        </p>

        <div className="flex flex-col gap-12">
          {tiers.map((tier) => (
            <div key={tier.label()}>
              <h3 className="mb-6 text-[11px] font-semibold tracking-[0.18em] text-white/45 uppercase">
                {tier.label()}
              </h3>
              <ul className="flex flex-wrap items-center gap-x-14 gap-y-8">
                {tier.names.map((name) => (
                  <li
                    key={name}
                    className="text-[clamp(20px,2.4vw,30px)] font-extrabold tracking-[-0.02em] text-white"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
