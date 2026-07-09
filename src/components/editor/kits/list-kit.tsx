import {
  BulletedListRules,
  isOrderedList,
  OrderedListRules,
  TaskListRules,
} from "@platejs/list"
import { ListPlugin } from "@platejs/list/react"
import { IndentPlugin } from "@platejs/indent/react"
import { KEYS } from "platejs"

import { BlockList } from "../ui/block-list"

/** Lists are built on indentation — IndentPlugin is a hard dependency. */
const IndentKit = [
  IndentPlugin.configure({
    inject: {
      targetPlugins: [
        ...KEYS.heading,
        KEYS.p,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.img,
      ],
    },
    options: { offset: 24 },
  }),
]

export const ListKit = [
  ...IndentKit,
  ListPlugin.configure({
    inputRules: [
      BulletedListRules.markdown({ variant: "-" }),
      BulletedListRules.markdown({ variant: "*" }),
      OrderedListRules.markdown({ variant: "." }),
      OrderedListRules.markdown({ variant: ")" }),
      TaskListRules.markdown({ checked: false }),
      TaskListRules.markdown({ checked: true }),
    ],
    inject: {
      nodeProps: {
        nodeKey: KEYS.listType,
        query: ({ nodeProps }) => {
          const element = nodeProps.element
          return !!element?.listStyleType && !isOrderedList(element)
        },
        transformProps: ({ props }) => ({
          ...props,
          role: "listitem",
          style: { ...props.style, display: "list-item" },
        }),
      },
      targetPlugins: [
        ...KEYS.heading,
        KEYS.p,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.img,
      ],
    },
    render: { belowNodes: BlockList },
  }),
]
