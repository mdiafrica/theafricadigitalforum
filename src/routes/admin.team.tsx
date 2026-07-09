import { createFileRoute } from "@tanstack/react-router"

import { TeamView } from "@/features/team/ui/team-view"

export const Route = createFileRoute("/admin/team")({
  head: () => ({ meta: [{ title: "Team | Africa Digital Forum" }] }),
  component: TeamView,
})
