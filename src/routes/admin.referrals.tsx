import { createFileRoute } from "@tanstack/react-router"

import { ReferralsView } from "@/features/registrations/ui/referrals-view"

export const Route = createFileRoute("/admin/referrals")({
  head: () => ({ meta: [{ title: "Referrals | Africa Digital Forum" }] }),
  component: ReferralsView,
})
