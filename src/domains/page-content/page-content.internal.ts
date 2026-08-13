import { and, eq } from "drizzle-orm"

import { EDITORIAL_BOARD_DEFAULTS } from "@/lib/editorial-board"
import type { Locale } from "@/lib/schemas"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

/**
 * The Editorial Board identity (byline name + bio) — admin-editable via the
 * site / editorial-board pageContent section, falling back to the built-in
 * copy. Server-side helper for the posts byline resolution.
 */
export async function resolveEditorialBoard(locale: Locale) {
  const rows = await db.query.pageContent.findMany({
    where: and(
      eq(schema.pageContent.page, "site"),
      eq(schema.pageContent.section, "editorial-board")
    ),
  })
  const other = locale === "en" ? "fr" : "en"
  const preferred =
    rows.find((r) => r.locale === locale) ??
    rows.find((r) => r.locale === other)
  const data = (preferred?.data ?? {}) as { name?: unknown; bio?: unknown }

  const text = (value: unknown, fallback: string) =>
    typeof value === "string" && value.trim() ? value : fallback

  return {
    name: text(data.name, EDITORIAL_BOARD_DEFAULTS.name),
    bio: text(data.bio, EDITORIAL_BOARD_DEFAULTS.bio),
  }
}
