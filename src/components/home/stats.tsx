import {
  Globe2,
  Handshake,
  MicVocal,
  Rocket,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"

import { useI18n } from "@/i18n/context"
import { usePageSection } from "@/domains/page-content"
import { useCountUp, useInView } from "@/components/motion"

const STAT_ICONS: LucideIcon[] = [
  Users,
  Globe2,
  MicVocal,
  Rocket,
  Handshake,
  TrendingUp,
]

const STAT_DEFAULTS = [
  { value: 1000, suffix: "+" },
  { value: 50, suffix: "+" },
  { value: 150, suffix: "+" },
  { value: 200, suffix: "+" },
  { value: 100, suffix: "+" },
  { value: 50, suffix: "+" },
]

export function Stats() {
  const { t, lang } = useI18n()
  const section = usePageSection("home", "stats", lang, {
    items: STAT_DEFAULTS.map((stat, i) => ({
      ...stat,
      label: t.home.stats[i]?.label ?? "",
    })),
  })
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 })

  return (
    <section className="border-b border-primary/20 bg-black px-[5%] pt-[30px] pb-[70px] font-nav">
      <div
        ref={ref}
        className="mx-auto grid max-w-[1200px] grid-cols-3 gap-[14px] lg:grid-cols-6"
      >
        {section.items.map((stat, i) => (
          <StatCard
            key={i}
            target={Number(stat.value) || 0}
            suffix={stat.suffix ?? ""}
            icon={STAT_ICONS[i % STAT_ICONS.length]}
            label={stat.label}
            delay={i * 0.1}
            started={inView}
          />
        ))}
      </div>
    </section>
  )
}

function StatCard({
  target,
  suffix,
  icon: Icon,
  label,
  delay,
  started,
}: {
  target: number
  suffix: string
  icon: LucideIcon
  label: string
  delay: number
  started: boolean
}) {
  const count = useCountUp(target, 1800, started)
  return (
    <div
      className="text-center"
      style={{
        opacity: started ? 1 : 0,
        transform: started ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
      }}
    >
      <Icon className="mx-auto mb-2.5 size-5 text-primary" />
      <div className="mb-2 text-[clamp(22px,2.5vw,36px)] leading-none font-extrabold tracking-[-0.02em] text-white tabular-nums">
        {count.toLocaleString()}
        <span className="align-super text-[0.5em] font-bold">{suffix}</span>
      </div>
      <div className="text-[8px] font-semibold tracking-[0.1em] text-white/50 uppercase">
        {label}
      </div>
    </div>
  )
}
