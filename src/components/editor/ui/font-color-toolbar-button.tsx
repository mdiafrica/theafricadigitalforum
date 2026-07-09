import * as React from "react"
import { EraserIcon, PlusIcon } from "lucide-react"
import { useEditorRef, useEditorSelector } from "platejs/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ToolbarButton } from "./toolbar"

/**
 * Font color / background color picker: a fixed palette grid, a native
 * color input for custom values, and Clear.
 */

type PaletteColor = { name: string; value: string; isBright?: boolean }

// Grays, vivid, light and dark rows from the Plate registry palette.
const PALETTE: PaletteColor[] = [
  { name: "black", value: "#000000" },
  { name: "dark grey 3", value: "#666666" },
  { name: "dark grey 1", value: "#B7B7B7" },
  { name: "grey", value: "#CCCCCC" },
  { name: "light grey 2", value: "#EFEFEF", isBright: true },
  { name: "white", value: "#FFFFFF", isBright: true },
  { name: "red", value: "#FE0000" },
  { name: "orange", value: "#FE9900" },
  { name: "yellow", value: "#FEFF00", isBright: true },
  { name: "green", value: "#00FF00" },
  { name: "cyan", value: "#00FFFF" },
  { name: "blue", value: "#1300FF" },
  { name: "purple", value: "#9900FF" },
  { name: "magenta", value: "#FF00FF" },
  { name: "light red 2", value: "#EA9999" },
  { name: "light orange 2", value: "#F9CB9C" },
  { name: "light yellow 2", value: "#FFE598", isBright: true },
  { name: "light green 2", value: "#B7D6A8" },
  { name: "light cyan 2", value: "#A1C4C9" },
  { name: "light blue 2", value: "#9FC5E8" },
  { name: "light purple 2", value: "#B5A7D5" },
  { name: "light magenta 2", value: "#D5A6BD" },
  { name: "dark red 2", value: "#990001" },
  { name: "dark orange 2", value: "#B45F05" },
  { name: "dark yellow 2", value: "#BF9002" },
  { name: "dark green 2", value: "#38761D" },
  { name: "dark cyan 2", value: "#124F5C" },
  { name: "dark blue 2", value: "#0C5394" },
  { name: "dark purple 2", value: "#351C75" },
  { name: "dark magenta 2", value: "#741B47" },
]

export function FontColorToolbarButton({
  children,
  nodeType,
  tooltip,
}: {
  children: React.ReactNode
  nodeType: string
  tooltip?: string
}) {
  const editor = useEditorRef()
  const [open, setOpen] = React.useState(false)

  const color = useEditorSelector(
    (editor) => editor.api.mark(nodeType) as string | undefined,
    [nodeType]
  )

  const applyColor = React.useCallback(
    (value: string) => {
      if (editor.selection) {
        editor.tf.select(editor.selection)
        editor.tf.addMarks({ [nodeType]: value })
      }
    },
    [editor, nodeType]
  )

  const applyColorAndClose = (value: string) => {
    applyColor(value)
    setOpen(false)
    setTimeout(() => editor.tf.focus(), 0)
  }

  const clearColor = () => {
    if (editor.selection) {
      editor.tf.select(editor.selection)
      editor.tf.removeMarks(nodeType)
    }
    setOpen(false)
    setTimeout(() => editor.tf.focus(), 0)
  }

  // Native color input, debounced so dragging in the picker doesn't spam
  // history with one mark per pixel.
  const colorInputRef = React.useRef<HTMLInputElement>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCustomColorChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => applyColor(value), 100)
  }
  React.useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    []
  )

  return (
    <DropdownMenu
      modal={false}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen && editor.selection) {
          setTimeout(() => editor.tf.focus(), 0)
        }
      }}
    >
      <DropdownMenuTrigger
        render={<ToolbarButton pressed={open} tooltip={tooltip} />}
      >
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ignore-click-outside/toolbar w-auto p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Colors</DropdownMenuLabel>
          <div className="grid grid-cols-8 place-items-center gap-1 px-1 py-1">
            {PALETTE.map(({ name, value, isBright }) => (
              <button
                key={value}
                aria-label={name}
                className={cn(
                  "size-6 cursor-pointer rounded-full border transition-transform hover:scale-125",
                  isBright ? "border-border" : "border-transparent",
                  color?.toLowerCase() === value.toLowerCase() &&
                    "ring-2 ring-ring ring-offset-1 ring-offset-popover"
                )}
                style={{ backgroundColor: value }}
                title={name}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyColorAndClose(value)}
              />
            ))}
            <button
              aria-label="Custom color"
              className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-input hover:bg-accent"
              title="Custom color"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => colorInputRef.current?.click()}
            >
              <PlusIcon className="size-3.5" />
              <input
                ref={colorInputRef}
                className="size-0 overflow-hidden border-0 p-0 opacity-0"
                type="color"
                value={color ?? "#000000"}
                onChange={(event) => onCustomColorChange(event.target.value)}
              />
            </button>
          </div>
        </DropdownMenuGroup>
        {color && (
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={clearColor}>
              <EraserIcon />
              <span>Clear</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
