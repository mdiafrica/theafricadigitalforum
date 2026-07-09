import { relations } from "drizzle-orm"
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { media } from "./media"
import type { JsonValue } from "./posts"

/**
 * Content collections: speakers, sponsors, events follow the
 * posts translation-row pattern; page_content holds per-(page, section,
 * locale) JSONB singletons for copy that used to live in src/i18n.
 */

export const speaker = pgTable(
  "speaker",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    photoMediaId: uuid("photo_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    twitterUrl: text("twitter_url"),
    linkedinUrl: text("linkedin_url"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("speaker_sort_order_idx").on(table.sortOrder)]
)

export const speakerTranslation = pgTable(
  "speaker_translation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    speakerId: uuid("speaker_id")
      .notNull()
      .references(() => speaker.id, { onDelete: "cascade" }),
    locale: text("locale").$type<"en" | "fr">().notNull(),
    /** Honorifics localize (H.E. / S.E.), so the name is per-locale. */
    name: text("name").notNull(),
    role: text("role").default("").notNull(),
  },
  (table) => [
    unique("speaker_translation_speaker_id_locale_uq").on(
      table.speakerId,
      table.locale
    ),
    index("speaker_translation_speaker_id_idx").on(table.speakerId),
  ]
)

export const sponsor = pgTable(
  "sponsor",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Brand names don't localize — no translation table. */
    name: text("name").notNull(),
    logoMediaId: uuid("logo_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    websiteUrl: text("website_url"),
    tier: text("tier"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("sponsor_sort_order_idx").on(table.sortOrder)]
)

export const event = pgTable(
  "event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("event_sort_order_idx").on(table.sortOrder)]
)

export const eventTranslation = pgTable(
  "event_translation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    locale: text("locale").$type<"en" | "fr">().notNull(),
    title: text("title").notNull(),
    description: text("description").default("").notNull(),
    location: text("location").default("").notNull(),
  },
  (table) => [
    unique("event_translation_event_id_locale_uq").on(
      table.eventId,
      table.locale
    ),
    index("event_translation_event_id_idx").on(table.eventId),
  ]
)

export const pageContent = pgTable(
  "page_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** e.g. "home", "about", "why-adf", "host-city", "contact", "footer". */
    page: text("page").notNull(),
    /** e.g. "hero", "stats", "dialogues". */
    section: text("section").notNull(),
    locale: text("locale").$type<"en" | "fr">().notNull(),
    data: jsonb("data").$type<Record<string, JsonValue>>().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("page_content_page_section_locale_uq").on(
      table.page,
      table.section,
      table.locale
    ),
  ]
)

export const speakerRelations = relations(speaker, ({ one, many }) => ({
  translations: many(speakerTranslation),
  photoMedia: one(media, {
    fields: [speaker.photoMediaId],
    references: [media.id],
  }),
}))

export const speakerTranslationRelations = relations(
  speakerTranslation,
  ({ one }) => ({
    speaker: one(speaker, {
      fields: [speakerTranslation.speakerId],
      references: [speaker.id],
    }),
  })
)

export const sponsorRelations = relations(sponsor, ({ one }) => ({
  logoMedia: one(media, {
    fields: [sponsor.logoMediaId],
    references: [media.id],
  }),
}))

export const eventRelations = relations(event, ({ many }) => ({
  translations: many(eventTranslation),
}))

export const eventTranslationRelations = relations(
  eventTranslation,
  ({ one }) => ({
    event: one(event, {
      fields: [eventTranslation.eventId],
      references: [event.id],
    }),
  })
)
