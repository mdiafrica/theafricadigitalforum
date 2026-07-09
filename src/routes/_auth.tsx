import { Link, Outlet, createFileRoute } from "@tanstack/react-router"

/** Auth shell — centered card, no site chrome. */
export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Link
        to="/"
        className="adf-gradient-text mb-8 font-heading text-xl font-extrabold tracking-tight"
      >
        Africa Digital Forum
      </Link>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
