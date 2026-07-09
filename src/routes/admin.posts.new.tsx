import { createFileRoute } from "@tanstack/react-router"

import { PostCreateView } from "@/features/posts-admin/ui/post-editor-view"

export const Route = createFileRoute("/admin/posts/new")({
  head: () => ({ meta: [{ title: "New post | Africa Digital Forum" }] }),
  component: PostCreateView,
})
