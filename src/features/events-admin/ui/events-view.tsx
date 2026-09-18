import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CalendarDays, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { useSessionQuery } from "@/domains/auth"
import {
  agendaHeaderDefaults,
  usePageContentAdminQuery,
  useSavePageContentMutation,
} from "@/domains/page-content"
import {
  useDeleteEventMutation,
  useEventsAdminQuery,
  useSaveEventMutation,
  type EventAdminItem,
  type SaveEventInput,
} from "@/domains/events"
import { EntityDialog } from "@/components/admin/entity-dialog"
import { MediaPickerDialog } from "@/components/media-picker-dialog"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState, QueryError } from "@/components/admin/query-states"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useDataTable } from "@/hooks/use-data-table"
import { hasOrgPermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/error"
import { Spinner } from "@/components/ui/spinner"

function toLocalInputValue(value: Date | string | null) {
  if (!value) return ""
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const agendaColumns: ColumnDef<EventAdminItem, unknown>[] = [
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
]

export function EventsView() {
  const sessionQuery = useSessionQuery()
  const eventsQuery = useEventsAdminQuery()
  const [editing, setEditing] = React.useState<EventAdminItem | "new" | null>(
    null
  )
  const [newItemDay, setNewItemDay] = React.useState("")

  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canEdit = hasOrgPermission(caller, { event: ["update"] })
  const canDelete = hasOrgPermission(caller, { event: ["delete"] })
  const saveMutation = useSaveEventMutation()

  const saveOrder = async (items: EventAdminItem[]) => {
    await Promise.all(
      items.map((item, index) =>
        saveMutation.mutateAsync({
          id: item.id,
          day: item.day,
          startsAt: item.startsAt
            ? new Date(item.startsAt).toISOString().slice(0, 16)
            : "",
          endsAt: item.endsAt
            ? new Date(item.endsAt).toISOString().slice(0, 16)
            : "",
          sortOrder: index + 1,
          translations: {
            en: agendaTranslation(item.translations.en),
            fr: item.translations.fr
              ? agendaTranslation(item.translations.fr)
              : undefined,
          },
        } satisfies SaveEventInput)
      )
    )
  }

  const agendaByDay = new Map<string, EventAdminItem[]>()
  for (const item of eventsQuery.data ?? []) {
    const day = item.day || "Unassigned day"
    const items = agendaByDay.get(day) ?? []
    items.push(item)
    agendaByDay.set(day, items)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Agenda"
        description="Forum sessions and agenda items, in display order."
      >
        {canEdit && (
          <Button
            onClick={() => {
              setNewItemDay("")
              setEditing("new")
            }}
          >
            <PlusIcon data-icon="inline-start" />
            Add agenda item
          </Button>
        )}
      </PageHeader>

      <AgendaHeaderEditor />

      {eventsQuery.isError ? (
        <QueryError
           title="Couldn't load agenda"
          error={eventsQuery.error}
          onRetry={() => void eventsQuery.refetch()}
        />
      ) : eventsQuery.isPending ? (
        <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          Loading agenda...
        </div>
      ) : agendaByDay.size === 0 ? (
        <EmptyState icon={CalendarDays}>
          No agenda items yet.
          {canEdit ? " Add the first session to get started." : ""}
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {[...agendaByDay.entries()].map(([day, items]) => (
            <AgendaDaySection
              key={day}
              day={day}
              items={items}
              canEdit={canEdit}
              onAdd={() => {
                setNewItemDay(day)
                setEditing("new")
              }}
              onReorder={(fromIndex, toIndex) => {
                const next = [...items]
                const [moved] = next.splice(fromIndex, 1)
                next.splice(toIndex, 0, moved)
                void saveOrder(next).catch((error) =>
                  toast.error(getErrorMessage(error, "Couldn't reorder the agenda."))
                )
              }}
              onRowClick={setEditing}
            />
          ))}
        </div>
      )}

      {editing !== null && (
        <AgendaDialog
          event={editing === "new" ? undefined : editing}
          initialDay={newItemDay}
          canDelete={canDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function agendaTranslation(
  translation:
    | {
        title: string
        summary: string
        expectedOutcome: string
        beneficiaries: string
        speaker: string
        dayDescription: string
        description: string
      }
    | undefined
) {
  return {
    title: translation?.title ?? "Untitled agenda item",
    summary: translation?.summary ?? "",
    expectedOutcome: translation?.expectedOutcome ?? "",
    beneficiaries: translation?.beneficiaries ?? "",
    speaker: translation?.speaker ?? "",
    dayDescription: translation?.dayDescription ?? "",
    description: translation?.description ?? "",
  }
}

function AgendaHeaderEditor() {
  const contentQuery = usePageContentAdminQuery("agenda")
  const saveMutation = useSavePageContentMutation()
  const defaults = agendaHeaderDefaults("en")
  const saved = contentQuery.data?.find(
    (row) => row.section === "header" && row.locale === "en"
  )?.data
  const [values, setValues] = React.useState(defaults)

  React.useEffect(() => {
    if (!saved) return
    setValues({
      title: typeof saved.title === "string" ? saved.title : defaults.title,
      theme: typeof saved.theme === "string" ? saved.theme : defaults.theme,
      dates: typeof saved.dates === "string" ? saved.dates : defaults.dates,
      backgroundImage:
        typeof saved.backgroundImage === "string"
          ? saved.backgroundImage
          : defaults.backgroundImage,
    })
  }, [saved])

  const set = (patch: Partial<typeof values>) =>
    setValues((current) => ({ ...current, ...patch }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda header</CardTitle>
        <p className="text-sm text-muted-foreground">
          Edit the public agenda title, theme, dates, and background image URL.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="agenda-header-title">Title</FieldLabel>
          <Input
            id="agenda-header-title"
            value={values.title}
            onChange={(event) => set({ title: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="agenda-header-theme">Theme</FieldLabel>
          <Input
            id="agenda-header-theme"
            value={values.theme}
            onChange={(event) => set({ theme: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="agenda-header-dates">Dates</FieldLabel>
          <Input
            id="agenda-header-dates"
            value={values.dates}
            onChange={(event) => set({ dates: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel>Background picture</FieldLabel>
          <MediaPickerDialog
            imageUrl={values.backgroundImage || null}
            label="Choose agenda background"
            onSelect={(item) => set({ backgroundImage: item.url })}
            onClear={() => set({ backgroundImage: "" })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Button
            type="button"
            disabled={saveMutation.isPending || contentQuery.isPending}
            onClick={() =>
              saveMutation.mutate(
                { page: "agenda", section: "header", locale: "en", data: values },
                {
                  onSuccess: () => toast.success("Agenda header saved."),
                  onError: (error) =>
                    toast.error(
                      getErrorMessage(error, "Couldn't save the agenda header.")
                    ),
                }
              )
            }
          >
            {saveMutation.isPending && <Spinner />}
            Save agenda header
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AgendaDaySection({
  day,
  items,
  canEdit,
  onAdd,
  onReorder,
  onRowClick,
}: {
  day: string
  items: EventAdminItem[]
  canEdit: boolean
  onAdd: () => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onRowClick: (item: EventAdminItem) => void
}) {
  const table = useDataTable({ data: items, columns: agendaColumns })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{day}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "session" : "sessions"}
            </p>
          </div>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onAdd}>
              <PlusIcon data-icon="inline-start" />
              Add agenda item
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AgendaDayDetails items={items} canEdit={canEdit} />
        <DataTable
          table={table}
          onRowReorder={onReorder}
          onRowClick={canEdit ? onRowClick : undefined}
        />
      </CardContent>
    </Card>
  )
}

function AgendaDayDetails({
  items,
  canEdit,
}: {
  items: EventAdminItem[]
  canEdit: boolean
}) {
  const saveMutation = useSaveEventMutation()
  const firstItem = items[0]
  const [values, setValues] = React.useState({
    day: firstItem?.day ?? "",
    description: firstItem?.translations.en?.dayDescription ?? "",
  })

  React.useEffect(() => {
    setValues({
      day: firstItem?.day ?? "",
      description: firstItem?.translations.en?.dayDescription ?? "",
    })
  }, [firstItem?.day, firstItem?.translations.en?.dayDescription])

  if (!firstItem) return null

  const save = async () => {
    await Promise.all(
      items.map((item) =>
        saveMutation.mutateAsync({
          id: item.id,
          day: values.day.trim(),
          startsAt: item.startsAt
            ? new Date(item.startsAt).toISOString().slice(0, 16)
            : "",
          endsAt: item.endsAt
            ? new Date(item.endsAt).toISOString().slice(0, 16)
            : "",
          sortOrder: item.sortOrder,
          translations: {
            en: {
              ...agendaTranslation(item.translations.en),
              dayDescription: values.description,
            },
            fr: item.translations.fr
              ? {
                  ...agendaTranslation(item.translations.fr),
                  dayDescription:
                    item.translations.fr.dayDescription || values.description,
                }
              : undefined,
          },
        })
      )
    )
    toast.success("Day details saved.")
  }

  return (
    <div className="mb-6 rounded-lg border border-border bg-muted/20 p-4">
      <div className="mb-4">
        <h3 className="font-semibold">Day details</h3>
        <p className="text-sm text-muted-foreground">
          Edit the date label and focus description for this section.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`agenda-day-${firstItem.id}`}>Day and date</FieldLabel>
          <Input
            id={`agenda-day-${firstItem.id}`}
            value={values.day}
            disabled={!canEdit}
            onChange={(event) =>
              setValues((current) => ({ ...current, day: event.target.value }))
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`agenda-focus-${firstItem.id}`}>
            Day focus description
          </FieldLabel>
          <Textarea
            id={`agenda-focus-${firstItem.id}`}
            rows={2}
            value={values.description}
            disabled={!canEdit}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </Field>
      </div>
      {canEdit && (
        <Button
          type="button"
          className="mt-4"
          disabled={saveMutation.isPending}
          onClick={() =>
            void save().catch((error) =>
              toast.error(getErrorMessage(error, "Couldn't save day details."))
            )
          }
        >
          {saveMutation.isPending && <Spinner />}
          Save day details
        </Button>
      )}
    </div>
  )
}

function AgendaDialog({
  event,
  initialDay,
  canDelete,
  onClose,
}: {
  event?: EventAdminItem
  initialDay: string
  canDelete: boolean
  onClose: () => void
}) {
  const saveMutation = useSaveEventMutation()
  const deleteMutation = useDeleteEventMutation()

  const [values, setValues] = React.useState({
    day: event?.day ?? initialDay,
    titleEn: event?.translations.en?.title ?? "",
    summaryEn: event?.translations.en?.summary ?? "",
    expectedOutcomeEn: event?.translations.en?.expectedOutcome ?? "",
    beneficiariesEn: event?.translations.en?.beneficiaries ?? "",
    speakerEn: event?.translations.en?.speaker ?? "",
    dayDescriptionEn: event?.translations.en?.dayDescription ?? "",
    descriptionEn: event?.translations.en?.description ?? "",
    titleFr: event?.translations.fr?.title ?? "",
    summaryFr: event?.translations.fr?.summary ?? "",
    expectedOutcomeFr: event?.translations.fr?.expectedOutcome ?? "",
    beneficiariesFr: event?.translations.fr?.beneficiaries ?? "",
    speakerFr: event?.translations.fr?.speaker ?? "",
    dayDescriptionFr: event?.translations.fr?.dayDescription ?? "",
    descriptionFr: event?.translations.fr?.description ?? "",
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
        day: values.day,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        sortOrder: values.sortOrder,
        translations: {
          en: {
            title: values.titleEn,
            summary: values.summaryEn,
            expectedOutcome: values.expectedOutcomeEn,
            beneficiaries: values.beneficiariesEn,
            speaker: values.speakerEn,
            dayDescription: values.dayDescriptionEn,
            description: values.descriptionEn,
          },
          fr: {
            title: values.titleFr,
            summary: values.summaryFr,
            expectedOutcome: values.expectedOutcomeFr,
            beneficiaries: values.beneficiariesFr,
            speaker: values.speakerFr,
            dayDescription: values.dayDescriptionFr,
            description: values.descriptionFr,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(event ? "Agenda item saved." : "Agenda item added.")
          onClose()
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Couldn't save the agenda item.")),
      }
    )
  }

  const remove = () => {
    if (!event) return
    deleteMutation.mutate(event.id, {
      onSuccess: () => {
        toast.success("Agenda item removed.")
        onClose()
      },
      onError: (error) =>
        toast.error(getErrorMessage(error, "Couldn't remove the agenda item.")),
    })
  }

  return (
    <EntityDialog
      title={event ? "Edit agenda item" : "Add agenda item"}
      description="Agenda content is bilingual; French falls back to English when empty."
      submitLabel={event ? "Save changes" : "Add agenda item"}
      submitPending={saveMutation.isPending}
      onSubmit={submit}
      onClose={onClose}
      remove={
        event && canDelete
          ? {
              confirmTitle: "Delete this agenda item?",
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
              <FieldLabel htmlFor="agenda-title-en">Title (EN)</FieldLabel>
              <Input
                id="agenda-title-en"
                value={values.titleEn}
                onChange={(e) => set({ titleEn: e.target.value })}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agenda-summary-en">Summary (EN)</FieldLabel>
              <Textarea
                id="agenda-summary-en"
                rows={4}
                value={values.summaryEn}
                onChange={(e) => set({ summaryEn: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agenda-outcome-en">Expected outcome (EN)</FieldLabel>
              <Textarea
                id="agenda-outcome-en"
                rows={4}
                value={values.expectedOutcomeEn}
                onChange={(e) => set({ expectedOutcomeEn: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agenda-beneficiaries-en">Target beneficiaries (EN)</FieldLabel>
              <Textarea
                id="agenda-beneficiaries-en"
                rows={4}
                value={values.beneficiariesEn}
                onChange={(e) => set({ beneficiariesEn: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agenda-speaker-en">Speaker / participants (EN)</FieldLabel>
              <Input
                id="agenda-speaker-en"
                value={values.speakerEn}
                onChange={(e) => set({ speakerEn: e.target.value })}
              />
            </Field>
          </FieldGroup>
        </TabsContent>
        <TabsContent value="fr" keepMounted className="pt-3">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="agenda-title-fr">Titre (FR)</FieldLabel>
              <Input
                id="agenda-title-fr"
                value={values.titleFr}
                onChange={(e) => set({ titleFr: e.target.value })}
                placeholder="Falls back to EN"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agenda-summary-fr">Résumé (FR)</FieldLabel>
              <Textarea
                id="agenda-summary-fr"
                rows={4}
                value={values.summaryFr}
                onChange={(e) => set({ summaryFr: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agenda-outcome-fr">Résultat attendu (FR)</FieldLabel>
              <Textarea
                id="agenda-outcome-fr"
                rows={4}
                value={values.expectedOutcomeFr}
                onChange={(e) => set({ expectedOutcomeFr: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agenda-beneficiaries-fr">Bénéficiaires (FR)</FieldLabel>
              <Textarea
                id="agenda-beneficiaries-fr"
                rows={4}
                value={values.beneficiariesFr}
                onChange={(e) => set({ beneficiariesFr: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agenda-speaker-fr">Intervenants (FR)</FieldLabel>
              <Input
                id="agenda-speaker-fr"
                value={values.speakerFr}
                onChange={(e) => set({ speakerFr: e.target.value })}
              />
            </Field>
          </FieldGroup>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="agenda-starts">Starts</FieldLabel>
          <Input
            id="agenda-starts"
            type="datetime-local"
            value={values.startsAt}
            onChange={(e) => set({ startsAt: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="agenda-ends">Ends</FieldLabel>
          <Input
            id="agenda-ends"
            type="datetime-local"
            value={values.endsAt}
            onChange={(e) => set({ endsAt: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="agenda-order">Display order</FieldLabel>
          <Input
            id="agenda-order"
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
