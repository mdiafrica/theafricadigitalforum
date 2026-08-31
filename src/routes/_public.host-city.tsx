import { useRef } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Hotel,
  MapPin,
  Plane,
  Monitor,
  ShieldCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"
import { pageHead } from "@/lib/seo"
import { Reveal } from "@/components/motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PreregisterFormDialog } from "@/components/preregister-form-dialog"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import heroBg from "@/assets/images/Image6.jpg"
import promoBg from "@/assets/images/image9.jpg"
import ctaBg from "@/assets/images/Image5.jpg"
import visaImg from "@/assets/images/visa.jpg"
import digitalHubImg from "@/assets/images/digitalhub.jpg"
import img1 from "@/assets/images/Image2.jpg"
import card1 from "@/assets/images/Image3.jpg"
import card3 from "@/assets/images/Image4.jpg"

const INFO_PHOTOS = [visaImg, digitalHubImg, img1]
const CARD_IMAGES = [heroBg, visaImg, card3, digitalHubImg, ctaBg, img1, card1]
const CARD_ICONS: LucideIcon[] = [
  Globe,
  MapPin,
  Plane,
  Monitor,
  ShieldCheck,
  Hotel,
]

export const Route = createFileRoute("/_public/host-city")({
  head: () => ({
    ...pageHead({
      title: m.meta_host_city_title(),
      description: m.meta_host_city_description(),
      path: "/host-city",
      locale: getLocale(),
      alternates: true,
    }),
  }),
  component: HostCityRoute,
})

