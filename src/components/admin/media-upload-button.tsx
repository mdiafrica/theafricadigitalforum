import * as React from "react"
import { ImagePlus } from "lucide-react"
import { toast } from "sonner"

import {
  ALLOWED_IMAGE_TYPES,
  useUploadMediaMutation
  
} from "@/domains/media"
import type {MediaItem} from "@/domains/media";
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { getErrorMessage } from "@/lib/error"

/** Upload button + hidden file input. Used by the media library and the
 * media picker; `onUploaded` fires per successfully uploaded item. */
export function MediaUploadButton({
  multiple = false,
  onUploaded,
  variant,
  size,
  label = "Upload",
}: {
  multiple?: boolean
  onUploaded?: (item: MediaItem) => void
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  label?: string
}) {
  const uploadMutation = useUploadMediaMutation()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [progress, setProgress] = React.useState<{
    done: number
    total: number
  } | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const list = Array.from(files)
    setProgress({ done: 0, total: list.length })
    let failed = 0
    for (const file of list) {
      try {
        const item = await uploadMutation.mutateAsync(file)
        onUploaded?.(item)
      } catch (error) {
        failed += 1
        toast.error(`${file.name}: ${getErrorMessage(error, "upload failed")}`)
      }
      setProgress((state) =>
        state ? { ...state, done: state.done + 1 } : state
      )
    }
    setProgress(null)
    if (failed < list.length) {
      toast.success(
        list.length === 1
          ? "Image uploaded."
          : `${list.length - failed} of ${list.length} images uploaded.`
      )
    }
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={progress !== null}
        onClick={() => inputRef.current?.click()}
      >
        {progress ? (
          <>
            <Spinner />
            {progress.total > 1
              ? `Uploading ${progress.done + 1}/${progress.total}…`
              : "Uploading…"}
          </>
        ) : (
          <>
            <ImagePlus data-icon="inline-start" />
            {label}
          </>
        )}
      </Button>
    </>
  )
}
