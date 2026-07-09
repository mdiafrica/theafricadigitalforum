import * as React from "react"
import { useImagePreviewValue } from "@platejs/media/react"
import { Trash2Icon } from "lucide-react"
import {
  useEditorRef,
  useEditorSelector,
  useElement,
  useFocusedLast,
  useReadOnly,
  useRemoveNodeButton,
  useSelected,
} from "platejs/react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

import { CaptionButton } from "./caption"

/**
 * Floating toolbar on a selected media node: caption toggle + remove. No
 * URL editing — our images always come from the media library, never a
 * pasted URL.
 */
export function MediaToolbar({ children }: { children: React.ReactNode }) {
  const editor = useEditorRef()
  const readOnly = useReadOnly()
  const selected = useSelected()
  const isFocusedLast = useFocusedLast()
  const selectionCollapsed = useEditorSelector(
    (editor) => !editor.api.isExpanded(),
    []
  )
  const isImagePreviewOpen = useImagePreviewValue("isOpen", editor.id)
  const open =
    isFocusedLast &&
    !readOnly &&
    selected &&
    selectionCollapsed &&
    !isImagePreviewOpen

  const element = useElement()
  const { props: buttonProps } = useRemoveNodeButton({ element })
  const anchorRef = React.useRef<HTMLDivElement>(null)

  return (
    <>
      <div ref={anchorRef}>{children}</div>
      <Popover open={open} modal={false}>
        <PopoverContent
          className="w-auto p-1"
          anchor={anchorRef}
          initialFocus={false}
        >
          <div className="box-content flex items-center">
            <CaptionButton size="sm" variant="ghost">
              Caption
            </CaptionButton>
            <Separator className="mx-1 h-6" orientation="vertical" />
            <Button size="sm" variant="ghost" {...buttonProps}>
              <Trash2Icon />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}
