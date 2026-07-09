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
import {
  eventIdInput,
  listPublicEventsInput,
  saveEventInput,
  type EventTranslationsInput,
} from "./events.schemas"

async function upsertTranslations(
  eventId: string,
  translations: EventTranslationsInput,
  tx: DbExecutor
) {
  const values = (input: EventTranslationsInput["en"]) => ({
    title: input.title,
    description: input.description,
    location: input.location,
  })

  await upsertTranslationRows({
    tx,
    table: schema.eventTranslation,
    parentKey: "eventId",
    parentColumn: schema.eventTranslation.eventId,
    localeColumn: schema.eventTranslation.locale,
    parentId: eventId,
    en: values(translations.en),
    fr: translations.fr?.title.trim() ? values(translations.fr) : undefined,
  })
}

export const saveEvent = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ event: ["update"] })])
  .validator(saveEventInput)
  .handler(async ({ data, context }) => {
    if (!data.id) assertOrgPermission(context.auth, { event: ["create"] })

    const values = {
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      sortOrder: data.sortOrder,
    }

    return db.transaction(async (tx) => {
      let id = data.id
      if (id) {
        const [row] = await tx
          .update(schema.event)
          .set(values)
          .where(eq(schema.event.id, id))
          .returning({ id: schema.event.id })
        if (!row) throw new Error("Event not found")
      } else {
        const [row] = await tx
          .insert(schema.event)
          .values(values)
          .returning({ id: schema.event.id })
        id = row.id
      }

      await upsertTranslations(id, data.translations, tx)
      return { id }
    })
  })

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ event: ["delete"] })])
  .validator(eventIdInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .delete(schema.event)
      .where(eq(schema.event.id, data.id))
      .returning({ id: schema.event.id })
    if (!row) throw new Error("Event not found")
    return { id: row.id }
  })

export const listEventsAdmin = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ event: ["read"] })])
  .handler(async () => {
    const rows = await db.query.event.findMany({
      with: { translations: true },
      orderBy: [asc(schema.event.sortOrder), asc(schema.event.startsAt)],
    })

    return rows.map((row) => ({
      id: row.id,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      sortOrder: row.sortOrder,
      translations: indexByLocale(row.translations, (t) => ({
        title: t.title,
        description: t.description,
        location: t.location,
      })),
    }))
  })

export const listPublicEvents = createServerFn({ method: "GET" })
  .validator(listPublicEventsInput)
  .handler(async ({ data }) => {
    const rows = await db.query.event.findMany({
      with: { translations: true },
      orderBy: [asc(schema.event.sortOrder), asc(schema.event.startsAt)],
    })

    return rows
      .map((row) => {
        const translation = pickTranslation(row.translations, data.locale)
        if (!translation) return null
        return {
          id: row.id,
          title: translation.title,
          description: translation.description,
          location: translation.location,
          startsAt: row.startsAt,
          endsAt: row.endsAt,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  })

export type EventAdminItem = Awaited<ReturnType<typeof listEventsAdmin>>[number]
