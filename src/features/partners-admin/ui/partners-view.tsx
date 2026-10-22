import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Handshake, MoreHorizontal, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { useSessionQuery } from "@/domains/auth"
import {
  useDeletePartnerMutation,
  usePartnerCategoriesQuery,
  usePartnersAdminQuery,
  useSavePartnerMutation,
} from "@/domains/partners"
import type { PartnerAdminItem } from "@/domains/partners"
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
import { PartnerCategoriesSection } from "./partner-categories-section"

function usePartnerColumns(
  canEdit: boolean,
  categoryNames: Map<string, string>,
  onEdit: (partner: PartnerAdminItem) => void
) {
  return React.useMemo<ColumnDef<PartnerAdminItem, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Partner",
        cell: ({ row }) => {
          const partner = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="size-full object-contain"
                  />
                ) : (
                  <Handshake className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{partner.name}</p>
                {partner.websiteUrl && (
                  <p className="truncate text-xs text-muted-foreground">
                    {partner.websiteUrl}
                  </p>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "tier",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {categoryNames.get(row.original.tier) ?? row.original.tier}
          </Badge>
        ),
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
                    aria-label="Partner actions"
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
    [canEdit, categoryNames, onEdit]
  )
}

export function PartnersView() {
  const sessionQuery = useSessionQuery()
  const partnersQuery = usePartnersAdminQuery()
  const categoriesQuery = usePartnerCategoriesQuery()
  const [editing, setEditing] = React.useState<PartnerAdminItem | "new" | null>(
    null
  )

  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canRead = hasOrgPermission(caller, { partner: ["read"] })
  const canCreate = hasOrgPermission(caller, { partner: ["create"] })
  const canEdit = hasOrgPermission(caller, { partner: ["update"] })
  const canDelete = hasOrgPermission(caller, { partner: ["delete"] })

  const categoryNames = React.useMemo(
    () =>
      new Map(
        (categoriesQuery.data ?? []).map((item) => [item.slug, item.name])
      ),
    [categoriesQuery.data]
  )
  const columns = usePartnerColumns(canEdit, categoryNames, setEditing)
  const table = useDataTable({
    data: canRead ? (partnersQuery.data ?? []) : [],
    columns,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Partners"
        description="Manage the organizations shown in the homepage Partners section."
      >
        {canCreate && (
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" />
            Add partner
          </Button>
        )}
      </PageHeader>

      {partnersQuery.isError ? (
        <QueryError
          title="Couldn't load partners"
          error={partnersQuery.error}
          onRetry={() => void partnersQuery.refetch()}
        />
      ) : (
        <DataTable
          table={table}
          isLoading={partnersQuery.isPending}
          emptyState={
            <EmptyState icon={Handshake}>
              No partners yet.
              {canCreate ? " Add a partner to get started." : ""}
            </EmptyState>
          }
        />
      )}

      {canRead && (
        <PartnerCategoriesSection
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      {editing !== null && (
        <PartnerDialog
          partner={editing === "new" ? undefined : editing}
          canDelete={canDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function PartnerDialog({
  partner,
  canDelete,
  onClose,
}: {
  partner?: PartnerAdminItem
  canDelete: boolean
  onClose: () => void
}) {
  const saveMutation = useSavePartnerMutation()
  const deleteMutation = useDeletePartnerMutation()
  const categories = usePartnerCategoriesQuery().data ?? []
  const [values, setValues] = React.useState({
    name: partner?.name ?? "",
    websiteUrl: partner?.websiteUrl ?? "",
    tier: partner?.tier ?? "",
    sortOrder: partner?.sortOrder ?? 0,
    logoMediaId: partner?.logoMediaId ?? null,
  })
  const [logoUrl, setLogoUrl] = React.useState(partner?.logoUrl ?? null)

  const set = (patch: Partial<typeof values>) =>
    setValues((current) => ({ ...current, ...patch }))

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!values.name.trim()) {
      toast.error("The partner name is required.")
      return
    }
    if (!values.tier) {
      toast.error("Choose a category. Add one first if none exist.")
      return
    }
    saveMutation.mutate(
      {
        id: partner?.id,
        name: values.name,
        logoMediaId: values.logoMediaId,
        websiteUrl: values.websiteUrl.trim(),
        tier: values.tier,
        sortOrder: values.sortOrder,
      },
      {
        onSuccess: () => {
          toast.success(partner ? "Partner saved." : "Partner added.")
          onClose()
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Couldn't save the partner.")),
      }
    )
  }

  const remove = () => {
    if (!partner) return
    deleteMutation.mutate(partner.id, {
      onSuccess: () => {
        toast.success("Partner removed.")
        onClose()
      },
      onError: (error) =>
        toast.error(getErrorMessage(error, "Couldn't remove the partner.")),
    })
  }

  return (
    <EntityDialog
      title={partner ? "Edit partner" : "Add partner"}
      description="Manage the partner name, logo, website and homepage category."
      submitLabel={partner ? "Save changes" : "Add partner"}
      submitPending={saveMutation.isPending}
      onSubmit={submit}
      onClose={onClose}
      remove={
        partner && canDelete
          ? {
              confirmTitle: "Delete this partner?",
              confirmDescription: `"${partner.name}" will be removed from the homepage.`,
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
            <FieldLabel htmlFor="partner-name">Name</FieldLabel>
            <Input
              id="partner-name"
              value={values.name}
              onChange={(event) => set({ name: event.target.value })}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="partner-url">Website URL</FieldLabel>
            <Input
              id="partner-url"
              value={values.websiteUrl}
              onChange={(event) => set({ websiteUrl: event.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="partner-tier">Category</FieldLabel>
            <Select
              value={values.tier}
              onValueChange={(tier) => {
                if (tier) set({ tier })
              }}
            >
              <SelectTrigger id="partner-tier" className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="partner-order">Display order</FieldLabel>
            <Input
              id="partner-order"
              type="number"
              min={0}
              value={values.sortOrder}
              onChange={(event) =>
                set({ sortOrder: Number(event.target.value) || 0 })
              }
            />
          </Field>
        </div>
      </FieldGroup>
    </EntityDialog>
  )
}
