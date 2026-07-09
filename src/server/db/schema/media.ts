import { relations } from "drizzle-orm"
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { user } from "./auth"

/** One pre-generated WebP rendition of an upload. */
export interface MediaVariant {
  /** Rendition width in px (also the variant label: 320/640/1024/1600). */
  width: number
  height: number
  /** Object key in the public bucket. */
  key: string
  /** Bytes. */
  size: number
}

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Original object's key in the public bucket. */
    storageKey: text("storage_key").notNull().unique(),
    mimeType: text("mime_type").notNull(),
    /** Original file size in bytes. */
    size: integer("size").notNull(),
    /** Intrinsic dimensions (null for non-image uploads). */
    width: integer("width"),
    height: integer("height"),
    /** Compact placeholder for blur-up rendering (null for non-images). */
    blurhash: text("blurhash"),
    variants: jsonb("variants").$type<MediaVariant[]>().default([]).notNull(),
    /** Default alt text; per-usage bilingual alt lives on the content link. */
    alt: text("alt"),
    uploadedBy: text("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("media_created_at_idx").on(table.createdAt)]
)

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(user, { fields: [media.uploadedBy], references: [user.id] }),
}))
