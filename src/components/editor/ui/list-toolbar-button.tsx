import { ListStyleType, someList, toggleList } from "@platejs/list"
import {
  useIndentTodoToolBarButton,
  useIndentTodoToolBarButtonState,
} from "@platejs/list/react"
import { List, ListOrdered, ListTodoIcon } from "lucide-react"
import { useEditorRef, useEditorSelector } from "platejs/react"

import { ToolbarButton } from "./toolbar"

export function BulletedListToolbarButton() {
  const editor = useEditorRef()
  const pressed = useEditorSelector(
    (editor) =>
      someList(editor, [
        ListStyleType.Disc,
        ListStyleType.Circle,
        ListStyleType.Square,
      ]),
    []
  )

  return (
    <ToolbarButton
      pressed={pressed}
      tooltip="Bulleted list"
      onClick={() => toggleList(editor, { listStyleType: ListStyleType.Disc })}
    >
      <List />
    </ToolbarButton>
  )
}

export function NumberedListToolbarButton() {
  const editor = useEditorRef()
  const pressed = useEditorSelector(
    (editor) =>
      someList(editor, [
        ListStyleType.Decimal,
        ListStyleType.LowerAlpha,
        ListStyleType.UpperAlpha,
        ListStyleType.LowerRoman,
        ListStyleType.UpperRoman,
      ]),
    []
  )

  return (
    <ToolbarButton
      pressed={pressed}
      tooltip="Numbered list"
      onClick={() =>
        toggleList(editor, { listStyleType: ListStyleType.Decimal })
      }
    >
      <ListOrdered />
    </ToolbarButton>
  )
}

export function TodoListToolbarButton() {
  const state = useIndentTodoToolBarButtonState({ nodeType: "todo" })
  const { props: buttonProps } = useIndentTodoToolBarButton(state)

  return (
    <ToolbarButton {...buttonProps} tooltip="To-do list">
      <ListTodoIcon />
    </ToolbarButton>
  )
}
