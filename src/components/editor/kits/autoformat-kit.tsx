import type { SlateEditor } from "platejs"
import {
  createSlatePlugin,
  createTextSubstitutionInputRule,
  KEYS,
} from "platejs"

/**
 * Text-substitution shortcuts (the markdown block/mark autoformats live in
 * each plugin's inputRules in v53). Disabled inside code blocks.
 */

const isBlocked = (editor: SlateEditor) =>
  editor.api.some({ match: { type: [editor.getType(KEYS.codeBlock)] } })

const rule = (
  patterns: Parameters<typeof createTextSubstitutionInputRule>[0]["patterns"]
) =>
  createTextSubstitutionInputRule({
    enabled: ({ editor }) => !isBlocked(editor),
    patterns,
  })

const arrowsRule = rule([
  { format: "→", match: "->" },
  { format: "←", match: "<-" },
  { format: "⇒", match: "=>" },
])

const legalRule = rule([
  { format: "™", match: ["(tm)", "(TM)"] },
  { format: "®", match: ["(r)", "(R)"] },
  { format: "©", match: ["(c)", "(C)"] },
])

const fractionsRule = rule([
  { format: "½", match: "1/2" },
  { format: "⅓", match: "1/3" },
  { format: "¼", match: "1/4" },
  { format: "¾", match: "3/4" },
])

const operatorsRule = rule([
  { format: "±", match: "+-" },
  { format: "≠", match: "!=" },
  { format: "≥", match: ">=" },
  { format: "≤", match: "<=" },
])

const punctuationRule = rule([
  { format: "»", match: ">>" },
  { format: "«", match: "<<" },
  { format: "—", match: "--" },
  { format: "…", match: "..." },
])

const AutoformatShortcutsPlugin = createSlatePlugin({
  key: "autoformatShortcuts",
  inputRules: [
    arrowsRule,
    legalRule,
    fractionsRule,
    operatorsRule,
    punctuationRule,
  ],
})

export const AutoformatKit = [AutoformatShortcutsPlugin]
