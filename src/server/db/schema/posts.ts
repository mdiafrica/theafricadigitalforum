import { relations } from "drizzle-orm"
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { user } from "./auth"
import { media } from "./media"

/**
 * Blog posts — translation-row model. The base row holds
 * locale-agnostic fields; post_translation holds one row per (post, locale)
 * with the localized text and the Plate Value body as JSONB. Status is
 * text + zod (tier-3 wire union, matching the better-auth tables) rather
 * than a pgEnum.
 */

export type PostStatus = "draft" | "published"

/**
 * JSON-safe Plate document node. Typed concretely (not `unknown`) so server
 * function return types pass TanStack Start's serializability check.
 */
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
export type PostBodyNode = { [key: string]: JsonValue }

export const post = pgTable(
  "post",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    status: text("status").$type<PostStatus>().default("draft").notNull(),
    coverMediaId: uuid("cover_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at"),
    authorId: text("author_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("post_status_published_at_idx").on(table.status, table.publishedAt),
  ]
)

export const postTranslation = pgTable(
  "post_translation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    locale: text("locale").$type<"en" | "fr">().notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").default("").notNull(),
    /** Localized category label (e.g. "Digital Policy" / "Politique numérique"). */
    category: text("category"),
    /** Plate editor Value (array of element nodes). */
    body: jsonb("body").$type<PostBodyNode[]>().default([]).notNull(),
  },
  (table) => [
    unique("post_translation_post_id_locale_uq").on(table.postId, table.locale),
    index("post_translation_post_id_idx").on(table.postId),
  ]
)

export const postRelations = relations(post, ({ one, many }) => ({
  translations: many(postTranslation),
  coverMedia: one(media, {
    fields: [post.coverMediaId],
    references: [media.id],
  }),
  author: one(user, { fields: [post.authorId], references: [user.id] }),
}))

export const postTranslationRelations = relations(
  postTranslation,
  ({ one }) => ({
    post: one(post, {
      fields: [postTranslation.postId],
      references: [post.id],
    }),
  })
)
