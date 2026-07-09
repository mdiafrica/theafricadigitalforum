import * as React from "react"
import {
  CheckIcon,
  Columns3Icon,
  FileCodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  SquareIcon,
} from "lucide-react"
import type { TElement } from "platejs"
import { KEYS } from "platejs"
import { useEditorRef, useSelectionFragmentProp } from "platejs/react"

import {
  ACTION_THREE_COLUMNS,
  getBlockType,
  setBlockType,
} from "@/components/editor/transforms"
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

const turnIntoItems = [
  { icon: <PilcrowIcon />, label: "Text", value: KEYS.p },
  { icon: <Heading1Icon />, label: "Heading 1", value: "h1" },
  { icon: <Heading2Icon />, label: "Heading 2", value: "h2" },
  { icon: <Heading3Icon />, label: "Heading 3", value: "h3" },
  { icon: <Heading4Icon />, label: "Heading 4", value: "h4" },
  { icon: <ListIcon />, label: "Bulleted list", value: KEYS.ul },
  { icon: <ListOrderedIcon />, label: "Numbered list", value: KEYS.ol },
  { icon: <SquareIcon />, label: "To-do list", value: KEYS.listTodo },
  { icon: <FileCodeIcon />, label: "Code", value: KEYS.codeBlock },
  { icon: <QuoteIcon />, label: "Quote", value: KEYS.blockquote },
  { icon: <Columns3Icon />, label: "3 columns", value: ACTION_THREE_COLUMNS },
]

export function TurnIntoToolbarButton() {
  const editor = useEditorRef()
  const [open, setOpen] = React.useState(false)

  const value = useSelectionFragmentProp({
    defaultValue: KEYS.p,
    getProp: (node) => getBlockType(node as TElement),
  })
  const selectedItem = React.useMemo(
    () =>
      turnIntoItems.find((item) => item.value === (value ?? KEYS.p)) ??
      turnIntoItems[0],
    [value]
  )

  return (
    <DropdownMenu
      modal={false}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) editor.tf.focus()
      }}
    >
      <DropdownMenuTrigger
        render={
          <ToolbarButton
            className="min-w-[125px]"
            isDropdown
            pressed={open}
            tooltip="Turn into"
          />
        }
      >
        {selectedItem.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ignore-click-outside/toolbar w-auto min-w-[180px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Turn into</DropdownMenuLabel>
          {turnIntoItems.map(({ icon, label, value: itemValue }) => (
            <DropdownMenuItem
              key={itemValue}
              className="relative min-w-[180px] pr-8"
              onClick={() => setBlockType(editor, itemValue)}
            >
              {icon}
              {label}
              <CheckIcon
                className={cn(
                  "absolute right-2 size-3.5",
                  itemValue === (value ?? KEYS.p) ? "opacity-100" : "opacity-0"
                )}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
