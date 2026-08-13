import { createFileRoute } from "@tanstack/react-router"

import { AdvisorsView } from "@/features/advisors-admin/ui/advisors-view"

export const Route = createFileRoute("/admin/advisors")({
  head: () => ({ meta: [{ title: "Advisory board | Africa Digital Forum" }] }),
  component: AdvisorsView,
})
