"use client"

import { ChevronsUpDown, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type MultiSelectOption = {
  value: string
  label: string
  /** Optional swatch dot rendered before the label (e.g. category color). */
  color?: string
}

/**
 * Checkbox-list multi-select on the Base-UI popover — selected options show
 * as removable badges in the trigger. API mirrors awf's MultiSelect
 * (values/onValuesChange) without the cmdk dependency.
 */
export function MultiSelect({
  options,
  values,
  onValuesChange,
  placeholder = "Select…",
  disabled,
  className,
  id,
}: {
  options: MultiSelectOption[]
  values: string[]
  onValuesChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}) {
  const selected = options.filter((option) => values.includes(option.value))

  const toggle = (value: string) => {
    onValuesChange(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value]
    )
  }

  return (
    <Popover>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        className={cn(
          "flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {selected.length > 0 ? (
          <span className="flex flex-wrap items-center gap-1.5">
            {selected.map((option) => (
              <Badge key={option.value} variant="secondary" className="gap-1">
                {option.color && (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.label}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${option.label}`}
                  className="-mr-0.5 rounded-sm opacity-60 hover:opacity-100"
                  onClick={(event) => {
                    event.stopPropagation()
                    toggle(option.value)
                  }}
                >
                  <XIcon className="size-3" />
                </span>
              </Badge>
            ))}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="max-h-72 w-(--anchor-width) min-w-56 overflow-y-auto p-1.5"
      >
        {options.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">
            No options available.
          </p>
        ) : (
          options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <Checkbox
                checked={values.includes(option.value)}
                onCheckedChange={() => toggle(option.value)}
              />
              {option.color && (
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
              )}
              <span className="truncate">{option.label}</span>
            </label>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}
