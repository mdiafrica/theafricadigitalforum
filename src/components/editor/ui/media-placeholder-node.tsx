import * as React from "react"
import {
  PlaceholderPlugin,
  PlaceholderProvider,
  updateUploadHistory,
} from "@platejs/media/react"
import { ImageIcon, Loader2Icon } from "lucide-react"
import type { TPlaceholderElement } from "platejs"
import type { PlateElementProps } from "platejs/react"
import { PlateElement, useEditorPlugin, withHOC } from "platejs/react"

import { ALLOWED_IMAGE_TYPES } from "@/domains/media"
import { cn } from "@/lib/utils"
import { useUploadFile } from "../hooks/use-upload-file"

/** Upload placeholder (image-only for now). */
export const PlaceholderElement = withHOC(
  PlaceholderProvider,
  function PlaceholderElement(props: PlateElementProps<TPlaceholderElement>) {
    const { editor, element } = props
    const { api } = useEditorPlugin(PlaceholderPlugin)
    const { isUploading, uploadedFile, uploadFile, uploadingFile } =
      useUploadFile()
    const inputRef = React.useRef<HTMLInputElement>(null)

    const replaceCurrentPlaceholder = React.useCallback(
      (file: File) => {
        void uploadFile(file).catch(() => {
          // Failed upload: remove the placeholder so no dead node remains.
          const path = editor.api.findPath(element)
          if (path) editor.tf.removeNodes({ at: path })
        })
        api.placeholder.addUploadingFile(element.id as string, file)
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [api.placeholder, element.id]
    )

    // Swap the placeholder for the real image node once uploaded.
    React.useEffect(() => {
      if (!uploadedFile) return

      const path = editor.api.findPath(element)
      if (!path) return

      editor.tf.withoutSaving(() => {
        editor.tf.removeNodes({ at: path })

        const node = {
          children: [{ text: "" }],
          initialWidth: uploadedFile.width,
          initialHeight: uploadedFile.height,
          isUpload: true,
          name: "",
          placeholderId: element.id as string,
          type: element.mediaType!,
          url: uploadedFile.url,
        }

        editor.tf.insertNodes(node, { at: path })
        updateUploadHistory(editor, node)
      })

      api.placeholder.removeUploadingFile(element.id as string)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadedFile, element.id])

    // Paste/drop path: the plugin registered the file before rendering us.
    const isReplaced = React.useRef(false)
    React.useEffect(() => {
      if (isReplaced.current) return
      isReplaced.current = true

      const currentFile = api.placeholder.getUploadingFile(element.id as string)
      if (!currentFile) return
      replaceCurrentPlaceholder(currentFile)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReplaced])

    const loading = isUploading && uploadingFile

    return (
      <PlateElement className="my-1" {...props}>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) replaceCurrentPlaceholder(file)
            event.target.value = ""
          }}
        />
        <div
          className={cn(
            "flex cursor-pointer items-center rounded-sm bg-muted p-3 pr-9 select-none hover:bg-primary/10"
          )}
          contentEditable={false}
          onClick={() => !loading && inputRef.current?.click()}
        >
          <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">
            {loading ? <Loader2Icon className="animate-spin" /> : <ImageIcon />}
          </div>
          <div className="text-sm whitespace-nowrap text-muted-foreground">
            {loading ? `Uploading ${uploadingFile?.name}…` : "Add an image"}
          </div>
        </div>
        {props.children}
      </PlateElement>
    )
  }
)
