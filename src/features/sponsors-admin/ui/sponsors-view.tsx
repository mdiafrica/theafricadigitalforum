import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Building2, MoreHorizontal, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { useSessionQuery } from "@/domains/auth"
import {
  SPONSOR_TIERS,
  useDeleteSponsorMutation,
  useSaveSponsorMutation,
  useSponsorsAdminQuery,
  type SponsorAdminItem,
} from "@/domains/sponsors"
import { EntityDialog } from "@/components/admin/entity-dialog"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState, QueryError } from "@/components/admin/query-states"
import { MediaPickerDialog } from "@/components/media-picker-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDataTable } from "@/hooks/use-data-table"
import { hasOrgPermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/error"

function useSponsorColumns(
  canEdit: boolean,
  onEdit: (sponsor: SponsorAdminItem) => void
) {
  return React.useMemo<ColumnDef<SponsorAdminItem, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Sponsor",
        cell: ({ row }) => {
          const sponsor = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                {sponsor.logoUrl ? (
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    className="size-full object-contain"
                  />
                ) : (
                  <Building2 className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{sponsor.name}</p>
                {sponsor.websiteUrl && (
                  <p className="truncate text-xs text-muted-foreground">
                    {sponsor.websiteUrl}
                  </p>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "tier",
        header: "Tier",
        cell: ({ row }) =>
          row.original.tier ? (
            <Badge variant="secondary" className="capitalize">
              {row.original.tier}
            </Badge>
          ) : null,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          canEdit ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Sponsor actions"
                  />
                }
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null,
      },
    ],
    [canEdit, onEdit]
  )
}

export function SponsorsView() {
  const sessionQuery = useSessionQuery()
  const sponsorsQuery = useSponsorsAdminQuery()
  const [editing, setEditing] = React.useState<SponsorAdminItem | "new" | null>(
    null
  )

  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canEdit = hasOrgPermission(caller, { sponsor: ["update"] })
  const canDelete = hasOrgPermission(caller, { sponsor: ["delete"] })

  const columns = useSponsorColumns(canEdit, setEditing)
  const table = useDataTable({ data: sponsorsQuery.data ?? [], columns })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Sponsors"
        description="Partners and sponsors, grouped by tier once shown on the site."
      >
        {canEdit && (
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" />
            Add sponsor
          </Button>
        )}
      </PageHeader>

      {sponsorsQuery.isError ? (
        <QueryError
          title="Couldn't load sponsors"
          error={sponsorsQuery.error}
          onRetry={() => void sponsorsQuery.refetch()}
        />
      ) : (
        <DataTable
          table={table}
          isLoading={sponsorsQuery.isPending}
          emptyState={
            <EmptyState icon={Building2}>
              No sponsors yet.
              {canEdit ? " Add the first sponsor to get started." : ""}
            </EmptyState>
          }
        />
      )}

      {editing !== null && (
        <SponsorDialog
          sponsor={editing === "new" ? undefined : editing}
          canDelete={canDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function SponsorDialog({
  sponsor,
  canDelete,
  onClose,
}: {
  sponsor?: SponsorAdminItem
  canDelete: boolean
  onClose: () => void
}) {
  const saveMutation = useSaveSponsorMutation()
  const deleteMutation = useDeleteSponsorMutation()
  const [values, setValues] = React.useState({
    name: sponsor?.name ?? "",
    websiteUrl: sponsor?.websiteUrl ?? "",
    tier: sponsor?.tier ?? "",
    sortOrder: sponsor?.sortOrder ?? 0,
    logoMediaId: sponsor?.logoMediaId ?? null,
  })
  const [logoUrl, setLogoUrl] = React.useState(sponsor?.logoUrl ?? null)

  const set = (patch: Partial<typeof values>) =>
    setValues((current) => ({ ...current, ...patch }))

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!values.name.trim()) {
      toast.error("The sponsor name is required.")
      return
    }
    saveMutation.mutate(
      {
        id: sponsor?.id,
        name: values.name,
        logoMediaId: values.logoMediaId,
        websiteUrl: values.websiteUrl.trim(),
        tier: values.tier as (typeof SPONSOR_TIERS)[number] | "",
        sortOrder: values.sortOrder,
      },
      {
        onSuccess: () => {
          toast.success(sponsor ? "Sponsor saved." : "Sponsor added.")
          onClose()
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Couldn't save the sponsor.")),
      }
    )
  }

  const remove = () => {
    if (!sponsor) return
    deleteMutation.mutate(sponsor.id, {
      onSuccess: () => {
        toast.success("Sponsor removed.")
        onClose()
      },
      onError: (error) =>
        toast.error(getErrorMessage(error, "Couldn't remove the sponsor.")),
    })
  }

  return (
    <EntityDialog
      title={sponsor ? "Edit sponsor" : "Add sponsor"}
      description="Logo, link and tier — brand names aren't translated."
      submitLabel={sponsor ? "Save changes" : "Add sponsor"}
      submitPending={saveMutation.isPending}
      onSubmit={submit}
      onClose={onClose}
      remove={
        sponsor && canDelete
          ? {
              confirmTitle: "Delete this sponsor?",
              confirmDescription: `"${sponsor.name}" will be removed from the site.`,
              pending: deleteMutation.isPending,
              onDelete: remove,
            }
          : undefined
      }
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Logo</FieldLabel>
          <MediaPickerDialog
            label="Choose a logo"
            imageUrl={logoUrl}
            onSelect={(item) => {
              set({ logoMediaId: item.id })
              setLogoUrl(item.url)
            }}
            onClear={() => {
              set({ logoMediaId: null })
              setLogoUrl(null)
            }}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="sponsor-name">Name</FieldLabel>
            <Input
              id="sponsor-name"
              value={values.name}
              onChange={(e) => set({ name: e.target.value })}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="sponsor-url">Website URL</FieldLabel>
            <Input
              id="sponsor-url"
              value={values.websiteUrl}
              onChange={(e) => set({ websiteUrl: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="sponsor-tier">Tier</FieldLabel>
            <Select
              value={values.tier}
              onValueChange={(tier) => set({ tier: tier ?? "" })}
            >
              <SelectTrigger id="sponsor-tier" className="w-full">
                <SelectValue placeholder="No tier" className="capitalize" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No tier</SelectItem>
                {SPONSOR_TIERS.map((tier) => (
                  <SelectItem key={tier} value={tier} className="capitalize">
                    {tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="sponsor-order">Display order</FieldLabel>
            <Input
              id="sponsor-order"
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
