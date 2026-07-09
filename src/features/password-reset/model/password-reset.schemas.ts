import { z } from "zod"

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
