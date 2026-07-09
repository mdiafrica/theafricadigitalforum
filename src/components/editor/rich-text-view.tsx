import type { Value } from "platejs"
import { Plate, usePlateEditor } from "platejs/react"

import { ContentKit } from "./editor-kit"
import { Editor, EditorContainer } from "./ui/editor"

/**
 * Content-only plugin set for read-only rendering (public site) — the
 * editing chrome (toolbars, slash menu, autoformat, emoji input) stays out.
 * Our node components use Plate hooks, so this mounts a real (read-only)
 * Plate rather than the static PlateView.
 */
const ViewerKit = [...ContentKit]

/** Render a stored Plate Value (post body) read-only. */
export function RichTextView({
  value,
  className,
}: {
  value: Value
  className?: string
}) {
  const editor = usePlateEditor({ plugins: ViewerKit, value }, [value])

  return (
    <Plate editor={editor} readOnly>
      <EditorContainer className="cursor-auto">
        <Editor variant="view" className={className} readOnly />
      </EditorContainer>
    </Plate>
  )
}
