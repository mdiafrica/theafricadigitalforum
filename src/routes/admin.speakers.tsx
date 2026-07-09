import { createFileRoute } from "@tanstack/react-router"

import { SpeakersView } from "@/features/speakers-admin/ui/speakers-view"

export const Route = createFileRoute("/admin/speakers")({
  head: () => ({ meta: [{ title: "Speakers | Africa Digital Forum" }] }),
  component: SpeakersView,
})
