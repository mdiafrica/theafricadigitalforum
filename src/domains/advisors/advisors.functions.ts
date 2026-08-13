import { asc, eq } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { assertOrgPermission, requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import {
  indexByLocale,
  pickTranslation,
  upsertTranslationRows,
} from "@/server/db/translations"
import type { DbExecutor } from "@/server/db/translations"
import { mediaVariantUrl } from "@/server/media/variants"
import {
  advisorIdInput,
  listPublicAdvisorsInput,
  saveAdvisorInput,
} from "./advisors.schemas"
import type { AdvisorTranslationsInput } from "./advisors.schemas"

async function upsertTranslations(
  advisorId: string,
  translations: AdvisorTranslationsInput,
  tx: DbExecutor
) {
  await upsertTranslationRows({
    tx,
    table: schema.advisorTranslation,
    parentKey: "advisorId",
    parentColumn: schema.advisorTranslation.advisorId,
    localeColumn: schema.advisorTranslation.locale,
    parentId: advisorId,
    en: { name: translations.en.name, role: translations.en.role },
    fr: translations.fr?.name.trim()
      ? { name: translations.fr.name, role: translations.fr.role }
      : undefined,
  })
}

export const saveAdvisor = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ advisor: ["update"] })])
  .validator(saveAdvisorInput)
  .handler(async ({ data, context }) => {
    if (!data.id) assertOrgPermission(context.auth, { advisor: ["create"] })

    const values = {
      photoMediaId: data.photoMediaId ?? null,
      twitterUrl: data.twitterUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      sortOrder: data.sortOrder,
    }

    return db.transaction(async (tx) => {
      let id = data.id
      if (id) {
        const [row] = await tx
          .update(schema.advisor)
          .set(values)
          .where(eq(schema.advisor.id, id))
          .returning({ id: schema.advisor.id })
        if (!row) throw new Error("Advisor not found")
      } else {
        const [row] = await tx
          .insert(schema.advisor)
          .values(values)
          .returning({ id: schema.advisor.id })
        id = row.id
      }

      await upsertTranslations(id, data.translations, tx)
      return { id }
    })
  })

export const deleteAdvisor = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ advisor: ["delete"] })])
  .validator(advisorIdInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .delete(schema.advisor)
      .where(eq(schema.advisor.id, data.id))
      .returning({ id: schema.advisor.id })
    if (!row) throw new Error("Advisor not found")
    return { id: row.id }
  })

export const listAdvisorsAdmin = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ advisor: ["read"] })])
  .handler(async () => {
    const rows = await db.query.advisor.findMany({
      with: { translations: true, photoMedia: true },
      orderBy: [asc(schema.advisor.sortOrder), asc(schema.advisor.createdAt)],
    })

    return rows.map((row) => ({
      id: row.id,
      photoMediaId: row.photoMediaId,
      photoUrl: mediaVariantUrl(row.photoMedia, 640),
      twitterUrl: row.twitterUrl,
      linkedinUrl: row.linkedinUrl,
      sortOrder: row.sortOrder,
      translations: indexByLocale(row.translations, (t) => ({
        name: t.name,
        role: t.role,
      })),
    }))
  })

export const listPublicAdvisors = createServerFn({ method: "GET" })
  .validator(listPublicAdvisorsInput)
  .handler(async ({ data }) => {
    const rows = await db.query.advisor.findMany({
      with: { translations: true, photoMedia: true },
      orderBy: [asc(schema.advisor.sortOrder), asc(schema.advisor.createdAt)],
    })

    return rows
      .map((row) => {
        const translation = pickTranslation(row.translations, data.locale)
        if (!translation) return null
        return {
          id: row.id,
          name: translation.name,
          role: translation.role,
          photoUrl: mediaVariantUrl(row.photoMedia, 640),
          twitterUrl: row.twitterUrl,
          linkedinUrl: row.linkedinUrl,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  })

export type AdvisorAdminItem = Awaited<
  ReturnType<typeof listAdvisorsAdmin>
>[number]
export type PublicAdvisor = Awaited<
  ReturnType<typeof listPublicAdvisors>
>[number]
