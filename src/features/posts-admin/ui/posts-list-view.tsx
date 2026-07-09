import * as React from "react"
import { Link } from "@tanstack/react-router"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { FileTextIcon, MoreHorizontal, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { useSessionQuery } from "@/domains/auth"
import {
  useDeletePostMutation,
  usePostsAdminListQuery,
  usePublishPostMutation,
  useUnpublishPostMutation,
  type PostAdminList,
} from "@/domains/posts"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState, QueryError } from "@/components/admin/query-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDataTable } from "@/hooks/use-data-table"
import { hasOrgPermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/error"

type PostItem = PostAdminList["items"][number]

function usePostColumns(canPublish: boolean, canDelete: boolean) {
  return React.useMemo<ColumnDef<PostItem, unknown>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
          const post = row.original
          return (
            <div className="max-w-64">
              <Link
                to="/admin/posts/$id"
                params={{ id: post.id }}
                className="block truncate font-medium hover:underline"
              >
                {post.title}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                /blog/{post.slug}
                {post.authorName ? ` · ${post.authorName}` : ""}
              </p>
            </div>
          )
        },
      },
      {
        id: "languages",
        header: "Languages",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.locales
              .map((locale) => locale.toUpperCase())
              .join(" · ")}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(row.original.updatedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "published" ? "default" : "secondary"
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <PostActionsCell
            post={row.original}
            canPublish={canPublish}
            canDelete={canDelete}
          />
        ),
      },
    ],
    [canPublish, canDelete]
  )
}

export function PostsListView() {
  const sessionQuery = useSessionQuery()
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const postsQuery = usePostsAdminListQuery({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canCreate = hasOrgPermission(caller, { post: ["create"] })
  const canPublish = hasOrgPermission(caller, { post: ["publish"] })
  const canDelete = hasOrgPermission(caller, { post: ["delete"] })

  const columns = usePostColumns(canPublish, canDelete)
  const pageCount = postsQuery.data
    ? Math.ceil(postsQuery.data.total / postsQuery.data.pageSize)
    : 0
  const table = useDataTable({
    data: postsQuery.data?.items ?? [],
    columns,
    pageCount,
    pagination,
    onPaginationChange: setPagination,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Posts"
        description="Write, translate and publish blog articles."
      >
        {canCreate && (
          <Button render={<Link to="/admin/posts/new" />}>
            <PlusIcon data-icon="inline-start" />
            New post
          </Button>
        )}
      </PageHeader>

      {postsQuery.isError ? (
        <QueryError
          title="Couldn't load posts"
          error={postsQuery.error}
          onRetry={() => void postsQuery.refetch()}
        />
      ) : (
        <DataTable
          table={table}
          isLoading={postsQuery.isPending}
          pageSizeOptions={[10, 20, 30, 50]}
          emptyState={
            <EmptyState icon={FileTextIcon}>
              No posts yet.
              {canCreate ? " Create the first article to get started." : ""}
            </EmptyState>
          }
        />
      )}
    </div>
  )
}

function PostActionsCell({
  post,
  canPublish,
  canDelete,
}: {
  post: PostItem
  canPublish: boolean
  canDelete: boolean
}) {
  const publishMutation = usePublishPostMutation()
  const unpublishMutation = useUnpublishPostMutation()
  const deleteMutation = useDeletePostMutation()
  const [confirmingDelete, setConfirmingDelete] = React.useState(false)

  if (!canPublish && !canDelete) return null

  const publish = () => {
    publishMutation.mutate(post.id, {
      onSuccess: () => toast.success("Post published."),
      onError: (error) =>
        toast.error(getErrorMessage(error, "Couldn't publish the post.")),
    })
  }
  const unpublish = () => {
    unpublishMutation.mutate(post.id, {
      onSuccess: () => toast.success("Post reverted to draft."),
      onError: (error) =>
        toast.error(getErrorMessage(error, "Couldn't unpublish the post.")),
    })
  }
  const remove = () => {
    deleteMutation.mutate(post.id, {
      onSuccess: () => toast.success("Post deleted."),
      onError: (error) =>
        toast.error(getErrorMessage(error, "Couldn't delete the post.")),
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Post actions" />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canPublish && post.status === "draft" && (
            <DropdownMenuItem onClick={publish}>Publish</DropdownMenuItem>
          )}
          {canPublish && post.status === "published" && (
            <DropdownMenuItem onClick={unpublish}>
              Revert to draft
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmingDelete(true)}
              >
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete this post?"
        description={`"${post.title}" and its translations will be permanently deleted.`}
        onConfirm={remove}
      />
    </>
  )
}
