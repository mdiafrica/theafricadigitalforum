import { createFileRoute } from "@tanstack/react-router"

import { EventsView } from "@/features/events-admin/ui/events-view"

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events | Africa Digital Forum" }] }),
  component: EventsView,
})
