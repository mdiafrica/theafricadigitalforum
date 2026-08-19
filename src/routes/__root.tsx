import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

import { getLocale } from "@/paraglide/runtime"
import { Toaster } from "@/components/ui/sonner"
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo"
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
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:title", content: SITE_NAME },
        { property: "og:description", content: SITE_DESCRIPTION },
        { property: "og:image", content: absoluteUrl("/icon-512.png") },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: SITE_NAME },
        { name: "twitter:description", content: SITE_DESCRIPTION },
        { name: "twitter:image", content: absoluteUrl("/icon-512.png") },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: absoluteUrl("/icon-512.png"),
            sameAs: [
              "https://www.facebook.com/theafricadigitalforum/",
              "https://www.linkedin.com/company/theafricadigitalforum/",
              "https://x.com/ADFafrica",
              "https://www.instagram.com/theafricadigitalforum/",
              "https://youtube.com/@theafricadigitalforum",
            ],
          }),
        },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/icon-192.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "512x512",
          href: "/icon-512.png",
        },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/manifest.json" },
      ],
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
    <>
      <Outlet />
      <Toaster position="top-center" />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} className="dark" style={{ colorScheme: "dark" }}>
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
