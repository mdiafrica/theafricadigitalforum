import { createFileRoute } from "@tanstack/react-router"

import { SponsorsView } from "@/features/sponsors-admin/ui/sponsors-view"

export const Route = createFileRoute("/admin/sponsors")({
  head: () => ({ meta: [{ title: "Sponsors | Africa Digital Forum" }] }),
  component: SponsorsView,
})
