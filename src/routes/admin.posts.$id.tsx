import { createFileRoute } from "@tanstack/react-router"

import { PostEditView } from "@/features/posts-admin/ui/post-editor-view"

export const Route = createFileRoute("/admin/posts/$id")({
  head: () => ({ meta: [{ title: "Edit post | Africa Digital Forum" }] }),
  component: PostEditRoute,
})

function PostEditRoute() {
  const { id } = Route.useParams()
  return <PostEditView id={id} />
}
