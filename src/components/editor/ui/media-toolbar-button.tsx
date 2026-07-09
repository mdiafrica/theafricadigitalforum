import * as React from "react"
import { PlaceholderPlugin } from "@platejs/media/react"
import { ImageIcon } from "lucide-react"
import { useEditorRef } from "platejs/react"

import { ALLOWED_IMAGE_TYPES } from "@/domains/media"
import { ToolbarButton } from "./toolbar"

/** Insert image(s): opens a file picker, drops upload placeholders. */
export function MediaToolbarButton() {
  const editor = useEditorRef()
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files
          if (files && files.length > 0) {
            editor.getTransforms(PlaceholderPlugin).insert.media(files)
          }
          event.target.value = ""
        }}
      />
      <ToolbarButton tooltip="Image" onClick={() => inputRef.current?.click()}>
        <ImageIcon />
      </ToolbarButton>
    </>
  )
}
