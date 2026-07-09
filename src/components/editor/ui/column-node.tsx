import * as React from "react"
import { setColumns } from "@platejs/layout"
import { Trash2Icon } from "lucide-react"
import type { TColumnElement } from "platejs"
import type { PlateElementProps } from "platejs/react"
import {
  PlateElement,
  useEditorRef,
  useEditorSelector,
  useElement,
  useFocusedLast,
  useReadOnly,
  useRemoveNodeButton,
  useSelected,
} from "platejs/react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/**
 * Column layout nodes with a width-preset floating toolbar. Drag-and-drop
 * and block-selection integration are deferred.
 */

export function ColumnElement(props: PlateElementProps<TColumnElement>) {
  const { width } = props.element
  const readOnly = useReadOnly()

  return (
    <div className="group/column relative" style={{ width: width ?? "100%" }}>
      <PlateElement
        {...props}
        className="h-full px-2 pt-2 group-first/column:pl-0 group-last/column:pr-0"
      >
        <div
          className={cn(
            "relative h-full border border-transparent p-1.5",
            !readOnly && "rounded-lg border-dashed border-border"
          )}
        >
          {props.children}
        </div>
      </PlateElement>
    </div>
  )
}

export function ColumnGroupElement(props: PlateElementProps) {
  return (
    <PlateElement className="mb-2" {...props}>
      <ColumnFloatingToolbar>
        <div className="flex size-full rounded">{props.children}</div>
      </ColumnFloatingToolbar>
    </PlateElement>
  )
}

function ColumnFloatingToolbar({ children }: React.PropsWithChildren) {
  const editor = useEditorRef()
  const readOnly = useReadOnly()
  const element = useElement<TColumnElement>()
  const { props: buttonProps } = useRemoveNodeButton({ element })
  const selected = useSelected()
  const isCollapsed = useEditorSelector(
    (editor) => editor.api.isCollapsed(),
    []
  )
  const isFocusedLast = useFocusedLast()
  const anchorRef = React.useRef<HTMLDivElement>(null)

  const open = isFocusedLast && !readOnly && selected && isCollapsed

  const onColumnChange = (widths: string[]) => {
    setColumns(editor, { at: element, widths })
  }

  return (
    <>
      <div ref={anchorRef}>{children}</div>
      <Popover open={open} modal={false}>
        <PopoverContent
          align="center"
          side="top"
          sideOffset={10}
          anchor={anchorRef}
          className="w-auto p-1"
          initialFocus={false}
        >
          <div className="box-content flex h-8 items-center">
            <Button
              className="size-8"
              onClick={() => onColumnChange(["50%", "50%"])}
              variant="ghost"
            >
              <ColumnIcon widths={[50, 50]} />
            </Button>
            <Button
              className="size-8"
              onClick={() => onColumnChange(["33%", "33%", "33%"])}
              variant="ghost"
            >
              <ColumnIcon widths={[33, 33, 33]} />
            </Button>
            <Button
              className="size-8"
              onClick={() => onColumnChange(["70%", "30%"])}
              variant="ghost"
            >
              <ColumnIcon widths={[70, 30]} />
            </Button>
            <Button
              className="size-8"
              onClick={() => onColumnChange(["30%", "70%"])}
              variant="ghost"
            >
              <ColumnIcon widths={[30, 70]} />
            </Button>
            <Button
              className="size-8"
              onClick={() => onColumnChange(["25%", "50%", "25%"])}
              variant="ghost"
            >
              <ColumnIcon widths={[25, 50, 25]} />
            </Button>

            <Separator className="mx-1 h-6" orientation="vertical" />
            <Button className="size-8" variant="ghost" {...buttonProps}>
              <Trash2Icon />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}

/** One 16×16 outline icon covers every width preset. */
function ColumnIcon({ widths }: { widths: number[] }) {
  const total = widths.reduce((sum, width) => sum + width, 0)
  const inner = 12
  const gap = 1
  const available = inner - gap * (widths.length - 1)
  let x = 2
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      {widths.map((width, index) => {
        const w = (width / total) * available
        const rect = (
          <rect
            key={index}
            x={x}
            y={2.5}
            width={w}
            height={11}
            rx={1}
            stroke="currentColor"
          />
        )
        x += w + gap
        return rect
      })}
    </svg>
  )
}
