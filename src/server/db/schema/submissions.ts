import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

/**
 * Public form submissions: contact enquiries land in an
 * admin inbox; newsletter signups build the subscriber list. Both are
 * written by anonymous visitors through validated server functions.
 */

export const contactSubmission = pgTable(
  "contact_submission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("contact_submission_created_at_idx").on(table.createdAt)]
)

export const newsletterSubscriber = pgTable("newsletter_subscriber", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
