import { createPlatePlugin } from "platejs/react"

import { FixedToolbar } from "../ui/fixed-toolbar"
import { FixedToolbarButtons } from "../ui/fixed-toolbar-buttons"
import { FloatingToolbar } from "../ui/floating-toolbar"
import { FloatingToolbarButtons } from "../ui/floating-toolbar-buttons"

/** Toolbars are plugins (render hooks), not JSX children. */
export const FixedToolbarKit = [
  createPlatePlugin({
    key: "fixed-toolbar",
    render: {
      beforeEditable: () => (
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      ),
    },
  }),
]

export const FloatingToolbarKit = [
  createPlatePlugin({
    key: "floating-toolbar",
    render: {
      afterEditable: () => (
        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      ),
    },
  }),
]
