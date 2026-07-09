import * as React from "react"
import { PlusIcon, UserRound } from "lucide-react"
import { toast } from "sonner"

import { useSessionQuery } from "@/domains/auth"
import {
  useDeleteSpeakerMutation,
  useSaveSpeakerMutation,
  useSpeakersAdminQuery,
  type SpeakerAdminItem,
} from "@/domains/speakers"
import { EntityDialog } from "@/components/admin/entity-dialog"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState, QueryError } from "@/components/admin/query-states"
import { MediaPickerDialog } from "@/components/media-picker-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { hasOrgPermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/error"

export function SpeakersView() {
  const sessionQuery = useSessionQuery()
  const speakersQuery = useSpeakersAdminQuery()
  const [editing, setEditing] = React.useState<SpeakerAdminItem | "new" | null>(
    null
  )

  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canEdit = hasOrgPermission(caller, { speaker: ["update"] })
  const canDelete = hasOrgPermission(caller, { speaker: ["delete"] })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Speakers"
        description="The line-up shown on the home page, in display order."
      >
        {canEdit && (
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" />
            Add speaker
          </Button>
        )}
      </PageHeader>

      {speakersQuery.isPending && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
          ))}
        </div>
      )}

      {speakersQuery.isError && (
        <QueryError
          title="Couldn't load speakers"
          error={speakersQuery.error}
          onRetry={() => void speakersQuery.refetch()}
        />
      )}

      {speakersQuery.data && speakersQuery.data.length === 0 && (
        <EmptyState icon={UserRound}>
          No speakers yet.
          {canEdit ? " Add the first speaker to get started." : ""}
        </EmptyState>
      )}

      {speakersQuery.data && speakersQuery.data.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {speakersQuery.data.map((speaker) => (
            <button
              key={speaker.id}
              type="button"
              disabled={!canEdit}
              onClick={() => setEditing(speaker)}
              className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-all enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:border-primary/40"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {speaker.photoUrl ? (
                  <img
                    src={speaker.photoUrl}
                    alt={speaker.translations.en?.name ?? ""}
                    loading="lazy"
                    className="size-full object-cover object-top"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <UserRound className="size-10" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">
                  {speaker.translations.en?.name ?? "(unnamed)"}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {speaker.translations.en?.role}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {editing !== null && (
        <SpeakerDialog
          speaker={editing === "new" ? undefined : editing}
          canDelete={canDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function SpeakerDialog({
  speaker,
  canDelete,
  onClose,
}: {
  speaker?: SpeakerAdminItem
  canDelete: boolean
  onClose: () => void
}) {
  const saveMutation = useSaveSpeakerMutation()
  const deleteMutation = useDeleteSpeakerMutation()

  const [values, setValues] = React.useState({
    nameEn: speaker?.translations.en?.name ?? "",
    roleEn: speaker?.translations.en?.role ?? "",
    nameFr: speaker?.translations.fr?.name ?? "",
    roleFr: speaker?.translations.fr?.role ?? "",
    twitterUrl: speaker?.twitterUrl ?? "",
    linkedinUrl: speaker?.linkedinUrl ?? "",
    sortOrder: speaker?.sortOrder ?? 0,
    photoMediaId: speaker?.photoMediaId ?? null,
  })
  const [photoUrl, setPhotoUrl] = React.useState(speaker?.photoUrl ?? null)

  const set = (patch: Partial<typeof values>) =>
    setValues((current) => ({ ...current, ...patch }))

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!values.nameEn.trim()) {
      toast.error("The English name is required.")
      return
    }
    saveMutation.mutate(
      {
        id: speaker?.id,
        photoMediaId: values.photoMediaId,
        twitterUrl: values.twitterUrl.trim(),
        linkedinUrl: values.linkedinUrl.trim(),
        sortOrder: values.sortOrder,
        translations: {
          en: { name: values.nameEn, role: values.roleEn },
          fr: { name: values.nameFr, role: values.roleFr },
        },
      },
      {
        onSuccess: () => {
          toast.success(speaker ? "Speaker saved." : "Speaker added.")
          onClose()
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Couldn't save the speaker.")),
      }
    )
  }

  const remove = () => {
    if (!speaker) return
    deleteMutation.mutate(speaker.id, {
      onSuccess: () => {
        toast.success("Speaker removed.")
        onClose()
      },
      onError: (error) =>
        toast.error(getErrorMessage(error, "Couldn't remove the speaker.")),
    })
  }

  return (
    <EntityDialog
      title={speaker ? "Edit speaker" : "Add speaker"}
      description="Names and roles are bilingual; the French fields fall back to English when empty."
      submitLabel={speaker ? "Save changes" : "Add speaker"}
      submitPending={saveMutation.isPending}
      onSubmit={submit}
      onClose={onClose}
      remove={
        speaker && canDelete
          ? {
              confirmTitle: "Delete this speaker?",
              confirmDescription: `"${values.nameEn || "(unnamed)"}" will be removed from the line-up.`,
              pending: deleteMutation.isPending,
              onDelete: remove,
            }
          : undefined
      }
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Photo</FieldLabel>
          <MediaPickerDialog
            label="Choose a portrait"
            imageUrl={photoUrl}
            onSelect={(item) => {
              set({ photoMediaId: item.id })
              setPhotoUrl(item.url)
            }}
            onClear={() => {
              set({ photoMediaId: null })
              setPhotoUrl(null)
            }}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="speaker-name-en">Name (EN)</FieldLabel>
            <Input
              id="speaker-name-en"
              value={values.nameEn}
              onChange={(e) => set({ nameEn: e.target.value })}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="speaker-name-fr">Name (FR)</FieldLabel>
            <Input
              id="speaker-name-fr"
              value={values.nameFr}
              onChange={(e) => set({ nameFr: e.target.value })}
              placeholder="Falls back to EN"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="speaker-role-en">Role (EN)</FieldLabel>
            <Input
              id="speaker-role-en"
              value={values.roleEn}
              onChange={(e) => set({ roleEn: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="speaker-role-fr">Role (FR)</FieldLabel>
            <Input
              id="speaker-role-fr"
              value={values.roleFr}
              onChange={(e) => set({ roleFr: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="speaker-twitter">X / Twitter URL</FieldLabel>
            <Input
              id="speaker-twitter"
              value={values.twitterUrl}
              onChange={(e) => set({ twitterUrl: e.target.value })}
              placeholder="https://x.com/…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="speaker-linkedin">LinkedIn URL</FieldLabel>
            <Input
              id="speaker-linkedin"
              value={values.linkedinUrl}
              onChange={(e) => set({ linkedinUrl: e.target.value })}
              placeholder="https://www.linkedin.com/in/…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="speaker-order">Display order</FieldLabel>
            <Input
              id="speaker-order"
              type="number"
              min={0}
              value={values.sortOrder}
              onChange={(e) => set({ sortOrder: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>
      </FieldGroup>
    </EntityDialog>
  )
}
