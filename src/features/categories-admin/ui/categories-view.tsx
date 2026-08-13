import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { PlusIcon, Tags } from "lucide-react"
import { toast } from "sonner"

import { useSessionQuery } from "@/domains/auth"
import {
  CATEGORY_COLOR_PALETTE,
  useCategoriesAdminQuery,
  useDeleteCategoryMutation,
  useSaveCategoryMutation,
  type CategoryAdminItem,
} from "@/domains/categories"
import { slugify } from "@/domains/posts"
import { EntityDialog } from "@/components/admin/entity-dialog"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState, QueryError } from "@/components/admin/query-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table/data-table"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useDataTable } from "@/hooks/use-data-table"
import { hasOrgPermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/error"
import { cn } from "@/lib/utils"

function useCategoryColumns(
  canEdit: boolean,
  onEdit: (category: CategoryAdminItem) => void
) {
  return React.useMemo<ColumnDef<CategoryAdminItem, unknown>[]>(
    () => [
      {
        accessorKey: "nameEn",
        header: "Category",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: row.original.color }}
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.nameEn}</p>
              <p className="truncate text-xs text-muted-foreground">
                /{row.original.slug}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "nameFr",
        header: "French name",
        cell: ({ row }) =>
          row.original.nameFr || (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "postCount",
        header: "Articles",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.postCount}</Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          canEdit ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              Edit
            </Button>
          ) : null,
      },
    ],
    [canEdit, onEdit]
  )
}

export function CategoriesView() {
  const sessionQuery = useSessionQuery()
  const categoriesQuery = useCategoriesAdminQuery()
  const [editing, setEditing] = React.useState<
    CategoryAdminItem | "new" | null
  >(null)

  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canEdit = hasOrgPermission(caller, { category: ["update"] })
  const canDelete = hasOrgPermission(caller, { category: ["delete"] })

  const columns = useCategoryColumns(canEdit, setEditing)
  const table = useDataTable({ data: categoriesQuery.data ?? [], columns })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Categories"
        description="The article taxonomy — names, colors and slugs used across the blog."
      >
        {canEdit && (
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" />
            Add category
          </Button>
        )}
      </PageHeader>

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
              {canEdit ? " Add the first category to get started." : ""}
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
    </div>
  )
}

function CategoryDialog({
  category,
  canDelete,
  onClose,
}: {
  category?: CategoryAdminItem
  canDelete: boolean
  onClose: () => void
}) {
  const saveMutation = useSaveCategoryMutation()
  const deleteMutation = useDeleteCategoryMutation()
  const [values, setValues] = React.useState({
    nameEn: category?.nameEn ?? "",
    nameFr: category?.nameFr ?? "",
    slug: category?.slug ?? "",
    color: category?.color ?? CATEGORY_COLOR_PALETTE[0],
  })
  // Auto-derive the slug from the EN name until it's edited by hand.
  const [slugTouched, setSlugTouched] = React.useState(Boolean(category))

  const set = (patch: Partial<typeof values>) =>
    setValues((current) => ({ ...current, ...patch }))

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!values.nameEn.trim() || !values.slug.trim()) {
      toast.error("The English name and slug are required.")
      return
    }
    saveMutation.mutate(
      {
        id: category?.id,
        slug: values.slug,
        color: values.color,
        nameEn: values.nameEn,
        nameFr: values.nameFr,
      },
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
      description="Shown as pills on articles and used to filter the blog."
      submitLabel={category ? "Save changes" : "Add category"}
      submitPending={saveMutation.isPending}
      onSubmit={submit}
      onClose={onClose}
      remove={
        category && canDelete
          ? {
              confirmTitle: "Delete this category?",
              confirmDescription:
                category.postCount > 0
                  ? `"${category.nameEn}" is used by ${category.postCount} article${category.postCount === 1 ? "" : "s"} — deleting will fail until they're reassigned.`
                  : `"${category.nameEn}" will be removed from the site.`,
              pending: deleteMutation.isPending,
              onDelete: remove,
            }
          : undefined
      }
    >
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="category-name-en">Name (English)</FieldLabel>
            <Input
              id="category-name-en"
              value={values.nameEn}
              onChange={(e) => {
                const nameEn = e.target.value
                set(
                  slugTouched
                    ? { nameEn }
                    : { nameEn, slug: slugify(nameEn) }
                )
              }}
              placeholder="Digital Policy"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="category-name-fr">Name (French)</FieldLabel>
            <Input
              id="category-name-fr"
              value={values.nameFr}
              onChange={(e) => set({ nameFr: e.target.value })}
              placeholder="Politique numérique"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="category-slug">Slug</FieldLabel>
          <Input
            id="category-slug"
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true)
              set({ slug: e.target.value })
            }}
            placeholder="digital-policy"
            required
          />
        </Field>
        <Field>
          <FieldLabel>Color</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Use color ${color}`}
                className={cn(
                  "size-7 rounded-full transition-transform hover:scale-110",
                  values.color === color &&
                    "ring-2 ring-ring ring-offset-2 ring-offset-background"
                )}
                style={{ backgroundColor: color }}
                onClick={() => set({ color })}
              />
            ))}
          </div>
        </Field>
      </FieldGroup>
    </EntityDialog>
  )
}
