import { relations } from "drizzle-orm"
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

import { post } from "./posts"

/**
 * Blog categories — translation-row model like posts. The base row holds
 * the slug and pill color; category_translation holds one row per
 * (category, locale) with the localized name. Posts link many-to-many via
 * post_category; the join FK deliberately has no ON DELETE action so a
 * category referenced by posts cannot be deleted (app checks first and
 * reports the article count).
 */

export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  /** Pill/badge hex color, picked from the preset palette. */
  color: text("color").notNull().default("#7C3AED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const categoryTranslation = pgTable(
  "category_translation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    locale: text("locale").$type<"en" | "fr">().notNull(),
    name: text("name").notNull(),
  },
  (table) => [
    unique("category_translation_category_id_locale_uq").on(
      table.categoryId,
      table.locale
    ),
    index("category_translation_category_id_idx").on(table.categoryId),
  ]
)

export const postCategory = pgTable(
  "post_category",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.categoryId] }),
    index("post_category_category_id_idx").on(table.categoryId),
  ]
)

export const categoryRelations = relations(category, ({ many }) => ({
  translations: many(categoryTranslation),
  posts: many(postCategory),
}))

export const categoryTranslationRelations = relations(
  categoryTranslation,
  ({ one }) => ({
    category: one(category, {
      fields: [categoryTranslation.categoryId],
      references: [category.id],
    }),
  })
)

export const postCategoryRelations = relations(postCategory, ({ one }) => ({
  post: one(post, { fields: [postCategory.postId], references: [post.id] }),
  category: one(category, {
    fields: [postCategory.categoryId],
    references: [category.id],
  }),
}))
