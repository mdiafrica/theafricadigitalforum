import type { Value } from "platejs"
import { Plate, usePlateEditor } from "platejs/react"

import { EditorKit } from "./editor-kit"
import { Editor, EditorContainer } from "./ui/editor"

/**
 * The assembled ADF rich-text editor. Value is the Plate JSON document —
 * stored per-locale in JSONB. Uncontrolled with onChange callback (Plate's
 * recommended pattern).
 */
export function RichTextEditor({
  initialValue,
  onChange,
  placeholder = "Type / for commands…",
  readOnly,
}: {
  initialValue?: Value
  onChange?: (value: Value) => void
  placeholder?: string
  readOnly?: boolean
}) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue,
  })

  return (
    <Plate
      editor={editor}
      onChange={({ value }) => onChange?.(value)}
      readOnly={readOnly}
    >
      <EditorContainer variant="field">
        <Editor variant="field" placeholder={placeholder} />
      </EditorContainer>
    </Plate>
  )
}
