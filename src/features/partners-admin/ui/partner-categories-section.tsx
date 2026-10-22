import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusIcon, Tags } from "lucide-react"
import { toast } from "sonner"

import {
  useDeletePartnerCategoryMutation,
  usePartnerCategoriesQuery,
  useSavePartnerCategoryMutation,
} from "@/domains/partners"
import type { PartnerCategoryItem } from "@/domains/partners"
import { EntityDialog } from "@/components/admin/entity-dialog"
import { EmptyState, QueryError } from "@/components/admin/query-states"
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
import { useDataTable } from "@/hooks/use-data-table"
import { getErrorMessage } from "@/lib/error"

function useCategoryColumns(
  canEdit: boolean,
  onEdit: (category: PartnerCategoryItem) => void
) {
  return React.useMemo<ColumnDef<PartnerCategoryItem, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Category" },
      { accessorKey: "sortOrder", header: "Order" },
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
                    aria-label="Category actions"
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

export function PartnerCategoriesSection({
  canCreate,
  canEdit,
  canDelete,
}: {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}) {
  const categoriesQuery = usePartnerCategoriesQuery()
  const [editing, setEditing] = React.useState<
    PartnerCategoryItem | "new" | null
  >(null)

  const columns = useCategoryColumns(canEdit, setEditing)
  const table = useDataTable({
    data: categoriesQuery.data ?? [],
    columns,
  })

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">
            Groups shown on the homepage, such as Host, Gold or Silver sponsors.
          </p>
        </div>
        {canCreate && (
          <Button variant="outline" onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" />
            Add category
          </Button>
        )}
      </div>

      {categoriesQuery.isError ? (
        <QueryError
          title="Couldn't load categories"
          error={categoriesQuery.error}
          onRetry={() => void categoriesQuery.refetch()}
        />
      ) : (
        <DataTable
          table={table}
          isLoading={categoriesQuery.isPending}
          emptyState={
            <EmptyState icon={Tags}>
              No categories yet.
              {canCreate ? " Add a category to group your partners." : ""}
            </EmptyState>
          }
        />
      )}

      {editing !== null && (
        <CategoryDialog
          category={editing === "new" ? undefined : editing}
          canDelete={canDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  )
}

function CategoryDialog({
  category,
  canDelete,
  onClose,
}: {
  category?: PartnerCategoryItem
  canDelete: boolean
  onClose: () => void
}) {
  const saveMutation = useSavePartnerCategoryMutation()
  const deleteMutation = useDeletePartnerCategoryMutation()
  const [name, setName] = React.useState(category?.name ?? "")
  const [sortOrder, setSortOrder] = React.useState(category?.sortOrder ?? 0)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("The category name is required.")
      return
    }
    saveMutation.mutate(
      { id: category?.id, name, sortOrder },
      {
        onSuccess: () => {
          toast.success(category ? "Category saved." : "Category added.")
          onClose()
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Couldn't save the category.")),
      }
    )
  }

  const remove = () => {
    if (!category) return
    deleteMutation.mutate(category.id, {
      onSuccess: () => {
        toast.success("Category removed.")
        onClose()
      },
      onError: (error) =>
        toast.error(getErrorMessage(error, "Couldn't remove the category.")),
    })
  }

  return (
    <EntityDialog
      title={category ? "Edit category" : "Add category"}
      description="Categories group partners on the homepage. Lower order numbers appear first."
      submitLabel={category ? "Save changes" : "Add category"}
      submitPending={saveMutation.isPending}
      onSubmit={submit}
      onClose={onClose}
      remove={
        category && canDelete
          ? {
              confirmTitle: "Delete this category?",
              confirmDescription: `"${category.name}" will be removed. Categories that still contain partners can't be deleted.`,
              pending: deleteMutation.isPending,
              onDelete: remove,
            }
          : undefined
      }
    >
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="partner-category-name">Name</FieldLabel>
            <Input
              id="partner-category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="partner-category-order">
              Display order
            </FieldLabel>
            <Input
              id="partner-category-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(Number(event.target.value) || 0)
              }
            />
          </Field>
        </div>
      </FieldGroup>
    </EntityDialog>
  )
}
