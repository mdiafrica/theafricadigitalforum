import { createFileRoute } from "@tanstack/react-router"

import { PartnersView } from "@/features/partners-admin/ui/partners-view"

export const Route = createFileRoute("/admin/partners")({
  head: () => ({ meta: [{ title: "Partners | Africa Digital Forum" }] }),
  component: PartnersView,
})
