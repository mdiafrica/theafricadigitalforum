import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

/**
 * Forum registrations submitted from the public /register page.
 * Payment is not processed online yet, so every row starts as "pending".
 */
export const registration = pgTable(
  "registration",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(),
    title: text("title").notNull().default(""),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    jobTitle: text("job_title").notNull(),
    organization: text("organization").notNull(),
    country: text("country").notNull(),
    nationality: text("nationality").notNull().default(""),
    referral: text("referral").notNull().default(""),
    linkedinUrl: text("linkedin_url"),
    passTier: text("pass_tier").notNull(),
    paymentStatus: text("payment_status").notNull().default("pending"),
    interestAreas: text("interest_areas").array().notNull().default([]),
    participationType: text("participation_type").notNull(),
    primaryGoal: text("primary_goal").notNull(),
    partnershipInterest: text("partnership_interest").notNull(),
    communicationsConsent: boolean("communications_consent").notNull(),
    termsAccepted: boolean("terms_accepted").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    accessCode: text("access_code"),
    checkedInAt: timestamp("checked_in_at"),
  },
  (table) => [
    index("registration_created_at_idx").on(table.createdAt),
    index("registration_email_idx").on(table.email),
  ]
)

/** Admin-managed answers to "Who referred you?" on the registration form. */
export const referralOption = pgTable("referral_option", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/**
 * Access codes that waive payment (staff, partners, organizations that paid
 * for their members). A code may lock a pass tier and be capped by uses/expiry.
 */
export const registrationCode = pgTable(
  "registration_code",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    label: text("label").notNull(),
    passTier: text("pass_tier"),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    expiresAt: timestamp("expires_at"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("registration_code_created_at_idx").on(table.createdAt)]
)
