import * as React from "react"
import { useEquationElement, useEquationInput } from "@platejs/math/react"
import { CornerDownLeftIcon, RadicalIcon } from "lucide-react"
import type { TEquationElement } from "platejs"
import type { PlateElementProps } from "platejs/react"
import {
  PlateElement,
  useEditorRef,
  useEditorSelector,
  useElement,
  useReadOnly,
  useSelected,
} from "platejs/react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/** Block + inline TeX equations (KaTeX). */

const KATEX_OPTIONS = {
  displayMode: true,
  errorColor: "#cc0000",
  fleqn: false,
  leqno: false,
  macros: { "\\f": "#1f(#2)" },
  output: "htmlAndMathml",
  strict: "warn",
  throwOnError: false,
  trust: false,
} as const

export function EquationElement(props: PlateElementProps<TEquationElement>) {
  const selected = useSelected()
  const [open, setOpen] = React.useState(selected)
  const katexRef = React.useRef<HTMLDivElement | null>(null)

  useEquationElement({
    element: props.element,
    katexRef,
    options: KATEX_OPTIONS,
  })

  return (
    <PlateElement className="my-1" {...props}>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger
          nativeButton={false}
          render={
            <div
              className={cn(
                "group flex cursor-pointer items-center justify-center rounded-sm select-none hover:bg-primary/10 data-[selected=true]:bg-primary/10",
                props.element.texExpression.length === 0
                  ? "bg-muted p-3 pr-9"
                  : "px-2 py-1"
              )}
              contentEditable={false}
              data-selected={selected}
              role="button"
            />
          }
        >
          {props.element.texExpression.length > 0 ? (
            <span ref={katexRef} />
          ) : (
            <div className="flex h-7 w-full items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
              <RadicalIcon className="size-6 text-muted-foreground/80" />
              <div>Add a TeX equation</div>
            </div>
          )}
        </PopoverTrigger>

        <EquationPopoverContent
          isInline={false}
          open={open}
          placeholder={
            "f(x) = \\begin{cases}\n  x^2, &\\quad x > 0 \\\\\n  0, &\\quad x = 0 \\\\\n  -x^2, &\\quad x < 0\n\\end{cases}"
          }
          setOpen={setOpen}
        />
      </Popover>

      {props.children}
    </PlateElement>
  )
}

export function InlineEquationElement(
  props: PlateElementProps<TEquationElement>
) {
  const { element } = props
  const katexRef = React.useRef<HTMLDivElement | null>(null)
  const selected = useSelected()
  const isCollapsed = useEditorSelector(
    (editor) => editor.api.isCollapsed(),
    []
  )
  const [open, setOpen] = React.useState(selected && isCollapsed)

  React.useEffect(() => {
    // Open the popover when the editor selection enters the equation.
    if (selected && isCollapsed) setOpen(true)
  }, [selected, isCollapsed])

  useEquationElement({
    element,
    katexRef,
    options: KATEX_OPTIONS,
  })

  return (
    <PlateElement
      {...props}
      className="mx-1 inline-block rounded-sm select-none [&_.katex-display]:my-0!"
    >
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger
          nativeButton={false}
          render={
            <div
              className={cn(
                "relative inline-flex h-6 items-center rounded-sm px-px",
                ((element.texExpression.length > 0 && open) || selected) &&
                  "bg-primary/15",
                element.texExpression.length === 0 &&
                  "bg-muted text-muted-foreground"
              )}
              contentEditable={false}
            />
          }
        >
          <span
            className={cn(
              element.texExpression.length === 0 && "hidden",
              "font-mono leading-none"
            )}
            ref={katexRef}
          />
          {element.texExpression.length === 0 && (
            <span className="text-sm whitespace-nowrap">
              <RadicalIcon className="mr-1 inline-block h-[19px] w-4 py-[1.5px] align-text-bottom" />
              New equation
            </span>
          )}
        </PopoverTrigger>

        <EquationPopoverContent
          isInline
          open={open}
          placeholder="E = mc^2"
          setOpen={setOpen}
        />
      </Popover>

      {props.children}
    </PlateElement>
  )
}

function EquationPopoverContent({
  isInline,
  open,
  placeholder,
  setOpen,
}: {
  isInline: boolean
  open: boolean
  placeholder: string
  setOpen: (open: boolean) => void
}) {
  const editor = useEditorRef()
  const readOnly = useReadOnly()
  const element = useElement<TEquationElement>()

  const onClose = React.useCallback(() => {
    setOpen(false)
    editor.tf.select(element, { focus: true, next: true })
  }, [editor, element, setOpen])

  const { props: inputProps, ref: inputRef } = useEquationInput({
    isInline,
    open,
    onClose,
  })

  if (readOnly) return null

  return (
    <PopoverContent
      className="flex w-auto gap-2 p-2"
      contentEditable={false}
      align="start"
    >
      <textarea
        ref={inputRef}
        autoFocus
        className="max-h-[50vh] min-w-64 grow resize-none rounded-md bg-muted/50 p-2 font-mono text-sm outline-none"
        placeholder={placeholder}
        rows={isInline ? 1 : 4}
        {...inputProps}
      />
      <Button className="px-3" onClick={onClose} variant="secondary" size="sm">
        Done <CornerDownLeftIcon className="size-3.5" />
      </Button>
    </PopoverContent>
  )
}
