import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { useSessionQuery } from "@/domains/auth"
import {
  usePostAdminDetailQuery,
  usePublishPostMutation,
  useUnpublishPostMutation,
  useDeletePostMutation,
} from "@/domains/posts"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { PageHeader } from "@/components/admin/page-header"
import { QueryError } from "@/components/admin/query-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { hasOrgPermission } from "@/lib/auth/permissions"
import { getErrorMessage } from "@/lib/error"
import { PostForm } from "./post-form"

export function PostCreateView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New post"
        back={{ to: "/admin/posts", label: "All posts" }}
      />
      <PostForm />
    </div>
  )
}

export function PostEditView({ id }: { id: string }) {
  const sessionQuery = useSessionQuery()
  const postQuery = usePostAdminDetailQuery(id)
  const publishMutation = usePublishPostMutation()
  const unpublishMutation = useUnpublishPostMutation()
  const deleteMutation = useDeletePostMutation()
  const navigate = useNavigate()

  const session = sessionQuery.data
  const caller = { globalRole: session?.user.role, orgRole: session?.orgRole }
  const canPublish = hasOrgPermission(caller, { post: ["publish"] })
  const canDelete = hasOrgPermission(caller, { post: ["delete"] })

  if (postQuery.isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (postQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl">
        <QueryError
          title="Couldn't load the post"
          error={postQuery.error}
          onRetry={() => void postQuery.refetch()}
        />
      </div>
    )
  }

  const post = postQuery.data

  const headerActions = (
    <>
      {canPublish && post.status === "draft" && (
        <Button
          type="button"
          variant="outline"
          disabled={publishMutation.isPending}
          onClick={() =>
            publishMutation.mutate(post.id, {
              onSuccess: () => toast.success("Post published."),
              onError: (error) =>
                toast.error(getErrorMessage(error, "Couldn't publish.")),
            })
          }
        >
          {publishMutation.isPending && <Spinner />}
          Publish
        </Button>
      )}
      {canPublish && post.status === "published" && (
        <Button
          type="button"
          variant="outline"
          disabled={unpublishMutation.isPending}
          onClick={() =>
            unpublishMutation.mutate(post.id, {
              onSuccess: () => toast.success("Post reverted to draft."),
              onError: (error) =>
                toast.error(getErrorMessage(error, "Couldn't unpublish.")),
            })
          }
        >
          {unpublishMutation.isPending && <Spinner />}
          Revert to draft
        </Button>
      )}
      {canDelete && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          }
          title="Delete this post?"
          description="The post and its translations will be permanently deleted."
          onConfirm={() =>
            deleteMutation.mutate(post.id, {
              onSuccess: () => {
                toast.success("Post deleted.")
                void navigate({ to: "/admin/posts" })
              },
              onError: (error) =>
                toast.error(getErrorMessage(error, "Couldn't delete.")),
            })
          }
        />
      )}
    </>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit post"
        back={{ to: "/admin/posts", label: "All posts" }}
        badge={
          <Badge
            variant={post.status === "published" ? "default" : "secondary"}
          >
            {post.status}
          </Badge>
        }
      />
      {/* Remount the form when server state changes id (fresh defaults). */}
      <PostForm key={post.id} post={post} headerActions={headerActions} />
    </div>
  )
}
