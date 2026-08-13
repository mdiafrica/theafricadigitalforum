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

/**
 * Paste hygiene: Google Docs stamps default colors (`color:#000000`, white
 * highlights) on everything it exports. Those are noise — site typography
 * should govern — while genuinely chromatic colors (red, green, brand
 * purple…) are author intent and survive. Toolbar-applied colors are
 * unaffected; this only filters HTML deserialization.
 */
function parseRgb(value: string): [number, number, number] | null {
  const v = value.trim().toLowerCase()
  if (v === "black" || v === "windowtext") return [0, 0, 0]
  if (v === "white") return [255, 255, 255]
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(v)?.[1]
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ]
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(v)
  if (rgb) {
    const parts = rgb[1].split(",").map((p) => parseFloat(p))
    if (parts.length === 4 && parts[3] === 0) return [255, 255, 255]
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
  }
  return null
}

function keepPastedColor(value: string | undefined): string | undefined {
  if (!value) return undefined
  const rgb = parseRgb(value)
  // Unparseable (var(), currentcolor, …) is junk — drop it.
  if (!rgb) return undefined
  const nearBlack = rgb.every((channel) => channel <= 50)
  const nearWhite = rgb.every((channel) => channel >= 230)
  return nearBlack || nearWhite ? undefined : value
}

// Font family is out of scope — color, background color and size only.
export const FontKit = [
  FontColorPlugin.extend({
    parsers: {
      html: {
        deserializer: {
          isLeaf: true,
          rules: [{ validStyle: { color: "*" } }],
          parse: ({ element }) => {
            const color = keepPastedColor(element.style.color)
            return color ? { [KEYS.color]: color } : {}
          },
        },
      },
    },
  }).configure({
    inject: {
      ...options.inject,
      nodeProps: {
        defaultNodeValue: "black",
      },
    },
  }),
  FontBackgroundColorPlugin.extend({
    parsers: {
      html: {
        deserializer: {
          isLeaf: true,
          rules: [{ validStyle: { backgroundColor: "*" } }],
          parse: ({ element }) => {
            const color = keepPastedColor(element.style.backgroundColor)
            return color ? { [KEYS.backgroundColor]: color } : {}
          },
        },
      },
    },
  }).configure(options),
  FontSizePlugin.configure(options),
]
