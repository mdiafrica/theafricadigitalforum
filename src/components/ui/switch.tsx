"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[26px] w-12 shrink-0 cursor-pointer items-center rounded-full bg-[#d1d5db] p-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-gradient-to-br data-[checked]:from-primary data-[checked]:to-[#6d28d9]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[22px] rounded-full bg-white shadow-sm transition-transform data-[checked]:translate-x-[22px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
