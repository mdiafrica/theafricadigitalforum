import {
  Brain,
  Building2,
  Crown,
  Rocket,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

import { useI18n } from "@/i18n/context"
import { usePageSection } from "@/domains/page-content"

const ICONS: LucideIcon[] = [Crown, Building2, UsersRound, Rocket, Brain, Trophy]

export function Dialogues() {
  const { t, lang } = useI18n()
  const section = usePageSection("home", "dialogues", lang, {
    label: t.home.dialoguesLabel,
    title: t.home.dialoguesTitle,
    subtitle: t.home.dialoguesSubtitle,
    items: t.home.dialogues,
  })

  return (
    <section className="border-y border-[#ede9fe] bg-[#f5f5f5] px-[5%] py-20 font-nav">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-[60px] text-left">
          <div className="mb-3 inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.14em] text-primary uppercase">
            <span className="h-0.5 w-6 rounded-sm bg-primary" />
            {section.label}
          </div>
          <h2 className="mb-3 text-2xl font-extrabold tracking-[0.05em] text-[#1a1a1a] after:mt-3 after:block after:h-[3px] after:w-11 after:rounded-sm after:bg-primary">
            {section.title}
          </h2>
          <p className="max-w-[560px] text-sm leading-[1.6] text-black/60">
            {section.subtitle}
          </p>
        </div>

        <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <div
                key={item.title}
                className="flex h-full flex-col items-center rounded-[20px] border border-black/[0.04] bg-white px-7 pt-8 pb-9 text-center"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-[14px] border-[0.5px] border-primary/20 bg-primary/[0.08] px-[18px] py-3.5">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="mb-3 text-base font-bold tracking-[0.02em] text-[#1a1a1a]">
                  {item.title}
                </h3>
                <p className="max-w-[90%] text-[13px] leading-[1.6] text-black/70">
                  {item.text}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
