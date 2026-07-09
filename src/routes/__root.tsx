import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

import { I18nProvider } from "@/i18n/context"
import { Toaster } from "@/components/ui/sonner"
import appCss from "../styles.css?url"

const SITE_TITLE =
  "Africa Digital Forum | Africa's Premier Digital Innovation & Technology Forum"
const SITE_DESCRIPTION =
  "Africa Digital Forum (ADF) is Africa's premier platform connecting governments, technology leaders, startups, investors, academia and innovators to accelerate digital transformation across the continent."

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: SITE_TITLE },
        { name: "description", content: SITE_DESCRIPTION },
        { name: "theme-color", content: "#050d1a" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Africa Digital Forum" },
        { property: "og:title", content: "Africa Digital Forum" },
        { property: "og:description", content: SITE_DESCRIPTION },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Africa Digital Forum" },
        { name: "twitter:description", content: SITE_DESCRIPTION },
      ],
      links: [{ rel: "stylesheet", href: appCss }],
    }),
    notFoundComponent: () => (
      <main className="container mx-auto px-6 py-24 text-center">
        <p className="adf-gradient-text font-heading text-7xl font-extrabold">
          404
        </p>
        <p className="mt-4 text-muted-foreground">
          The page you're looking for could not be found.
        </p>
      </main>
    ),
    errorComponent: ({ error }) => (
      <main className="container mx-auto px-6 py-24 text-center">
        <p className="font-heading text-3xl font-extrabold">
          Something went wrong
        </p>
        <p className="mt-4 text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
        <a
          href="/"
          className="mt-6 inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          Back to the homepage
        </a>
      </main>
    ),
    component: RootComponent,
    shellComponent: RootDocument,
  }
)

function RootComponent() {
  // Shells (site header/footer, admin sidebar, auth card) live in pathless
  // layout routes: _public, _auth, and the /admin layout.
  return (
    <I18nProvider>
      <Outlet />
      <Toaster position="top-center" />
    </I18nProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="adf-backdrop" aria-hidden="true" />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
