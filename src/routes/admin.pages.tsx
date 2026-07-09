import { createFileRoute } from "@tanstack/react-router"

import { PagesView } from "@/features/pages-admin/ui/pages-view"

export const Route = createFileRoute("/admin/pages")({
  head: () => ({ meta: [{ title: "Pages | Africa Digital Forum" }] }),
  component: PagesView,
})
