import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import { memberProfileQueryOptions } from "@/domains/team"
import type { TeamMember } from "@/domains/team"
import { EntityDialog } from "@/components/admin/entity-dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { INVITABLE_ROLE_OPTIONS } from "../model/team.schemas"
import { useTeamMutations } from "../hooks/use-team-mutations"

/** Admin edit of a member: name + bio (server fn) and role (org plugin). */
export function EditMemberDialog({
  member,
  onClose,
}: {
  member: TeamMember
  onClose: () => void
}) {
  const profileQuery = useQuery(memberProfileQueryOptions(member.userId))
  const mutations = useTeamMutations()

  if (profileQuery.isPending) {
    return (
      <EntityDialog
        title="Edit member"
        description="Name and bio appear on articles they author."
        submitLabel="Save changes"
        submitPending
        onSubmit={(event) => event.preventDefault()}
        onClose={onClose}
      >
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </EntityDialog>
    )
  }
  if (!profileQuery.data) {
    onClose()
    return null
  }

  return (
    <EditMemberForm
      member={member}
      initial={profileQuery.data}
      mutations={mutations}
      onClose={onClose}
    />
  )
}

function EditMemberForm({
  member,
  initial,
  mutations,
  onClose,
}: {
  member: TeamMember
  initial: { name: string; bio: string }
  mutations: ReturnType<typeof useTeamMutations>
  onClose: () => void
}) {
  const [values, setValues] = React.useState({
    name: initial.name,
    bio: initial.bio,
    role: member.role,
  })
  const set = (patch: Partial<typeof values>) =>
    setValues((current) => ({ ...current, ...patch }))

  const pending =
    mutations.updateProfile.isPending || mutations.updateRole.isPending

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await mutations.updateProfile.mutateAsync({
        userId: member.userId,
        name: values.name,
        bio: values.bio,
      })
      if (values.role !== member.role) {
        await mutations.updateRole.mutateAsync({
          memberId: member.id,
          role: values.role as (typeof INVITABLE_ROLE_OPTIONS)[number]["value"],
        })
      }
      onClose()
    } catch {
      // Mutation hooks already toast the error.
    }
  }

  return (
    <EntityDialog
      title="Edit member"
      description="Name and bio appear on articles they author."
      submitLabel="Save changes"
      submitPending={pending}
      onSubmit={submit}
      onClose={onClose}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="member-name">Name</FieldLabel>
          <Input
            id="member-name"
            value={values.name}
            onChange={(e) => set({ name: e.target.value })}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="member-bio">Bio</FieldLabel>
          <Textarea
            id="member-bio"
            value={values.bio}
            onChange={(e) => set({ bio: e.target.value })}
            rows={4}
            maxLength={500}
            placeholder="A short introduction shown under their byline on articles."
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="member-role">Role</FieldLabel>
          <Select
            value={values.role}
            onValueChange={(role) => role && set({ role })}
          >
            <SelectTrigger id="member-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVITABLE_ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </EntityDialog>
  )
}
