import { CaptionPlugin } from "@platejs/caption/react"
import { ImagePlugin, PlaceholderPlugin } from "@platejs/media/react"
import { KEYS } from "platejs"

import { ImageElement } from "../ui/media-image-node"
import { PlaceholderElement } from "../ui/media-placeholder-node"

/**
 * Images only for now — video/audio/file/embed are one plugin line each
 * later. Uploads go placeholder → our media pipeline.
 */
export const MediaKit = [
  ImagePlugin.configure({
    options: { disableUploadInsert: true },
    render: { node: ImageElement },
  }),
  PlaceholderPlugin.configure({
    options: { disableEmptyPlaceholder: true },
    render: { node: PlaceholderElement },
  }),
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img],
      },
    },
  }),
]
