import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import type { Value } from "platejs"

import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"

/**
 * Editor playground — exercises the full kit outside real content. The JSON
 * preview shows exactly what gets stored in the *_translations JSONB column.
 */
export const Route = createFileRoute("/admin/editor")({
  head: () => ({ meta: [{ title: "Editor | Africa Digital Forum" }] }),
  component: EditorPlayground,
})

const initialValue: Value = [
  { type: "h1", children: [{ text: "Editor playground" }] },
  {
    type: "p",
    children: [
      { text: "Try " },
      { text: "marks", bold: true },
      { text: ", type " },
      { text: "/", kbd: true },
      { text: " for the slash menu, paste a link, or upload an image." },
    ],
  },
]

function EditorPlayground() {
  const [value, setValue] = React.useState<Value>(initialValue)
  const [showJson, setShowJson] = React.useState(false)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Editor"
        description="Playground for the ADF rich-text editor."
      >
        <Button variant="ghost" onClick={() => setShowJson((show) => !show)}>
          {showJson ? "Hide" : "Show"} JSON
        </Button>
      </PageHeader>

      <RichTextEditor initialValue={initialValue} onChange={setValue} />

      {showJson && (
        <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  )
}
