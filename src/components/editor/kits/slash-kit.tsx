import { SlashInputPlugin, SlashPlugin } from "@platejs/slash-command/react"
import { KEYS, type SlateEditor } from "platejs"

import { SlashInputElement } from "../ui/slash-node"

export const SlashKit = [
  SlashPlugin.configure({
    options: {
      // No slash menu inside code blocks.
      triggerQuery: (editor: SlateEditor) =>
        !editor.api.some({
          match: { type: editor.getType(KEYS.codeBlock) },
        }),
    },
  }),
  SlashInputPlugin.withComponent(SlashInputElement),
]
