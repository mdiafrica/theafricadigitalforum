import { and, eq } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import {
  getPageContentInput,
  listPageContentAdminInput,
  savePageContentInput,
} from "./page-content.schemas"

/**
 * Page singletons: one JSONB blob per (page, section, locale).
 * The public read resolves ONE locale per section (requested first, then the
 * other) so components receive a shape close to the old `t.home.*` objects.
 */

export const getPageContent = createServerFn({ method: "GET" })
  .validator(getPageContentInput)
  .handler(async ({ data }) => {
    const rows = await db.query.pageContent.findMany({
      where: eq(schema.pageContent.page, data.page),
    })

    const other = data.locale === "en" ? "fr" : "en"
    const result: Record<string, Record<string, schema.JsonValue>> = {}
    for (const section of new Set(rows.map((row) => row.section))) {
      const preferred =
        rows.find((r) => r.section === section && r.locale === data.locale) ??
        rows.find((r) => r.section === section && r.locale === other)
      if (preferred) result[section] = preferred.data
    }
    return result
  })

export const listPageContentAdmin = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ pageContent: ["read"] })])
  .validator(listPageContentAdminInput)
  .handler(async ({ data }) => {
    const rows = await db.query.pageContent.findMany({
      where: eq(schema.pageContent.page, data.page),
    })
    return rows.map((row) => ({
      section: row.section,
      locale: row.locale,
      data: row.data,
      updatedAt: row.updatedAt,
    }))
  })

export const savePageContent = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ pageContent: ["update"] })])
  .validator(savePageContentInput)
  .handler(async ({ data }) => {
    await db
      .insert(schema.pageContent)
      .values({
        page: data.page,
        section: data.section,
        locale: data.locale,
        data: data.data as Record<string, schema.JsonValue>,
      })
      .onConflictDoUpdate({
        target: [
          schema.pageContent.page,
          schema.pageContent.section,
          schema.pageContent.locale,
        ],
        set: { data: data.data as Record<string, schema.JsonValue> },
      })
    return { ok: true as const }
  })

export const deletePageContent = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ pageContent: ["update"] })])
  .validator(
    savePageContentInput.pick({ page: true, section: true, locale: true })
  )
  .handler(async ({ data }) => {
    await db
      .delete(schema.pageContent)
      .where(
        and(
          eq(schema.pageContent.page, data.page),
          eq(schema.pageContent.section, data.section),
          eq(schema.pageContent.locale, data.locale)
        )
      )
    return { ok: true as const }
  })
