import { z } from "zod"

export const signInSchema = z.object({
  /** Email or username — the username plugin accepts either. */
  identifier: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
})
export type SignInInput = z.infer<typeof signInSchema>

export const defaultSignInValues: SignInInput = { identifier: "", password: "" }

export const totpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app"),
})
export type TotpInput = z.infer<typeof totpSchema>
