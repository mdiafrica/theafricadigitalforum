import { z } from "zod"

export const passwordConfirmSchema = z.object({
  password: z.string().min(1, "Enter your password"),
})
export type PasswordConfirmInput = z.infer<typeof passwordConfirmSchema>

export const totpCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app"),
})
export type TotpCodeInput = z.infer<typeof totpCodeSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(12, "Use at least 12 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const defaultChangePasswordValues: ChangePasswordInput = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}
