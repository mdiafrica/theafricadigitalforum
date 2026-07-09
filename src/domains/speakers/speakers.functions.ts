import { asc, eq } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { assertOrgPermission, requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import {
  indexByLocale,
  pickTranslation,
  upsertTranslationRows,
  type DbExecutor,
} from "@/server/db/translations"
import { mediaVariantUrl } from "@/server/media/variants"
import {
  listPublicSpeakersInput,
  saveSpeakerInput,
  speakerIdInput,
  type SpeakerTranslationsInput,
} from "./speakers.schemas"

async function upsertTranslations(
  speakerId: string,
  translations: SpeakerTranslationsInput,
  tx: DbExecutor
) {
  await upsertTranslationRows({
    tx,
    table: schema.speakerTranslation,
    parentKey: "speakerId",
    parentColumn: schema.speakerTranslation.speakerId,
    localeColumn: schema.speakerTranslation.locale,
    parentId: speakerId,
    en: { name: translations.en.name, role: translations.en.role },
    fr: translations.fr?.name.trim()
      ? { name: translations.fr.name, role: translations.fr.role }
      : undefined,
  })
}

export const saveSpeaker = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ speaker: ["update"] })])
  .validator(saveSpeakerInput)
  .handler(async ({ data, context }) => {
    if (!data.id) assertOrgPermission(context.auth, { speaker: ["create"] })

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
          .update(schema.speaker)
          .set(values)
          .where(eq(schema.speaker.id, id))
          .returning({ id: schema.speaker.id })
        if (!row) throw new Error("Speaker not found")
      } else {
        const [row] = await tx
          .insert(schema.speaker)
          .values(values)
          .returning({ id: schema.speaker.id })
        id = row.id
      }

      await upsertTranslations(id, data.translations, tx)
      return { id }
    })
  })

export const deleteSpeaker = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ speaker: ["delete"] })])
  .validator(speakerIdInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .delete(schema.speaker)
      .where(eq(schema.speaker.id, data.id))
      .returning({ id: schema.speaker.id })
    if (!row) throw new Error("Speaker not found")
    return { id: row.id }
  })

export const listSpeakersAdmin = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ speaker: ["read"] })])
  .handler(async () => {
    const rows = await db.query.speaker.findMany({
      with: { translations: true, photoMedia: true },
      orderBy: [asc(schema.speaker.sortOrder), asc(schema.speaker.createdAt)],
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

export const listPublicSpeakers = createServerFn({ method: "GET" })
  .validator(listPublicSpeakersInput)
  .handler(async ({ data }) => {
    const rows = await db.query.speaker.findMany({
      with: { translations: true, photoMedia: true },
      orderBy: [asc(schema.speaker.sortOrder), asc(schema.speaker.createdAt)],
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

export type SpeakerAdminItem = Awaited<
  ReturnType<typeof listSpeakersAdmin>
>[number]
export type PublicSpeaker = Awaited<
  ReturnType<typeof listPublicSpeakers>
>[number]
