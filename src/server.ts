import defaultEntry, {
  createServerEntry,
} from "@tanstack/react-start/server-entry"

import { paraglideMiddleware } from "./paraglide/server"

// Resolves the request's locale into AsyncLocalStorage before SSR so server
// HTML matches what the client hydrates, and 302s URLs whose locale disagrees
// with the visitor's resolved preference (cookie/Accept-Language → /fr/…).
// Pass the ORIGINAL request through: with the `url` strategy, TanStack Router
// itself de-localizes paths via `rewrite.input` — forwarding paraglide's
// rewritten request instead causes redirect loops (paraglide docs).
export default createServerEntry({
  fetch: (request, opts) =>
    paraglideMiddleware(request, () => defaultEntry.fetch(request, opts)),
})
