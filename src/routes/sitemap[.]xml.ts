import { createFileRoute } from "@tanstack/react-router"
import { and, desc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { SITE_URL } from "@/lib/seo"

const STATIC_PATHS = [
  "/",
  "/about",
  "/why-adf",
  "/host-city",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
]

/**
 * English lives on bare paths, French under /fr/ (ADR-0002). "/" maps to
 * "/fr/" (with slash) — that's the URL the middleware canonicalizes to.
 */
const frPath = (path: string) => `/fr${path}`

type Alternate = { hreflang: string; path: string }

function urlEntry(
  path: string,
  opts: { lastmod?: Date | null; alternates?: Alternate[] } = {}
) {
  return [
    "  <url>",
    `    <loc>${SITE_URL}${path}</loc>`,
    ...(opts.lastmod
      ? [`    <lastmod>${opts.lastmod.toISOString()}</lastmod>`]
      : []),
    ...(opts.alternates ?? []).map(
      (alt) =>
        `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${SITE_URL}${alt.path}"/>`
    ),
    "  </url>",
  ].join("\n")
}

/** Both locale URLs, each carrying the full alternate set (per Google). */
function bilingualEntries(path: string, lastmod?: Date | null) {
  const alternates: Alternate[] = [
    { hreflang: "en", path },
    { hreflang: "fr", path: frPath(path) },
    { hreflang: "x-default", path },
  ]
  return [
    urlEntry(path, { lastmod, alternates }),
    urlEntry(frPath(path), { lastmod, alternates }),
  ]
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const posts = await db
          .select({
            slug: schema.post.slug,
            updatedAt: schema.post.updatedAt,
            // Language visibility (ADR-0003): the /fr/ URL is listed only
            // when the French translation is published.
            hasFr: eq(schema.postTranslation.published, true),
          })
          .from(schema.post)
          .leftJoin(
            schema.postTranslation,
            and(
              eq(schema.postTranslation.postId, schema.post.id),
              eq(schema.postTranslation.locale, "fr")
            )
          )
          .where(eq(schema.post.status, "published"))
          .orderBy(desc(schema.post.publishedAt))

        const sitemap = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          // Static pages are fully translated UI: list both locales.
          ...STATIC_PATHS.flatMap((path) => bilingualEntries(path)),
          ...posts.flatMap((post) =>
            post.hasFr === true
              ? bilingualEntries(`/blog/${post.slug}`, post.updatedAt)
              : [urlEntry(`/blog/${post.slug}`, { lastmod: post.updatedAt })]
          ),
          "</urlset>",
        ].join("\n")

        return new Response(sitemap, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        })
      },
    },
  },
})
