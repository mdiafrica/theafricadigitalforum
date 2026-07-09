import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CalendarDays, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { useSessionQuery } from "@/domains/auth"
import {
  useDeleteEventMutation,
  useEventsAdminQuery,
  useSaveEventMutation,
  type EventAdminItem,
} from "@/domains/events"
import { EntityDialog } from "@/components/admin/entity-dialog"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState, QueryError } from "@/components/admin/query-states"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useDataTable } from "@/hooks/use-data-table"
import { hasOrgPermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/error"

function toLocalInputValue(value: Date | string | null) {
  if (!value) return ""
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const eventColumns: ColumnDef<EventAdminItem, unknown>[] = [
  {
    id: "session",
    header: "Session",
    cell: ({ row }) => (
      <span className="block max-w-64 truncate font-medium">
        {row.original.translations.en?.title ?? "(untitled)"}
      </span>
    ),
  },
  {
    id: "when",
    header: "When",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.startsAt
          ? new Date(row.original.startsAt).toLocaleString()
          : "Unscheduled"}
      </span>
    ),
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="block max-w-40 truncate text-muted-foreground">
        {row.original.translations.en?.location}
      </span>
    ),
  },
  {
    accessorKey: "sortOrder",
    header: () => <span className="block text-right">Order</span>,
    cell: ({ row }) => (
      <span className="block text-right text-muted-foreground">
        {row.original.sortOrder}
      </span>
    ),
  },
]

export function EventsView() {
  const sessionQuery = useSessionQuery()
  const eventsQuery = useEventsAdminQuery()
  const [editing, setEditing] = React.useState<EventAdminItem | "new" | null>(
    null
  )

  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canEdit = hasOrgPermission(caller, { event: ["update"] })
  const canDelete = hasOrgPermission(caller, { event: ["delete"] })

  const table = useDataTable({
    data: eventsQuery.data ?? [],
    columns: eventColumns,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Events"
        description="Forum sessions and agenda items, in display order."
      >
        {canEdit && (
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" />
            Add event
          </Button>
        )}
      </PageHeader>

      {eventsQuery.isError ? (
        <QueryError
          title="Couldn't load events"
          error={eventsQuery.error}
          onRetry={() => void eventsQuery.refetch()}
        />
      ) : (
        <DataTable
          table={table}
          isLoading={eventsQuery.isPending}
          onRowClick={canEdit ? setEditing : undefined}
          emptyState={
            <EmptyState icon={CalendarDays}>
              No events yet.
              {canEdit ? " Add the first session to get started." : ""}
            </EmptyState>
          }
        />
      )}

      {editing !== null && (
        <EventDialog
          event={editing === "new" ? undefined : editing}
          canDelete={canDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function EventDialog({
  event,
  canDelete,
  onClose,
}: {
  event?: EventAdminItem
  canDelete: boolean
  onClose: () => void
}) {
  const saveMutation = useSaveEventMutation()
  const deleteMutation = useDeleteEventMutation()

  const [values, setValues] = React.useState({
    titleEn: event?.translations.en?.title ?? "",
    descriptionEn: event?.translations.en?.description ?? "",
    locationEn: event?.translations.en?.location ?? "",
    titleFr: event?.translations.fr?.title ?? "",
    descriptionFr: event?.translations.fr?.description ?? "",
    locationFr: event?.translations.fr?.location ?? "",
    startsAt: toLocalInputValue(event?.startsAt ?? null),
    endsAt: toLocalInputValue(event?.endsAt ?? null),
    sortOrder: event?.sortOrder ?? 0,
  })

  const set = (patch: Partial<typeof values>) =>
    setValues((current) => ({ ...current, ...patch }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.titleEn.trim()) {
      toast.error("The English title is required.")
      return
    }
    saveMutation.mutate(
      {
        id: event?.id,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        sortOrder: values.sortOrder,
        translations: {
          en: {
            title: values.titleEn,
            description: values.descriptionEn,
            location: values.locationEn,
          },
          fr: {
            title: values.titleFr,
            description: values.descriptionFr,
            location: values.locationFr,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(event ? "Event saved." : "Event added.")
          onClose()
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Couldn't save the event.")),
      }
    )
  }

  const remove = () => {
    if (!event) return
    deleteMutation.mutate(event.id, {
      onSuccess: () => {
        toast.success("Event removed.")
        onClose()
      },
      onError: (error) =>
        toast.error(getErrorMessage(error, "Couldn't remove the event.")),
    })
  }

  return (
    <EntityDialog
      title={event ? "Edit event" : "Add event"}
      description="Titles, descriptions and locations are bilingual; French falls back to English when empty."
      submitLabel={event ? "Save changes" : "Add event"}
      submitPending={saveMutation.isPending}
      onSubmit={submit}
      onClose={onClose}
      remove={
        event && canDelete
          ? {
              confirmTitle: "Delete this event?",
              confirmDescription: `"${values.titleEn || "(untitled)"}" will be removed from the agenda.`,
              pending: deleteMutation.isPending,
              onDelete: remove,
            }
          : undefined
      }
    >
      <Tabs defaultValue="en">
        <TabsList>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="fr">Français</TabsTrigger>
        </TabsList>
        <TabsContent value="en" keepMounted className="pt-3">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="event-title-en">Title (EN)</FieldLabel>
              <Input
                id="event-title-en"
                value={values.titleEn}
                onChange={(e) => set({ titleEn: e.target.value })}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="event-desc-en">Description (EN)</FieldLabel>
              <Textarea
                id="event-desc-en"
                rows={3}
                value={values.descriptionEn}
                onChange={(e) => set({ descriptionEn: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="event-loc-en">Location (EN)</FieldLabel>
              <Input
                id="event-loc-en"
                value={values.locationEn}
                onChange={(e) => set({ locationEn: e.target.value })}
              />
            </Field>
          </FieldGroup>
        </TabsContent>
        <TabsContent value="fr" keepMounted className="pt-3">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="event-title-fr">Titre (FR)</FieldLabel>
              <Input
                id="event-title-fr"
                value={values.titleFr}
                onChange={(e) => set({ titleFr: e.target.value })}
                placeholder="Falls back to EN"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="event-desc-fr">Description (FR)</FieldLabel>
              <Textarea
                id="event-desc-fr"
                rows={3}
                value={values.descriptionFr}
                onChange={(e) => set({ descriptionFr: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="event-loc-fr">Lieu (FR)</FieldLabel>
              <Input
                id="event-loc-fr"
                value={values.locationFr}
                onChange={(e) => set({ locationFr: e.target.value })}
              />
            </Field>
          </FieldGroup>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="event-starts">Starts</FieldLabel>
          <Input
            id="event-starts"
            type="datetime-local"
            value={values.startsAt}
            onChange={(e) => set({ startsAt: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="event-ends">Ends</FieldLabel>
          <Input
            id="event-ends"
            type="datetime-local"
            value={values.endsAt}
            onChange={(e) => set({ endsAt: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="event-order">Display order</FieldLabel>
          <Input
            id="event-order"
            type="number"
            min={0}
            value={values.sortOrder}
            onChange={(e) => set({ sortOrder: Number(e.target.value) || 0 })}
          />
        </Field>
      </div>
    </EntityDialog>
  )
}
