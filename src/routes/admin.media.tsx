import { createFileRoute } from "@tanstack/react-router"

import { MediaLibraryView } from "@/features/media-library/ui/media-library-view"

export const Route = createFileRoute("/admin/media")({
  head: () => ({ meta: [{ title: "Media | Africa Digital Forum" }] }),
  component: MediaLibraryView,
})
