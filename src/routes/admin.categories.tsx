import { createFileRoute } from "@tanstack/react-router"

import { CategoriesView } from "@/features/categories-admin/ui/categories-view"

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories | Africa Digital Forum" }] }),
  component: CategoriesView,
})
