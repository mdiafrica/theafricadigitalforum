import { z } from "zod"

import {
  COUNTRIES,
  INTERNATIONAL,
  INTEREST_AREAS,
  OTHER_PREFIX,
  PARTICIPATION_TYPES,
  PARTNERSHIP_OPTIONS,
  PASS_TIER_IDS,
  PRIMARY_GOALS,
} from "./registrations.options"

const linkedinUrl = z
  .string()
  .trim()
  .max(300)
  .refine((value) => {
    if (!value) return true
    try {
      const url = new URL(value)
      return url.protocol === "https:" || url.protocol === "http:"
    } catch {
      return false
    }
  }, "Please enter a valid URL (https://linkedin.com/in/...).")
  .default("")

export const OTHER_MESSAGE = "Please tell us what you mean by �Other�."

/** One of the listed options, or `Other: <free text>`. */
const choice = (options: ReadonlyArray<string>, message: string) =>
  z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (options.includes(value)) return
      if (value.startsWith("Other:")) {
        if (
          !value.startsWith(OTHER_PREFIX) ||
          value.length < OTHER_PREFIX.length + 2
        ) {
          ctx.addIssue({ code: "custom", message: OTHER_MESSAGE })
        } else if (value.length > OTHER_PREFIX.length + 200) {
          ctx.addIssue({ code: "custom", message: OTHER_MESSAGE })
        }
        return
      }
      ctx.addIssue({ code: "custom", message })
    })
export const registrationInput = z.object({
  locale: z.enum(["en", "fr"]).default("en"),
  title: z.string().trim().max(40).default(""),
  fullName: z
    .string()
    .trim()
    .min(1, "Please enter your full name.")
    .max(200)
    .refine(
      (value) => value.split(/\s+/).length >= 2,
      "Please enter your first and last name."
    ),
  email: z.email("A valid email address is required.").trim().toLowerCase(),
  jobTitle: z.string().trim().min(1, "Please enter your job title.").max(200),
  organization: z
    .string()
    .trim()
    .min(1, "Please enter your organization.")
    .max(200),
  country: z.enum(COUNTRIES, "Please select your country of residence."),
  linkedinUrl,
  passTier: z.enum(PASS_TIER_IDS, "Please select a pass."),
  interestAreas: z
    .array(choice(INTEREST_AREAS, "Please select at least one interest area."))
    .max(INTEREST_AREAS.length + 1),
  participationType: choice(
    PARTICIPATION_TYPES,
    "Please tell us how you wish to participate."
  ),
  primaryGoal: choice(PRIMARY_GOALS, "Please select your primary goal."),
  partnershipInterest: z.enum(
    PARTNERSHIP_OPTIONS,
    "Please select a partnership option."
  ),
  communicationsConsent: z.literal(true, "Consent is required to register."),
  termsAccepted: z.literal(true, "Please accept the terms to continue."),
  accessCode: z.string().trim().toUpperCase().max(40).optional(),
})
export type RegistrationInput = z.infer<typeof registrationInput>

export const PAYMENT_STATUSES = ["pending", "paid", "waived"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const listRegistrationsInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(100).optional(),
  passTier: z.enum(PASS_TIER_IDS).optional(),
})
export type ListRegistrationsInput = z.infer<typeof listRegistrationsInput>

export const updateRegistrationInput = registrationInput
  .omit({
    communicationsConsent: true,
    termsAccepted: true,
    accessCode: true,
    locale: true,
  })
  .extend({
    id: z.uuid(),
    // Earlier registrations may have "International" as their country.
    country: z.enum(COUNTRIES).or(z.literal(INTERNATIONAL)),
  })
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationInput>

export const registrationIdInput = z.object({ id: z.uuid() })

export const updatePaymentStatusInput = z.object({
  id: z.uuid(),
  paymentStatus: z.enum(PAYMENT_STATUSES),
})

export const validateCodeInput = z.object({
  code: z.string().trim().toUpperCase().min(1).max(40),
})

export const createCodeInput = z.object({
  label: z.string().trim().min(1, "Please enter a label.").max(120),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{6,40}$/, "Use 6-40 letters, digits or dashes.")
    .optional(),
  passTier: z.enum(PASS_TIER_IDS).optional(),
  maxUses: z.number().int().min(1).max(100000).optional(),
  expiresAt: z.coerce.date().optional(),
})
export type CreateCodeInput = z.infer<typeof createCodeInput>

export const updateCodeInput = z.object({
  id: z.uuid(),
  expiresAt: z.coerce.date().nullable(),
  maxUses: z.number().int().min(1).max(100000).nullable(),
})

export const setCodeActiveInput = z.object({
  id: z.uuid(),
  active: z.boolean(),
})
