import { createFileRoute } from "@tanstack/react-router"

import { auth } from "@/server/auth"

/**
 * better-auth catch-all handler (design §1) — the one server route the auth
 * client fetches. All other internal data goes through server functions.
 */
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
})
