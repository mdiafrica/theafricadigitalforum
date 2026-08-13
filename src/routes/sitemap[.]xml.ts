import { createFileRoute } from "@tanstack/react-router"
import { desc, eq } from "drizzle-orm"

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

function urlEntry(path: string, lastmod?: Date | null) {
  return [
    "  <url>",
    `    <loc>${SITE_URL}${path}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod.toISOString()}</lastmod>`] : []),
    "  </url>",
  ].join("\n")
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const posts = await db
          .select({
            slug: schema.post.slug,
            updatedAt: schema.post.updatedAt,
          })
          .from(schema.post)
          .where(eq(schema.post.status, "published"))
          .orderBy(desc(schema.post.publishedAt))

        const sitemap = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...STATIC_PATHS.map((path) => urlEntry(path)),
          ...posts.map((post) =>
            urlEntry(`/blog/${post.slug}`, post.updatedAt)
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
