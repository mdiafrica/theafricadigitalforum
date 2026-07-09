import { z } from "zod"

import { passwordField } from "@/features/password-reset/model/password-reset.schemas"

/** Mirrors the server-side username plugin validator (auth.ts). */
export const usernameField = z
  .string()
  .trim()
  .regex(
    /^[a-zA-Z](?!.*[._]{2})[a-zA-Z0-9._]{2,29}(?<![._])$/,
    "3–30 characters, starting with a letter; letters, numbers, dots and underscores only"
  )

export const newUserSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name"),
    username: usernameField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
export type NewUserInput = z.infer<typeof newUserSchema>

export const existingUserSchema = z.object({
  password: z.string().min(1, "Enter your password"),
})
export type ExistingUserInput = z.infer<typeof existingUserSchema>
