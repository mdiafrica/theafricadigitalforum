import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from "@platejs/basic-styles/react"
import { KEYS } from "platejs"
import type { PlatePluginConfig } from "platejs/react"

const options = {
  inject: { targetPlugins: [KEYS.p] },
} satisfies PlatePluginConfig

// Font family is out of scope — color, background color and size only.
export const FontKit = [
  FontColorPlugin.configure({
    inject: {
      ...options.inject,
      nodeProps: {
        defaultNodeValue: "black",
      },
    },
  }),
  FontBackgroundColorPlugin.configure(options),
  FontSizePlugin.configure(options),
]
