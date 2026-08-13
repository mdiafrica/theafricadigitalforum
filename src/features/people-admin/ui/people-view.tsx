import * as React from "react"
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query"
import { PlusIcon, UserRound } from "lucide-react"
import { toast } from "sonner"

import { useSessionQuery } from "@/domains/auth"
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

/** Shared shape of speaker/advisor admin rows and their save input. */
export type PersonAdminItem = {
  id: string
  photoMediaId: string | null
  photoUrl: string | null
  twitterUrl: string | null
  linkedinUrl: string | null
  sortOrder: number
  translations: {
    en?: { name: string; role: string }
    fr?: { name: string; role: string }
  }
}

export type SavePersonInput = {
  id?: string
  photoMediaId?: string | null
  twitterUrl: string
  linkedinUrl: string
  sortOrder: number
  translations: {
    en: { name: string; role: string }
    fr?: { name: string; role: string }
  }
}

export type PeopleViewConfig = {
  title: string
  description: string
  /** Lowercase singular, used in button labels and toasts ("speaker"). */
  noun: string
  resource: "speaker" | "advisor"
  useListQuery: () => UseQueryResult<PersonAdminItem[]>
  useSaveMutation: () => UseMutationResult<
    { id: string },
    Error,
    SavePersonInput
  >
  useDeleteMutation: () => UseMutationResult<{ id: string }, Error, string>
}

export function PeopleView(config: PeopleViewConfig) {
  const sessionQuery = useSessionQuery()
  const listQuery = config.useListQuery()
  const [editing, setEditing] = React.useState<PersonAdminItem | "new" | null>(
    null
  )

  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canEdit = hasOrgPermission(caller, {
    [config.resource]: ["update"],
  })
  const canDelete = hasOrgPermission(caller, {
    [config.resource]: ["delete"],
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={config.title} description={config.description}>
        {canEdit && (
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" />
            Add {config.noun}
          </Button>
        )}
      </PageHeader>

      {listQuery.isPending && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
          ))}
        </div>
      )}

      {listQuery.isError && (
        <QueryError
          title={`Couldn't load ${config.title.toLowerCase()}`}
          error={listQuery.error}
          onRetry={() => void listQuery.refetch()}
        />
      )}

      {listQuery.data && listQuery.data.length === 0 && (
        <EmptyState icon={UserRound}>
          No {config.title.toLowerCase()} yet.
          {canEdit ? ` Add the first ${config.noun} to get started.` : ""}
        </EmptyState>
      )}

      {listQuery.data && listQuery.data.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listQuery.data.map((person) => (
            <button
              key={person.id}
              type="button"
              disabled={!canEdit}
              onClick={() => setEditing(person)}
              className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-all enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:border-primary/40"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {person.photoUrl ? (
                  <img
                    src={person.photoUrl}
                    alt={person.translations.en?.name ?? ""}
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
                  {person.translations.en?.name ?? "(unnamed)"}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {person.translations.en?.role}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {editing !== null && (
        <PersonDialog
          config={config}
          person={editing === "new" ? undefined : editing}
          canDelete={canDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function PersonDialog({
  config,
  person,
  canDelete,
  onClose,
}: {
  config: PeopleViewConfig
  person?: PersonAdminItem
  canDelete: boolean
  onClose: () => void
}) {
  const saveMutation = config.useSaveMutation()
  const deleteMutation = config.useDeleteMutation()

  const [values, setValues] = React.useState({
    nameEn: person?.translations.en?.name ?? "",
    roleEn: person?.translations.en?.role ?? "",
    nameFr: person?.translations.fr?.name ?? "",
    roleFr: person?.translations.fr?.role ?? "",
    twitterUrl: person?.twitterUrl ?? "",
    linkedinUrl: person?.linkedinUrl ?? "",
    sortOrder: person?.sortOrder ?? 0,
    photoMediaId: person?.photoMediaId ?? null,
  })
  const [photoUrl, setPhotoUrl] = React.useState(person?.photoUrl ?? null)

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
        id: person?.id,
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
          toast.success(person ? "Saved." : "Added.")
          onClose()
        },
        onError: (error) =>
          toast.error(
            getErrorMessage(error, `Couldn't save the ${config.noun}.`)
          ),
      }
    )
  }

  const remove = () => {
    if (!person) return
    deleteMutation.mutate(person.id, {
      onSuccess: () => {
        toast.success("Removed.")
        onClose()
      },
      onError: (error) =>
        toast.error(
          getErrorMessage(error, `Couldn't remove the ${config.noun}.`)
        ),
    })
  }

  return (
    <EntityDialog
      title={person ? `Edit ${config.noun}` : `Add ${config.noun}`}
      description="Names and roles are bilingual; the French fields fall back to English when empty."
      submitLabel={person ? "Save changes" : `Add ${config.noun}`}
      submitPending={saveMutation.isPending}
      onSubmit={submit}
      onClose={onClose}
      remove={
        person && canDelete
          ? {
              confirmTitle: `Delete this ${config.noun}?`,
              confirmDescription: `"${values.nameEn || "(unnamed)"}" will be removed.`,
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
            <FieldLabel htmlFor="person-name-en">Name (EN)</FieldLabel>
            <Input
              id="person-name-en"
              value={values.nameEn}
              onChange={(e) => set({ nameEn: e.target.value })}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="person-name-fr">Name (FR)</FieldLabel>
            <Input
              id="person-name-fr"
              value={values.nameFr}
              onChange={(e) => set({ nameFr: e.target.value })}
              placeholder="Falls back to EN"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="person-role-en">Role (EN)</FieldLabel>
            <Input
              id="person-role-en"
              value={values.roleEn}
              onChange={(e) => set({ roleEn: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="person-role-fr">Role (FR)</FieldLabel>
            <Input
              id="person-role-fr"
              value={values.roleFr}
              onChange={(e) => set({ roleFr: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="person-twitter">X / Twitter URL</FieldLabel>
            <Input
              id="person-twitter"
              value={values.twitterUrl}
              onChange={(e) => set({ twitterUrl: e.target.value })}
              placeholder="https://x.com/…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="person-linkedin">LinkedIn URL</FieldLabel>
            <Input
              id="person-linkedin"
              value={values.linkedinUrl}
              onChange={(e) => set({ linkedinUrl: e.target.value })}
              placeholder="https://www.linkedin.com/in/…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="person-order">Display order</FieldLabel>
            <Input
              id="person-order"
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
