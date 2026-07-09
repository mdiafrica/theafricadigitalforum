import * as React from "react"
import { createPortal } from "react-dom"
import { filterWords } from "@platejs/combobox"
import {
  useComboboxInput,
  useHTMLInputCursorState,
} from "@platejs/combobox/react"
import { flip, offset, useVirtualFloating } from "@platejs/floating"
import type { PointRef, TElement } from "platejs"
import { useEditorRef } from "platejs/react"

import { cn } from "@/lib/utils"

/**
 * Inline combobox for trigger menus (slash command; later mentions/emoji),
 * built on `useComboboxInput` (cancel/removal semantics) and
 * `@platejs/floating` (positioning).
 */

export interface InlineComboboxItemData {
  icon?: React.ReactNode
  value: string
  label?: string
  keywords?: string[]
  focusEditor?: boolean
  onSelect: () => void
}

export interface InlineComboboxGroupData {
  group: string
  items: InlineComboboxItemData[]
}

function matchesSearch(
  item: InlineComboboxItemData,
  group: string,
  search: string
): boolean {
  if (!search) return true
  const terms = new Set(
    [item.value, item.label, group, ...(item.keywords ?? [])].filter(
      (term): term is string => !!term
    )
  )
  return Array.from(terms).some((term) => filterWords(term, search))
}

export function InlineCombobox({
  element,
  trigger,
  groups,
  filter = true,
  hideWhenNoValue = false,
  onValueChange,
}: {
  element: TElement
  trigger: string
  groups: InlineComboboxGroupData[]
  /** Set false when the parent already derives `groups` from the search. */
  filter?: boolean
  /** Emoji-style menus: keep the popup closed until something is typed. */
  hideWhenNoValue?: boolean
  onValueChange?: (value: string) => void
}) {
  const editor = useEditorRef()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const cursorState = useHTMLInputCursorState(inputRef)
  const [value, setValue] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)

  // Where to re-insert the typed text if the combobox is cancelled.
  const insertPointRef = React.useRef<PointRef | null>(null)
  React.useEffect(() => {
    insertPointRef.current?.unref()
    insertPointRef.current = null

    const path = editor.api.findPath(element)
    if (!path) return
    const point = editor.api.before(path)
    if (!point) return

    const pointRef = editor.api.pointRef(point)
    insertPointRef.current = pointRef
    return () => {
      if (insertPointRef.current === pointRef) insertPointRef.current = null
      pointRef.unref()
    }
  }, [editor, element])

  const { props: inputProps, removeInput } = useComboboxInput({
    autoFocus: true,
    cancelInputOnBlur: true,
    cursorState,
    ref: inputRef,
    onCancelInput: (cause) => {
      if (cause !== "backspace") {
        editor.tf.insertText(trigger + value, {
          at: insertPointRef.current?.current ?? undefined,
        })
      }
      if (cause === "arrowLeft" || cause === "arrowRight") {
        editor.tf.move({ distance: 1, reverse: cause === "arrowLeft" })
      }
    },
  })

  const filteredGroups = React.useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: filter
            ? group.items.filter((item) =>
                matchesSearch(item, group.group, value)
              )
            : group.items,
        }))
        .filter((group) => group.items.length > 0),
    [filter, groups, value]
  )
  const flatItems = React.useMemo(
    () => filteredGroups.flatMap((group) => group.items),
    [filteredGroups]
  )

  React.useEffect(() => {
    setActiveIndex(0)
  }, [value])

  const selectItem = React.useCallback(
    (item: InlineComboboxItemData) => {
      removeInput(item.focusEditor ?? true)
      item.onSelect()
    },
    [removeInput]
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Plate glue first (escape/backspace/arrow-out cancellation).
    inputProps.onKeyDown(event)
    if (event.defaultPrevented) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % Math.max(flatItems.length, 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex(
        (index) =>
          (index - 1 + Math.max(flatItems.length, 1)) %
          Math.max(flatItems.length, 1)
      )
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault()
      const item = flatItems[activeIndex]
      if (item) selectItem(item)
    }
  }

  // Anchor the popup to the inline trigger span via floating-ui.
  const anchorRef = React.useRef<HTMLSpanElement>(null)
  const { refs, style } = useVirtualFloating({
    open: true,
    getBoundingClientRect: () =>
      anchorRef.current?.getBoundingClientRect() ??
      new DOMRect(-9999, -9999, 0, 0),
    middleware: [offset(4), flip({ padding: 12 })],
    placement: "bottom-start",
  })

  let itemIndex = -1

  return (
    <span contentEditable={false} ref={anchorRef}>
      {trigger}
      <span className="relative min-h-[1lh]">
        <span aria-hidden className="invisible overflow-hidden text-nowrap">
          {value || "​"}
        </span>
        <input
          ref={inputRef}
          className="absolute top-0 left-0 size-full bg-transparent outline-none"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            onValueChange?.(event.target.value)
          }}
          onBlur={inputProps.onBlur}
          onKeyDown={handleKeyDown}
        />
      </span>

      {typeof document !== "undefined" &&
        !(hideWhenNoValue && !value) &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={style}
            className="z-50 max-h-[288px] w-[300px] overflow-y-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
          >
            {flatItems.length === 0 ? (
              <div className="mx-1 flex h-[28px] items-center px-2 text-sm text-muted-foreground select-none">
                No results
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.group} className="py-1.5 not-last:border-b">
                  <div className="mt-1.5 mb-2 px-3 text-xs font-medium text-muted-foreground">
                    {group.group}
                  </div>
                  {group.items.map((item) => {
                    itemIndex += 1
                    const index = itemIndex
                    return (
                      <div
                        key={item.value}
                        role="option"
                        aria-selected={index === activeIndex}
                        className={cn(
                          "relative mx-1 flex h-[28px] cursor-pointer items-center gap-2 rounded-sm px-2 text-sm text-foreground transition-colors select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                          index === activeIndex &&
                            "bg-accent text-accent-foreground"
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectItem(item)}
                      >
                        {item.icon}
                        {item.label ?? item.value}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>,
          document.body
        )}
    </span>
  )
}
