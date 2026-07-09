import { useRef } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Hotel,
  MapPin,
  Plane,
  Monitor,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

import { useI18n } from "@/i18n/context"
import { Reveal } from "@/components/motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import heroBg from "@/assets/images/Image6.jpg"
import promoBg from "@/assets/images/image9.jpg"
import ctaBg from "@/assets/images/Image2.jpg"
import img1 from "@/assets/images/Image2.jpg"
import img2 from "@/assets/images/Image5.jpg"
import img9 from "@/assets/images/image9.jpg"
import card1 from "@/assets/images/Image3.jpg"
import card2 from "@/assets/images/Image2.jpg"
import card3 from "@/assets/images/Image4.jpg"
import card4 from "@/assets/images/Image6.jpg"
import card5 from "@/assets/images/Image5.jpg"
import card6 from "@/assets/images/Image7.jpeg"

const INFO_PHOTOS = [img1, img2, img9]
const CARD_IMAGES = [card1, card2, card3, card4, card5, card6]
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
    meta: [
      { title: "Host City | Africa Digital Forum" },
      {
        name: "description",
        content: "Discover the host city of the Africa Digital Forum.",
      },
      { property: "og:title", content: "Host City | Africa Digital Forum" },
      {
        property: "og:description",
        content: "Discover the host city of the Africa Digital Forum.",
      },
    ],
  }),
  component: HostCityRoute,
})

function HostCityRoute() {
  const { t } = useI18n()
  const city = t.city
  const infoRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const cards = city.cards.items.map((item, i) => ({
    ...item,
    img: CARD_IMAGES[i % CARD_IMAGES.length],
    Icon: CARD_ICONS[i % CARD_ICONS.length],
  }))

  const scrollBy = (delta: number) =>
    trackRef.current?.parentElement?.scrollBy({ left: delta, behavior: "smooth" })

  return (
    <div className="bg-white font-nav text-[#1a1a1a]">
      {/* Hero */}
      <section
        className="relative -mt-[85px] flex h-[480px] items-center justify-center overflow-hidden bg-cover bg-center pt-[85px] text-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(5,13,26,0.45)] to-[rgba(5,13,26,0.72)]" />
        <div className="relative px-5">
          <Reveal>
            <h1 className="mb-3 text-[clamp(36px,5vw,64px)] leading-[1.1] font-extrabold tracking-[-0.02em] text-white">
              {city.hero.title}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mb-7 text-[17px] text-white/[0.82]">
              {city.hero.subtitle}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Button
              variant="outline"
              onClick={() =>
                infoRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="h-auto rounded border-2 border-white bg-transparent px-8 py-3 text-sm font-semibold tracking-[0.04em] text-white hover:bg-white hover:text-[#050d1a] dark:border-white dark:bg-transparent dark:hover:bg-white dark:hover:text-[#050d1a]"
            >
              {city.hero.cta}
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Info + photo grid */}
      <div ref={infoRef}>
        <Reveal>
          <div className="grid items-stretch border-b border-[#e8e8e8] bg-white md:grid-cols-[1fr_1.6fr]">
            <div className="flex flex-col justify-center px-12 py-14">
              <h2 className="mb-2.5 text-[clamp(22px,2.5vw,32px)] font-extrabold tracking-[-0.02em] text-[#1a1a1a]">
                {city.info.heading}
              </h2>
              <div className="mb-5 h-[3px] w-10 rounded-sm bg-[#1a1a1a]" />
              <p className="text-sm leading-[1.8] text-[#666666]">
                {city.info.body}
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
                  <span className="absolute bottom-2.5 left-2.5 rounded-[3px] bg-[rgba(5,13,26,0.72)] px-2.5 py-1 text-[11px] font-semibold text-white">
                    {city.info.badges[i]}
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
          className="relative flex flex-col items-center justify-between gap-6 bg-[#0d1f3c] bg-cover bg-center px-[8%] py-16 md:flex-row"
          style={{ backgroundImage: `url(${promoBg})` }}
        >
          <div className="absolute inset-0 bg-[rgba(5,13,26,0.6)]" />
          <div className="relative text-center md:text-left">
            <h3 className="mb-1.5 text-[clamp(22px,3vw,36px)] font-extrabold tracking-[-0.01em] text-white">
              {city.promo.heading}
            </h3>
            <p className="text-sm text-white/65">{city.promo.subtitle}</p>
          </div>
          <Button
            render={<Link to="/why-adf" />}
            className="relative h-auto shrink-0 rounded bg-white px-8 py-3 text-sm font-bold whitespace-nowrap text-[#050d1a] hover:bg-[#e8e8e8]"
          >
            {city.promo.button}
          </Button>
        </div>
      </Reveal>

      {/* Pillar carousel */}
      <Reveal>
        <div className="bg-white px-[8%] py-16">
          <div className="mb-8">
            <h2 className="mb-2.5 text-[clamp(20px,2.5vw,28px)] font-extrabold tracking-[-0.01em] text-[#1a1a1a]">
              {city.cards.title}
            </h2>
            <div className="h-[3px] w-12 rounded-sm bg-primary" />
          </div>

          <div className="relative flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              aria-label="Scroll left"
              onClick={() => scrollBy(-400)}
              className="absolute -left-6 z-10 size-12 rounded-full border-[#e8e8e8] bg-white text-primary shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:scale-110 hover:border-primary hover:bg-primary hover:text-white dark:border-[#e8e8e8] dark:bg-white dark:hover:bg-primary"
            >
              <ChevronLeft className="size-7" />
            </Button>

            <div className="group flex-1 overflow-x-auto rounded-2xl [scrollbar-width:none]">
              <div
                ref={trackRef}
                className="flex w-max gap-6 py-5 animate-[adf-marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]"
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
              className="absolute -right-6 z-10 size-12 rounded-full border-[#e8e8e8] bg-white text-primary shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:scale-110 hover:border-primary hover:bg-primary hover:text-white dark:border-[#e8e8e8] dark:bg-white dark:hover:bg-primary"
            >
              <ChevronRight className="size-7" />
            </Button>
          </div>
        </div>
      </Reveal>

      {/* CTA band */}
      <Reveal>
        <div
          className="relative overflow-hidden bg-[#0d1f3c] bg-cover bg-center px-[8%] py-[100px] text-center"
          style={{ backgroundImage: `url(${ctaBg})` }}
        >
          <div className="absolute inset-0 bg-[rgba(5,13,26,0.55)]" />
          <div className="relative">
            <h2 className="mb-3 text-[clamp(28px,4vw,52px)] font-extrabold tracking-[-0.02em] text-white">
              {city.cta.title}
            </h2>
            <p className="mb-8 text-base text-white/[0.72]">
              {city.cta.subtitle}
            </p>
            <Button
              render={<Link to="/contact" />}
              className="h-auto rounded bg-white px-10 py-3.5 text-[15px] font-bold text-[#050d1a] hover:bg-[#e8e8e8]"
            >
              {city.cta.button}
            </Button>
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
    <Card className="group w-[360px] shrink-0 overflow-hidden rounded-2xl border-[#e8e8e8] bg-white p-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
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
        <div className="mb-3 text-lg leading-[1.4] font-bold text-[#1a1a1a]">
          {card.title}
        </div>
        <p className="mb-4 line-clamp-4 text-[13px] leading-[1.6] text-[#666666]">
          {card.description}
        </p>
        <div className="flex items-center gap-2 border-t border-[#f0f0f0] pt-3 text-xs text-[#888888]">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary/20">
            <card.Icon className="size-3.5" />
          </span>
          <span>{card.subtitle}</span>
        </div>
      </div>
    </Card>
  )
}
