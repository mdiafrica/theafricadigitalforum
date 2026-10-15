import { createFileRoute } from "@tanstack/react-router"

import { CheckInView } from "@/features/registrations/ui/check-in-view"

export const Route = createFileRoute("/admin/check-in")({
  head: () => ({ meta: [{ title: "Check-in | Africa Digital Forum" }] }),
  component: CheckInView,
})
