import * as React from "react"
import { EmojiInlineIndexSearch, insertEmoji } from "@platejs/emoji"
import { EmojiPlugin } from "@platejs/emoji/react"
import type { TComboboxInputElement } from "platejs"
import type { PlateElementProps } from "platejs/react"
import { PlateElement, usePluginOption } from "platejs/react"

import { InlineCombobox, type InlineComboboxGroupData } from "./inline-combobox"

const TRAILING_COLON_REGEX = /:$/

function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])
  return debounced
}

export function EmojiInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props
  const data = usePluginOption(EmojiPlugin, "data")!
  const [value, setValue] = React.useState("")
  const debouncedValue = useDebounce(value, 100)

  const groups = React.useMemo<InlineComboboxGroupData[]>(() => {
    const search = debouncedValue.replace(TRAILING_COLON_REGEX, "").trim()
    if (!search) return []

    const emojis = EmojiInlineIndexSearch.getInstance(data).search(search).get()

    if (emojis.length === 0) return []
    return [
      {
        group: "Emoji",
        items: emojis.map((emoji) => ({
          value: emoji.name,
          label: `${emoji.skins[0].native} ${emoji.name}`,
          onSelect: () => insertEmoji(editor, emoji),
        })),
      },
    ]
  }, [data, debouncedValue, editor])

  return (
    <PlateElement {...props} as="span" data-slate-value={element.value}>
      <InlineCombobox
        element={element}
        trigger=":"
        groups={groups}
        filter={false}
        hideWhenNoValue
        onValueChange={setValue}
      />
      {props.children}
    </PlateElement>
  )
}
