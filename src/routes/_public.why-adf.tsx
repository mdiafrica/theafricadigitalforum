import { createFileRoute } from "@tanstack/react-router"
import {
  BrainCircuit,
  Cpu,
  LineChart,
  MicVocal,
  ShieldCheck,
  Wifi,
  type LucideIcon,
} from "lucide-react"

import { useI18n } from "@/i18n/context"
import { Reveal } from "@/components/motion"
import { Card } from "@/components/ui/card"
import heroBg from "@/assets/images/Image5.jpg"
import aiImage from "@/assets/images/AI.png"
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
        className="-mt-[85px] bg-cover bg-center px-[5%] pt-[120px] pb-[100px] text-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(5,13,26,0.6) 0%, rgba(5,13,26,0.95) 100%), url(${heroBg})`,
        }}
      >
        <div className="mx-auto max-w-[800px]">
          <Reveal>
            <h1 className="mb-4 text-[clamp(28px,4vw,48px)] font-extrabold tracking-[0.08em] text-white">
              {why.heroTitle}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto max-w-[680px] text-base leading-[1.6] text-white/70">
              {why.heroText}
            </p>
          </Reveal>
        </div>
      </section>

      {/* AI economic impact */}
      <section className="bg-white px-[5%] py-[80px]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 md:grid-cols-2 md:gap-[60px]">
          <Reveal delay={0.1}>
            <img
              src={aiImage}
              alt="AI economic impact on Africa"
              className="mx-auto w-full max-w-[600px] transition-transform duration-300 hover:scale-[1.02]"
            />
          </Reveal>
          <Reveal>
            <div className="text-center md:text-left">
              <div className="mb-4 flex items-start gap-5 max-md:justify-center">
                <div className="mt-1 h-9 w-1 shrink-0 rounded-sm bg-[#8b5cf6]" />
                <h2 className="text-2xl leading-[1.2] font-extrabold tracking-[0.05em] text-[#111111]">
                  {why.aiSection.heading}
                </h2>
              </div>
              <p className="text-[13px] leading-[1.65] text-[#333333] max-md:text-center md:mr-10 md:text-justify">
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
        <div className="absolute inset-0 bg-[rgba(5,13,26,0.88)]" />
        <div className="relative mx-auto max-w-[1200px] px-6">
          <Reveal>
            <div className="mb-[60px]">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-0.5 w-[30px] bg-[#8b5cf6]" />
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#c084fc] uppercase">
                  {why.agenda.eyebrow}
                </span>
              </div>
              <h2 className="mb-5 text-2xl leading-[1.2] font-extrabold tracking-[0.05em] text-white">
                {why.agenda.mainTitle}
              </h2>
              <div className="mb-6 h-[3px] w-[60px] bg-[#8b5cf6]" />
              <p className="max-w-[700px] text-[15px] leading-[1.6] text-white/70">
                {why.agenda.description}
              </p>
            </div>
          </Reveal>

          <div className="mx-auto grid max-w-[1400px] gap-8 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
            {why.agenda.items.map((item, i) => {
              const Icon = AGENDA_ICONS[i % AGENDA_ICONS.length]
              return (
                <Reveal key={item.title} delay={i * 0.07}>
                  <Card className="flex h-full flex-col items-center justify-center rounded-[24px] border-primary/20 bg-white/[0.05] px-6 py-8 text-center backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-2 hover:border-[#8b5cf6] hover:bg-white/10 hover:shadow-[0_20px_30px_-12px_rgba(0,0,0,0.3)]">
                    <Icon className="mb-4 size-10 text-[#8b5cf6]" />
                    <h3 className="mb-3 text-base leading-[1.3] font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="max-w-[90%] text-[13px] leading-[1.6] text-[#cbd5e1]">
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
