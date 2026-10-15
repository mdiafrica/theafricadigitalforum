import { z } from "zod"

import {
  COUNTRIES,
  INTEREST_AREAS,
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

export const registrationInput = z.object({
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
  interestAreas: z.array(z.enum(INTEREST_AREAS)).max(INTEREST_AREAS.length),
  participationType: z.enum(
    PARTICIPATION_TYPES,
    "Please tell us how you wish to participate."
  ),
  primaryGoal: z.enum(PRIMARY_GOALS, "Please select your primary goal."),
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
  .omit({ communicationsConsent: true, termsAccepted: true, accessCode: true })
  .extend({ id: z.uuid() })
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
