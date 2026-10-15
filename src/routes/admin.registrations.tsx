import { createFileRoute } from "@tanstack/react-router"

import { RegistrationsView } from "@/features/registrations/ui/registrations-view"

export const Route = createFileRoute("/admin/registrations")({
  head: () => ({ meta: [{ title: "Registrations | Africa Digital Forum" }] }),
  component: RegistrationsView,
})
