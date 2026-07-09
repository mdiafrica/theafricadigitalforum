import { and, eq } from "drizzle-orm"
import type { InferInsertModel } from "drizzle-orm"
import type { PgColumn, PgTable, PgUpdateSetSource } from "drizzle-orm/pg-core"

import type { Locale } from "@/lib/schemas"
import type { db } from "@/server/db"

/**
 * Translation-row helpers shared by every bilingual collection
 * (posts, speakers, events): one base row + one row per locale with
 * unique(parent, locale).
 */

/** Works inside and outside `db.transaction`. */
export type DbExecutor = Pick<typeof db, "insert" | "delete">

/** Resolve one locale with fallback to the other. */
export function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: Locale
): T | null {
  const other = locale === "en" ? "fr" : "en"
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === other) ??
    null
  )
}

/** Rows keyed by locale for admin payloads. */
export function indexByLocale<T extends { locale: string }, R>(
  rows: T[],
  project: (row: T) => R
): Partial<Record<Locale, R>> {
  return Object.fromEntries(
    rows.map((row) => [row.locale, project(row)])
  ) as Partial<Record<Locale, R>>
}

/**
 * Upsert the EN row and, when provided, the FR row. Pass `fr: undefined`
 * to clear: an FR translation emptied in the form is removed, not kept
 * stale.
 */
export async function upsertTranslationRows<TTable extends PgTable>(opts: {
  tx: DbExecutor
  table: TTable
  parentKey: string
  parentColumn: PgColumn
  localeColumn: PgColumn
  parentId: string
  en: PgUpdateSetSource<TTable>
  fr: PgUpdateSetSource<TTable> | undefined
}) {
  const rows: Array<{ locale: Locale; values: PgUpdateSetSource<TTable> }> = [
    { locale: "en", values: opts.en },
    ...(opts.fr ? [{ locale: "fr" as const, values: opts.fr }] : []),
  ]

  for (const { locale, values } of rows) {
    await opts.tx
      .insert(opts.table)
      .values({
        [opts.parentKey]: opts.parentId,
        locale,
        ...values,
      } as InferInsertModel<TTable>)
      .onConflictDoUpdate({
        target: [opts.parentColumn, opts.localeColumn],
        set: values,
      })
  }

  if (!opts.fr) {
    await opts.tx
      .delete(opts.table)
      .where(
        and(eq(opts.parentColumn, opts.parentId), eq(opts.localeColumn, "fr"))
      )
  }
}
