import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"

import { useI18n } from "@/i18n/context"
import { usePageSection } from "@/domains/page-content"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import slide1 from "@/assets/images/Image2.jpg"
import slide2 from "@/assets/images/Image5.jpg"
import slide3 from "@/assets/images/Image6.jpg"

const SLIDE_IMAGES = [slide1, slide2, slide3]

export function Hero() {
  const { t, lang } = useI18n()
  const hero = usePageSection("home", "hero", lang, t.home.hero)
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setLoaded(true), 60)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((p) => (p + 1) % SLIDE_IMAGES.length),
      5000
    )
    return () => window.clearInterval(id)
  }, [])

  const slide = hero.slides[index] ?? { title: "", location: "" }
  const go = (next: number) =>
    setIndex((next + SLIDE_IMAGES.length) % SLIDE_IMAGES.length)

  const arrowClass =
    "absolute top-1/2 z-10 size-12 -translate-y-1/2 rounded-full border-white/30 bg-white/10 text-[28px] leading-none font-light text-white backdrop-blur-md hover:scale-105 hover:border-primary hover:bg-primary dark:border-white/30 dark:bg-white/10 dark:hover:bg-primary"

  return (
    <section className="relative -mt-[85px] flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-[5%] py-[120px] font-nav">
      {/* Slider */}
      <div className="absolute inset-0 z-0">
        {SLIDE_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-in-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
      </div>
      <div className="absolute inset-0 z-[1] bg-black/[0.82]" />

      {/* Prev / next */}
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous slide"
        onClick={() => go(index - 1)}
        className={cn(arrowClass, "left-[30px]")}
      >
        ‹
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Next slide"
        onClick={() => go(index + 1)}
        className={cn(arrowClass, "right-[30px]")}
      >
        ›
      </Button>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
        {SLIDE_IMAGES.map((_, i) => (
          <Button
            key={i}
            variant="ghost"
            size="icon"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2.5 min-h-0 rounded-full p-0 hover:bg-transparent dark:hover:bg-transparent",
              i === index
                ? "w-7 bg-primary hover:bg-primary"
                : "w-2.5 bg-white/35 hover:scale-125 hover:bg-white/75"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative z-[3] mx-auto max-w-[900px] text-center transition-all duration-700",
          loaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        )}
      >
        <div className="mt-[18px] mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.08] px-4 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-white/90 capitalize backdrop-blur-md">
          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          <span>{hero.date}</span>
        </div>

        <h1 className="mx-auto mb-6 text-[clamp(36px,5.5vw,64px)] leading-none font-bold tracking-[0.12em] text-white capitalize [text-shadow:0_10px_40px_rgba(0,0,0,0.35)]">
          {hero.title}
        </h1>

        <p className="mx-auto mb-9 max-w-[600px] text-[clamp(13px,1vw,15px)] leading-[1.75] tracking-[0.4px] text-white/85">
          {hero.tagline}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Button
            render={<Link to="/why-adf" />}
            className="h-auto border-2 border-primary px-9 py-3.5 text-sm font-bold tracking-[0.06em] text-white capitalize shadow-[0_4px_20px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 hover:border-[#6d28d9] hover:bg-[#6d28d9] hover:shadow-[0_8px_28px_rgba(124,58,237,0.55)]"
          >
            {hero.button}
          </Button>
        </div>
      </div>

      {/* Image caption */}
      <div className="absolute right-7 bottom-7 z-[3] rounded-full bg-black/35 px-3.5 py-[5px] text-[11px] font-medium tracking-[0.04em] text-white/50 backdrop-blur-sm">
        {slide.title} — {slide.location}
      </div>
    </section>
  )
}
