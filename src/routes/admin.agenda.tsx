import { createFileRoute } from "@tanstack/react-router"

import { EventsView } from "@/features/events-admin/ui/events-view"

export const Route = createFileRoute("/admin/agenda")({
  head: () => ({ meta: [{ title: "Agenda | Africa Digital Forum" }] }),
  component: EventsView,
})
