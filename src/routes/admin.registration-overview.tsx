import { createFileRoute } from "@tanstack/react-router"

import { RegistrationOverviewView } from "@/features/registrations/ui/registration-overview-view"

export const Route = createFileRoute("/admin/registration-overview")({
  head: () => ({
    meta: [{ title: "Registration overview | Africa Digital Forum" }],
  }),
  component: RegistrationOverviewView,
})
