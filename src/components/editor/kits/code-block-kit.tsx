import { CodeBlockRules } from "@platejs/code-block"
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from "@platejs/code-block/react"
import dart from "highlight.js/lib/languages/dart"
import dockerfile from "highlight.js/lib/languages/dockerfile"
import elixir from "highlight.js/lib/languages/elixir"
import latex from "highlight.js/lib/languages/latex"
import powershell from "highlight.js/lib/languages/powershell"
import { common, createLowlight } from "lowlight"

import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from "../ui/code-block-node"

// `common` covers most of the language picker in code-block-node.tsx (html
// via the xml alias, toml via the ini alias); the rest are registered
// explicitly. Keep this in sync with the picker.
const lowlight = createLowlight(common)
lowlight.register({ dart, dockerfile, elixir, latex, powershell })

export const CodeBlockKit = [
  CodeBlockPlugin.configure({
    inputRules: [CodeBlockRules.markdown({ on: "match" })],
    node: { component: CodeBlockElement },
    options: { lowlight },
    shortcuts: { toggle: { keys: "mod+alt+8" } },
  }),
  CodeLinePlugin.withComponent(CodeLineElement),
  CodeSyntaxPlugin.withComponent(CodeSyntaxLeaf),
]
