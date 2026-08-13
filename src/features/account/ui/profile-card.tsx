import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { authKeys } from "@/domains/auth"
import {
  myProfileQueryOptions,
  teamKeys,
  updateMyProfile,
} from "@/domains/team"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage } from "@/lib/error"

export function ProfileCard() {
  const profileQuery = useQuery(myProfileQueryOptions())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your name and bio appear on articles you author.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profileQuery.isPending ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : profileQuery.data ? (
          <ProfileForm
            initial={profileQuery.data}
            key={profileQuery.data.userId}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}

function ProfileForm({ initial }: { initial: { name: string; bio: string } }) {
  const queryClient = useQueryClient()
  const [values, setValues] = React.useState(initial)

  const saveMutation = useMutation({
    mutationFn: (input: { name: string; bio: string }) =>
      updateMyProfile({ data: input }),
    onSuccess: () => {
      toast.success("Profile saved.")
      // Name shows in the sidebar/session; bio feeds team + article pages.
      void queryClient.invalidateQueries({ queryKey: teamKeys.all })
      void queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Couldn't save your profile.")),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!values.name.trim()) {
          toast.error("Your name is required.")
          return
        }
        saveMutation.mutate(values)
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="profile-name">Name</FieldLabel>
          <Input
            id="profile-name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
          <Textarea
            id="profile-bio"
            value={values.bio}
            onChange={(e) => setValues((v) => ({ ...v, bio: e.target.value }))}
            rows={4}
            maxLength={500}
            placeholder="A short introduction shown under your byline on articles."
          />
        </Field>
        <div>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Spinner />}
            Save profile
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
