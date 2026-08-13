import {
  useAdvisorsAdminQuery,
  useDeleteAdvisorMutation,
  useSaveAdvisorMutation,
} from "@/domains/advisors"
import { PeopleView } from "@/features/people-admin/ui/people-view"

export function AdvisorsView() {
  return (
    <PeopleView
      title="Advisory board"
      description="Members shown on the About page, in display order."
      noun="member"
      nouns="members"
      resource="advisor"
      useListQuery={useAdvisorsAdminQuery}
      useSaveMutation={useSaveAdvisorMutation}
      useDeleteMutation={useDeleteAdvisorMutation}
    />
  )
}
