import { createFileRoute } from "@tanstack/react-router"
import {
  BrainCircuit,
  Cpu,
  LineChart,
  MicVocal,
  ShieldCheck,
  Wifi,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { useI18n } from "@/i18n/context"
import { Reveal } from "@/components/motion"
import { Card } from "@/components/ui/card"
import heroBg from "@/assets/images/Image4.jpg"
import agendaBg from "@/assets/images/Image2.jpg"

const AGENDA_ICONS: LucideIcon[] = [
  Wifi,
  BrainCircuit,
  LineChart,
  ShieldCheck,
  Cpu,
  MicVocal,
]

export const Route = createFileRoute("/_public/why-adf")({
  head: () => ({
    meta: [
      { title: "Why ADF | Africa Digital Forum" },
      {
        name: "description",
        content:
          "Why the Africa Digital Forum matters: agenda, themes and what to expect.",
      },
      { property: "og:title", content: "Why ADF | Africa Digital Forum" },
      {
        property: "og:description",
        content:
          "Why the Africa Digital Forum matters: agenda, themes and what to expect.",
      },
    ],
  }),
  component: WhyAdfRoute,
})

function WhyAdfRoute() {
  const { t } = useI18n()
  const why = t.whyadf

  return (
    <div className="font-nav">
      {/* Hero */}
      <section
        className="-mt-[85px] flex min-h-[70vh] items-center justify-center bg-cover bg-center px-[5%] pt-[160px] pb-[140px] text-center max-[480px]:min-h-[40vh] max-[480px]:pt-[100px] max-[480px]:pb-[80px] max-md:min-h-[50vh] max-md:pt-[120px] max-md:pb-[100px]"
        style={{
          backgroundImage: `linear-gradient(180deg, color-mix(in srgb, var(--background) 60%, transparent) 0%, color-mix(in srgb, var(--background) 95%, transparent) 100%), url(${heroBg})`,
        }}
      >
        <div className="mx-auto max-w-[800px]">
          <Reveal>
            <h1 className="mb-5 text-[clamp(32px,4.5vw,52px)] font-extrabold tracking-[0.08em] text-white max-[480px]:text-[28px] max-[480px]:tracking-[0.05em]">
              {why.heroTitle}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto max-w-[680px] text-lg leading-[1.7] text-white/75 max-md:text-[15px]">
              {why.heroText}
            </p>
          </Reveal>
        </div>
      </section>

      {/* AI economic impact */}
      <section className="bg-white px-[5%] py-[80px]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 md:grid-cols-2 md:gap-[60px]">
          <Reveal delay={0.1}>
            <div className="flex min-h-[180px] flex-col items-start justify-center rounded-[24px] max-[480px]:min-h-[100px] max-md:min-h-[140px] max-md:items-center">
              <div className="flex items-center max-md:justify-center">
                <span className="text-[clamp(32px,3vw,42px)] leading-none font-extrabold tracking-[-0.02em] text-primary max-[480px]:text-[clamp(22px,5vw,28px)] max-md:text-[clamp(28px,4vw,36px)]">
                  $
                </span>
                <span className="text-[clamp(28px,2.6vw,38px)] leading-none font-extrabold tracking-[-0.02em] text-ink max-[480px]:text-[clamp(18px,4vw,24px)] max-md:text-[clamp(24px,3.5vw,32px)]">
                  1,000,000,000,000
                </span>
              </div>
              <div className="mt-4 h-[3px] w-[100px] rounded-[2px] bg-primary max-[480px]:mt-2.5 max-[480px]:h-0.5 max-[480px]:w-[60px] max-md:mt-3 max-md:w-20" />
            </div>
          </Reveal>
          <Reveal>
            <div className="text-center md:text-left">
              <div className="mb-4 flex items-start gap-5 max-md:justify-center">
                <div className="mt-1 h-9 w-1 shrink-0 rounded-sm bg-primary" />
                <h2 className="text-2xl leading-[1.2] font-extrabold tracking-[0.05em] text-ink">
                  {why.aiSection.heading}
                </h2>
              </div>
              <p className="text-[13px] leading-[1.65] text-ink/90 max-md:text-center md:mr-10 md:text-justify">
                {why.aiSection.paragraph}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Six-point agenda */}
      <section
        className="relative bg-cover bg-fixed bg-center px-[5%] py-[100px]"
        style={{ backgroundImage: `url(${agendaBg})` }}
      >
        <div className="absolute inset-0 bg-background/88" />
        <div className="relative mx-auto max-w-[1200px] px-6">
          <Reveal>
            <div className="mb-[60px]">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-0.5 w-[30px] bg-primary" />
                <span className="text-[9px] font-bold tracking-[0.2em] text-accent-foreground uppercase">
                  {why.agenda.eyebrow}
                </span>
              </div>
              <h2 className="mb-5 text-2xl leading-[1.2] font-extrabold tracking-[0.05em] text-white">
                {why.agenda.mainTitle}
              </h2>
              <div className="mb-6 h-[3px] w-[60px] rounded-[2px] bg-primary" />
              <p className="max-w-[700px] text-[15px] leading-[1.6] text-white/70">
                {why.agenda.description}
              </p>
            </div>
          </Reveal>

          <div className="mx-auto grid max-w-[1400px] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] gap-8">
            {why.agenda.items.map((item, i) => {
              const Icon = AGENDA_ICONS[i % AGENDA_ICONS.length]
              return (
                <Reveal key={item.title} delay={i * 0.07}>
                  <Card className="flex h-full flex-col items-center justify-center rounded-[24px] border-primary/20 bg-white/[0.05] px-6 py-8 text-center backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:bg-white/10 hover:shadow-[0_20px_30px_-12px_rgba(0,0,0,0.3)]">
                    <Icon className="mb-4 size-10 text-primary" />
                    <h3 className="mb-3 text-base leading-[1.3] font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="max-w-[90%] text-[13px] leading-[1.6] text-white/70">
                      {item.description}
                    </p>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
