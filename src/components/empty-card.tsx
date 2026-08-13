import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Empty state for the light "paper" sections of the public site. */
export function EmptyCard({
  icon: Icon,
  className,
  children,
}: {
  icon: LucideIcon
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-white py-16 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="max-w-sm text-sm text-ink-muted">{children}</p>
    </div>
  )
}
