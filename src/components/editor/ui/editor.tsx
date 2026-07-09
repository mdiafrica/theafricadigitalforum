import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { PlateContentProps } from "platejs/react"
import { PlateContainer, PlateContent } from "platejs/react"

import { cn } from "@/lib/utils"

const editorContainerVariants = cva(
  "relative w-full cursor-text overflow-y-auto caret-primary select-text selection:bg-primary/25 focus-visible:outline-none",
  {
    defaultVariants: { variant: "default" },
    variants: {
      variant: {
        default: "h-full",
        // Bordered field — the CMS form flavor.
        field: cn(
          "group rounded-lg border border-input ring-offset-background",
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
        ),
      },
    },
  }
)

export function EditorContainer({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof editorContainerVariants>) {
  return (
    <PlateContainer
      className={cn(
        "ignore-click-outside/toolbar",
        editorContainerVariants({ variant }),
        className
      )}
      {...props}
    />
  )
}

const editorVariants = cva(
  cn(
    "group/editor",
    "relative w-full cursor-text overflow-x-hidden break-words whitespace-break-spaces select-text",
    "rounded-md ring-offset-background focus-visible:outline-none",
    "placeholder:text-muted-foreground/80 **:data-slate-placeholder:!top-1/2 **:data-slate-placeholder:-translate-y-1/2 **:data-slate-placeholder:text-muted-foreground/80 **:data-slate-placeholder:opacity-100!",
    "[&_strong]:font-bold"
  ),
  {
    defaultVariants: { variant: "default" },
    variants: {
      disabled: { true: "cursor-not-allowed opacity-50" },
      variant: {
        default:
          "size-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]",
        field: "min-h-[280px] w-full px-6 py-4 text-base",
        // Chrome-free read-only rendering (public article bodies).
        view: "w-full cursor-auto text-base",
      },
    },
  }
)

export type EditorProps = PlateContentProps &
  VariantProps<typeof editorVariants>

export function Editor({
  className,
  disabled,
  variant,
  ...props
}: EditorProps) {
  return (
    <PlateContent
      className={cn(editorVariants({ disabled, variant }), className)}
      disableDefaultStyles
      disabled={disabled}
      {...props}
    />
  )
}
