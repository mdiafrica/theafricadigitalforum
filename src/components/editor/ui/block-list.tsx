import type React from "react"
import { isOrderedList } from "@platejs/list"
import {
  useTodoListElement,
  useTodoListElementState,
} from "@platejs/list/react"
import type { TListElement } from "platejs"
import {
  type PlateElementProps,
  type RenderNodeWrapper,
  useReadOnly,
} from "platejs/react"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

const config: Record<
  string,
  {
    Li: React.FC<PlateElementProps>
    Marker: React.FC<PlateElementProps>
  }
> = {
  todo: {
    Li: TodoLi,
    Marker: TodoMarker,
  },
}

// Note: isOrderedList is true for numbered AND todo lists; plain bullets are
// styled via the list-kit nodeProps injection instead.
export const BlockList: RenderNodeWrapper = (props) => {
  if (!props.element.listStyleType) return
  if (!isOrderedList(props.element)) return

  return (props) => <List {...props} />
}

function List(props: PlateElementProps) {
  const { listStart, listStyleType } = props.element as TListElement
  const { Li, Marker } = config[listStyleType] ?? {}
  const ListTag = isOrderedList(props.element) ? "ol" : "ul"

  return (
    <ListTag
      className="relative m-0 p-0"
      start={listStart}
      style={{ listStyleType }}
    >
      {Marker && <Marker {...props} />}
      {Li ? <Li {...props} /> : <li>{props.children}</li>}
    </ListTag>
  )
}

function TodoMarker(props: PlateElementProps) {
  const state = useTodoListElementState({ element: props.element })
  const { checkboxProps } = useTodoListElement(state)
  const readOnly = useReadOnly()

  return (
    <div contentEditable={false}>
      <Checkbox
        className={cn(
          "absolute top-1 -left-6",
          readOnly && "pointer-events-none"
        )}
        checked={checkboxProps.checked}
        onCheckedChange={(checked) => checkboxProps.onCheckedChange(checked)}
      />
    </div>
  )
}

function TodoLi(props: PlateElementProps) {
  return (
    <li
      className={cn(
        "list-none",
        (props.element.checked as boolean) &&
          "text-muted-foreground line-through"
      )}
    >
      {props.children}
    </li>
  )
}
