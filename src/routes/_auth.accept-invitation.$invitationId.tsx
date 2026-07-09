import { createFileRoute } from "@tanstack/react-router"

import { AcceptInvitationView } from "@/features/accept-invitation/ui/accept-invitation-view"

export const Route = createFileRoute("/_auth/accept-invitation/$invitationId")({
  head: () => ({
    meta: [{ title: "Accept invitation | Africa Digital Forum" }],
  }),
  component: AcceptInvitationPage,
})

function AcceptInvitationPage() {
  const { invitationId } = Route.useParams()
  return <AcceptInvitationView invitationId={invitationId} />
}
