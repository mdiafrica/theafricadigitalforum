import { createFileRoute } from "@tanstack/react-router"

import { PostsListView } from "@/features/posts-admin/ui/posts-list-view"

export const Route = createFileRoute("/admin/posts/")({
  head: () => ({ meta: [{ title: "Posts | Africa Digital Forum" }] }),
  component: PostsListView,
})
