import * as React from "react"
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function Toolbar({ className, ...props }: ToolbarPrimitive.Root.Props) {
  return (
    <TooltipProvider delay={400}>
      <ToolbarPrimitive.Root
        className={cn("relative flex items-center select-none", className)}
        {...props}
      />
    </TooltipProvider>
  )
}

export function ToolbarSeparator({
  className,
  ...props
}: ToolbarPrimitive.Separator.Props) {
  return (
    <ToolbarPrimitive.Separator
      className={cn(
        "mx-2 my-1 w-px shrink-0 self-stretch bg-border",
        className
      )}
      {...props}
    />
  )
}

export function ToolbarGroup({
  children,
  className,
}: React.ComponentProps<"div">) {
  return (
    <ToolbarPrimitive.Group
      className={cn(
        "group/toolbar-group relative flex shrink-0 items-center gap-0.5",
        "not-last:after:mx-1.5 not-last:after:h-5 not-last:after:w-px not-last:after:bg-border not-last:after:content-['']",
        className
      )}
    >
      {children}
    </ToolbarPrimitive.Group>
  )
}

const toolbarButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-accent aria-expanded:text-accent-foreground aria-pressed:bg-accent aria-pressed:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: { size: "sm", variant: "default" },
    variants: {
      size: {
        default: "h-9 min-w-9 px-2",
        lg: "h-10 min-w-10 px-2.5",
        sm: "h-8 min-w-8 px-1.5",
      },
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
    },
  }
)

export type ToolbarButtonProps = {
  isDropdown?: boolean
  pressed?: boolean
  tooltip?: React.ReactNode
} & ToolbarPrimitive.Button.Props &
  VariantProps<typeof toolbarButtonVariants>

export function ToolbarButton({
  children,
  className,
  isDropdown,
  pressed,
  size = "sm",
  tooltip,
  variant,
  ...props
}: ToolbarButtonProps) {
  const button = (
    <ToolbarPrimitive.Button
      aria-pressed={typeof pressed === "boolean" ? pressed : undefined}
      className={cn(
        toolbarButtonVariants({ size, variant }),
        isDropdown && "justify-between gap-1 pr-1",
        className
      )}
      // Toolbar buttons must not steal focus from the editor selection.
      onMouseDown={(event) => event.preventDefault()}
      {...props}
    >
      {isDropdown ? (
        <>
          <div className="flex flex-1 items-center gap-2 whitespace-nowrap">
            {children}
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" data-icon />
        </>
      ) : (
        children
      )}
    </ToolbarPrimitive.Button>
  )

  if (!tooltip) return button

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
