import { cn } from "@/lib/utils"
import { Reveal } from "@/components/motion"

/** Interior-page hero: eyebrow + large title + subtitle over the ambient backdrop. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/50",
        className
      )}
    >
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:py-16">
        {eyebrow ? (
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/50 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-primary uppercase backdrop-blur">
              {eyebrow}
            </span>
          </Reveal>
        ) : null}
        <Reveal delay={0.05}>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {title}
          </h1>
        </Reveal>
        {subtitle ? (
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
              {subtitle}
            </p>
          </Reveal>
        ) : null}
        {children ? <Reveal delay={0.15}>{children}</Reveal> : null}
      </div>
    </section>
  )
}
