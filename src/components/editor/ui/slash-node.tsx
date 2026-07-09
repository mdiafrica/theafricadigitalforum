import {
  Columns3Icon,
  FileCodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrdered,
  MinusIcon,
  PilcrowIcon,
  Quote,
  RadicalIcon,
  Square,
} from "lucide-react"
import { KEYS, type TComboboxInputElement } from "platejs"
import type { PlateEditor, PlateElementProps } from "platejs/react"
import { PlateElement } from "platejs/react"

import {
  ACTION_THREE_COLUMNS,
  insertBlock,
  insertInlineElement,
} from "@/components/editor/transforms"
import { InlineCombobox, type InlineComboboxGroupData } from "./inline-combobox"

function buildGroups(editor: PlateEditor): InlineComboboxGroupData[] {
  const block = (value: string) => () => insertBlock(editor, value)
  const inline = (value: string) => () => insertInlineElement(editor, value)

  return [
    {
      group: "Basic blocks",
      items: [
        {
          icon: <PilcrowIcon />,
          keywords: ["paragraph"],
          label: "Text",
          value: KEYS.p,
          onSelect: block(KEYS.p),
        },
        {
          icon: <Heading1Icon />,
          keywords: ["title", "h1"],
          label: "Heading 1",
          value: KEYS.h1,
          onSelect: block(KEYS.h1),
        },
        {
          icon: <Heading2Icon />,
          keywords: ["subtitle", "h2"],
          label: "Heading 2",
          value: KEYS.h2,
          onSelect: block(KEYS.h2),
        },
        {
          icon: <Heading3Icon />,
          keywords: ["subtitle", "h3"],
          label: "Heading 3",
          value: KEYS.h3,
          onSelect: block(KEYS.h3),
        },
        {
          icon: <ListIcon />,
          keywords: ["unordered", "ul", "-"],
          label: "Bulleted list",
          value: KEYS.ul,
          onSelect: block(KEYS.ul),
        },
        {
          icon: <ListOrdered />,
          keywords: ["ordered", "ol", "1"],
          label: "Numbered list",
          value: KEYS.ol,
          onSelect: block(KEYS.ol),
        },
        {
          icon: <Square />,
          keywords: ["checklist", "task", "checkbox", "[]"],
          label: "To-do list",
          value: KEYS.listTodo,
          onSelect: block(KEYS.listTodo),
        },
        {
          icon: <FileCodeIcon />,
          keywords: ["```", "code"],
          label: "Code block",
          value: KEYS.codeBlock,
          onSelect: block(KEYS.codeBlock),
        },
        {
          icon: <Quote />,
          keywords: ["citation", "blockquote", ">"],
          label: "Quote",
          value: KEYS.blockquote,
          onSelect: block(KEYS.blockquote),
        },
        {
          icon: <MinusIcon />,
          keywords: ["divider", "hr", "---"],
          label: "Divider",
          value: KEYS.hr,
          onSelect: block(KEYS.hr),
        },
      ],
    },
    {
      group: "Advanced blocks",
      items: [
        {
          icon: <Columns3Icon />,
          keywords: ["layout", "columns"],
          label: "3 columns",
          value: ACTION_THREE_COLUMNS,
          onSelect: block(ACTION_THREE_COLUMNS),
        },
        {
          icon: <RadicalIcon />,
          keywords: ["math", "tex", "katex", "formula"],
          label: "Equation",
          value: KEYS.equation,
          onSelect: block(KEYS.equation),
        },
      ],
    },
    {
      group: "Media",
      items: [
        {
          icon: <ImageIcon />,
          keywords: ["photo", "picture", "media"],
          label: "Image",
          value: KEYS.img,
          onSelect: block(KEYS.img),
        },
      ],
    },
    {
      group: "Inline",
      items: [
        {
          icon: <Link2Icon />,
          keywords: ["url", "hyperlink"],
          label: "Link",
          value: KEYS.link,
          focusEditor: false,
          onSelect: inline(KEYS.link),
        },
        {
          icon: <RadicalIcon />,
          keywords: ["math", "tex", "formula"],
          label: "Inline equation",
          value: KEYS.inlineEquation,
          onSelect: inline(KEYS.inlineEquation),
        },
      ],
    },
  ]
}

export function SlashInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props

  return (
    <PlateElement {...props} as="span" data-slate-value={element.value}>
      <InlineCombobox
        element={element}
        trigger="/"
        groups={buildGroups(editor)}
      />
      {props.children}
    </PlateElement>
  )
}
