import * as React from "react"
import { toast } from "sonner"

import { uploadMedia, type MediaItem } from "@/domains/media"
import { getErrorMessage } from "@/lib/error"

/**
 * Editor upload hook — uploads through the media pipeline (server fn →
 * SeaweedFS + variants + blurhash); the image lands in the media library
 * automatically.
 */
export function useUploadFile() {
  const [uploadedFile, setUploadedFile] = React.useState<MediaItem>()
  const [uploadingFile, setUploadingFile] = React.useState<File>()
  const [isUploading, setIsUploading] = React.useState(false)

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadingFile(file)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const item = await uploadMedia({ data: formData })
      setUploadedFile(item)
      return item
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not upload the image."))
      throw error
    } finally {
      setIsUploading(false)
      setUploadingFile(undefined)
    }
  }

  return { isUploading, uploadedFile, uploadingFile, uploadFile }
}
