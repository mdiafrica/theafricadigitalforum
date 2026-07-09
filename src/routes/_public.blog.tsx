import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_public/blog")({ component: BlogLayout })

function BlogLayout() {
  return <Outlet />
}
