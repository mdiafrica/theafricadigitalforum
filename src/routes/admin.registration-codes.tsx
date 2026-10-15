import { createFileRoute } from "@tanstack/react-router"

import { RegistrationCodesView } from "@/features/registrations/ui/registration-codes-view"

export const Route = createFileRoute("/admin/registration-codes")({
  head: () => ({ meta: [{ title: "Access codes | Africa Digital Forum" }] }),
  component: RegistrationCodesView,
})
