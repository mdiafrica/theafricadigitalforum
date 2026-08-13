import {
  useDeleteSpeakerMutation,
  useSaveSpeakerMutation,
  useSpeakersAdminQuery,
} from "@/domains/speakers"
import { PeopleView } from "@/features/people-admin/ui/people-view"

export function SpeakersView() {
  return (
    <PeopleView
      title="Speakers"
      description="The line-up shown on the home page, in display order."
      noun="speaker"
      resource="speaker"
      useListQuery={useSpeakersAdminQuery}
      useSaveMutation={useSaveSpeakerMutation}
      useDeleteMutation={useDeleteSpeakerMutation}
    />
  )
}