function HostCityRoute() {
  const infoRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const badges = [
    m.city_info_badge_visa_free(),
    m.city_info_badge_digital_hub(),
    m.city_info_badge_five_star(),
  ]

  const cardItems = [
    {
      title: m.city_card_location_title(),
      subtitle: m.city_card_location_subtitle(),
      price: m.city_card_location_price(),
      description: m.city_card_location_description(),
    },
    {
      title: m.city_card_visa_free_title(),
      subtitle: m.city_card_visa_free_subtitle(),
      price: m.city_card_visa_free_price(),
      description: m.city_card_visa_free_description(),
    },
    {
      title: m.city_card_aviation_title(),
      subtitle: m.city_card_aviation_subtitle(),
      price: m.city_card_aviation_price(),
      description: m.city_card_aviation_description(),
    },
    {
      title: m.city_card_digital_ambition_title(),
      subtitle: m.city_card_digital_ambition_subtitle(),
      price: m.city_card_digital_ambition_price(),
      description: m.city_card_digital_ambition_description(),
    },
    {
      title: m.city_card_cybersecurity_title(),
      subtitle: m.city_card_cybersecurity_subtitle(),
      price: m.city_card_cybersecurity_price(),
      description: m.city_card_cybersecurity_description(),
    },
    {
      title: m.city_card_hospitality_title(),
      subtitle: m.city_card_hospitality_subtitle(),
      price: m.city_card_hospitality_price(),
      description: m.city_card_hospitality_description(),
    },
    {
      title: m.city_card_human_scale_title(),
      subtitle: m.city_card_human_scale_subtitle(),
      price: m.city_card_human_scale_price(),
      description: m.city_card_human_scale_description(),
    },
  ]

  const cards = cardItems.map((item, i) => ({
    ...item,
    img: CARD_IMAGES[i % CARD_IMAGES.length],
    Icon: CARD_ICONS[i % CARD_ICONS.length],
  }))

  const scrollBy = (delta: number) =>
    trackRef.current?.parentElement?.scrollBy({
      left: delta,
      behavior: "smooth",
    })

  return (
    <div className="bg-white font-nav text-ink">
      {/* Hero */}
      <section
        className="relative -mt-[85px] flex min-h-[480px] items-center justify-center overflow-hidden bg-cover bg-center pt-[105px] pb-8 text-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/45 to-background/72" />
        <div className="relative px-5">
          <Reveal>
            <h1 className="mb-3 text-[clamp(36px,5vw,64px)] leading-[1.1] font-extrabold tracking-[-0.02em] text-white">
              {m.city_hero_title()}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mb-7 text-[17px] text-white/[0.82]">
              {m.city_hero_subtitle()}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Button
              variant="outline"
              onClick={() =>
                infoRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="h-auto rounded border-2 border-white bg-transparent px-8 py-3 text-sm font-semibold tracking-[0.04em] text-white hover:bg-white hover:text-background dark:border-white dark:bg-transparent dark:hover:bg-white dark:hover:text-background"
            >
              {m.city_hero_cta()}
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Info + photo grid */}
      <div ref={infoRef}>
        <Reveal>
          <div className="grid items-stretch border-b border-ink/10 bg-white md:grid-cols-[1fr_1.6fr]">
            <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
              <h2 className="mb-2.5 text-[clamp(22px,2.5vw,32px)] font-extrabold tracking-[-0.02em] text-ink">
                {m.city_info_heading()}
              </h2>
              <div className="mb-5 h-[3px] w-10 rounded-sm bg-ink" />
              <p className="text-sm leading-[1.8] text-ink-muted">
                {m.city_info_body()}
              </p>
            </div>

            <div className="grid grid-cols-3">
              {INFO_PHOTOS.map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-[3/4] overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`Lomé highlight ${i + 1}`}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-[3px] bg-background/72 px-2.5 py-1 text-[11px] font-semibold text-white">
                    {badges[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Promo banner */}
      <Reveal>
        <div
          className="relative flex flex-col items-center justify-between gap-6 bg-secondary bg-cover bg-center px-[8%] py-16 md:flex-row"
          style={{ backgroundImage: `url(${promoBg})` }}
        >
          <div className="absolute inset-0 bg-background/60" />
          <div className="relative text-center md:text-left">
            <h3 className="mb-1.5 text-[clamp(22px,3vw,36px)] font-extrabold tracking-[-0.01em] text-white">
              {m.city_promo_heading()}
            </h3>
            <p className="text-sm text-white/65">{m.city_promo_subtitle()}</p>
          </div>
          <Dialog>
            <DialogTrigger
              render={
                <Button className="relative h-auto shrink-0 rounded bg-primary px-8 py-3 text-sm font-bold whitespace-nowrap text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-background hover:shadow-[0_8px_24px_rgba(124,58,237,0.4)] dark:hover:bg-white dark:hover:text-background" />
              }
            >
              {m.preregister_button()}
            </DialogTrigger>
              <PreregisterFormDialog />
          </Dialog>
        </div>
      </Reveal>

      {/* Pillar carousel */}
      <Reveal>
        <div className="bg-white px-[8%] py-16">
          <div className="mb-8">
            <h2 className="mb-2.5 text-[clamp(20px,2.5vw,28px)] font-extrabold tracking-[-0.01em] text-ink">
              {m.city_cards_title()}
            </h2>
            <div className="h-[3px] w-12 rounded-sm bg-primary" />
          </div>

          <div className="relative flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              aria-label="Scroll left"
              onClick={() => scrollBy(-400)}
              className="absolute -left-6 z-10 hidden size-12 rounded-full border-ink/10 bg-white text-primary shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:scale-110 hover:border-primary hover:bg-primary hover:text-white md:inline-flex dark:border-ink/10 dark:bg-white dark:hover:bg-primary"
            >
              <ChevronLeft className="size-7" />
            </Button>

            <div className="group flex-1 [scrollbar-width:none] overflow-x-auto rounded-2xl">
              <div
                ref={trackRef}
                className="flex w-max animate-[adf-marquee_40s_linear_infinite] gap-6 py-5 group-hover:[animation-play-state:paused]"
              >
                {[...cards, ...cards].map((card, i) => (
                  <PillarCard key={i} card={card} />
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              aria-label="Scroll right"
              onClick={() => scrollBy(400)}
              className="absolute -right-6 z-10 hidden size-12 rounded-full border-ink/10 bg-white text-primary shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:scale-110 hover:border-primary hover:bg-primary hover:text-white md:inline-flex dark:border-ink/10 dark:bg-white dark:hover:bg-primary"
            >
              <ChevronRight className="size-7" />
            </Button>
          </div>
        </div>
      </Reveal>

      {/* CTA band */}
      <Reveal>
        <div
          className="relative overflow-hidden bg-secondary bg-cover bg-center px-[8%] py-[100px] text-center"
          style={{ backgroundImage: `url(${ctaBg})` }}
        >
          <div className="absolute inset-0 bg-background/55" />
          <div className="relative">
            <h2 className="mb-3 text-[clamp(28px,4vw,52px)] font-extrabold tracking-[-0.02em] text-white">
              {m.city_cta_title()}
            </h2>
            <p className="mb-8 text-base text-white/[0.72]">
              {m.city_cta_subtitle()}
            </p>
            <Dialog>
              <DialogTrigger
                render={
                  <Button className="h-auto rounded bg-primary px-10 py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-background hover:shadow-[0_8px_24px_rgba(124,58,237,0.4)] dark:hover:bg-white dark:hover:text-background" />
                }
              >
                {m.preregister_button()}
              </DialogTrigger>
              <PreregisterFormDialog />
            </Dialog>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

type PillarCardData = {
  title: string
  subtitle: string
  price: string
  description: string
  img: string
  Icon: LucideIcon
}

function PillarCard({ card }: { card: PillarCardData }) {
  return (
    <Card className="group w-[260px] shrink-0 overflow-hidden rounded-2xl border-ink/10 bg-white p-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] sm:w-[360px]">
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={card.img}
          alt={card.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
        />
        <div className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-bold tracking-[0.5px] text-white">
          {card.price}
        </div>
      </div>
      <div className="p-5">
        <div className="mb-2 text-[11px] font-semibold tracking-[1px] text-primary uppercase">
          {card.subtitle}
        </div>
        <div className="mb-3 text-lg leading-[1.4] font-bold text-ink">
          {card.title}
        </div>
        <p className="mb-4 text-[13px] leading-[1.75] text-ink-muted max-md:text-xs max-md:leading-[1.6]">
          {card.description}
        </p>
        <div className="flex items-center gap-2 border-t border-ink/5 pt-3 text-xs text-ink-muted/80">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary/20">
            <card.Icon className="size-3.5" />
          </span>
          <span>{card.subtitle}</span>
        </div>
      </div>
    </Card>
  )
}
