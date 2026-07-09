import { cn } from "@/lib/utils"
import { Reveal } from "@/components/motion"

/** Eyebrow label + heading + optional subtitle, used across marketing sections. */
export function SectionHeading({
  label,
  title,
  subtitle,
  align = "center",
  className,
}: {
  label?: string
  title: string
  subtitle?: string
  align?: "center" | "left"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center"
          ? "mx-auto max-w-2xl items-center text-center"
          : "items-start text-left",
        className
      )}
    >
      {label ? (
        <Reveal>
          <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            <span className="h-px w-8 bg-primary/60" />
            {label}
          </span>
        </Reveal>
      ) : null}
      <Reveal delay={0.05}>
        <h2 className="text-3xl font-extrabold text-balance sm:text-4xl md:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>
      {subtitle ? (
        <Reveal delay={0.1}>
          <p
            className={cn(
              "text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg",
              align === "center" ? "max-w-2xl" : "max-w-xl"
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      ) : null}
    </div>
  )
}
