import { createFileRoute } from "@tanstack/react-router"

import { SubmissionsView } from "@/features/submissions/ui/submissions-view"

export const Route = createFileRoute("/admin/submissions")({
  head: () => ({ meta: [{ title: "Submissions | Africa Digital Forum" }] }),
  component: SubmissionsView,
})
