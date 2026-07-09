import { MathRules } from "@platejs/math"
import { EquationPlugin, InlineEquationPlugin } from "@platejs/math/react"

// KaTeX CSS is imported globally in styles.css — a module-level CSS import
// here breaks SSR (node can't load .css from an externalized package).

import { EquationElement, InlineEquationElement } from "../ui/equation-node"

export const MathKit = [
  InlineEquationPlugin.configure({
    inputRules: [MathRules.markdown({ variant: "$" })],
    node: {
      component: InlineEquationElement,
    },
  }),
  EquationPlugin.configure({
    inputRules: [MathRules.markdown({ on: "break", variant: "$$" })],
    node: {
      component: EquationElement,
    },
  }),
]
