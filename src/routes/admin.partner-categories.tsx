import { createFileRoute } from "@tanstack/react-router"

import { PartnerCategoriesView } from "@/features/partners-admin/ui/partner-categories-section"

export const Route = createFileRoute("/admin/partner-categories")({
  head: () => ({
    meta: [{ title: "Partner categories | Africa Digital Forum" }],
  }),
  component: PartnerCategoriesView,
})
