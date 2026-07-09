import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { passwordConfirmSchema } from "../model/account.schemas"

/**
 * Dialog-body form that asks for the current password before a sensitive
 * action. Owns the password/error state and validation; callers supply the
 * copy and the confirmed-password handler.
 */
export function PasswordConfirmForm({
  id,
  title,
  description,
  submitLabel,
  submitVariant = "default",
  autoFocus = false,
  isPending,
  onConfirm,
}: {
  id: string
  title: string
  description: string
  submitLabel: string
  submitVariant?: React.ComponentProps<typeof Button>["variant"]
  autoFocus?: boolean
  isPending: boolean
  onConfirm: (password: string) => void
}) {
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = passwordConfirmSchema.safeParse({ password })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid password.")
      return
    }
    setError("")
    onConfirm(password)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <Field data-invalid={!!error}>
        <FieldLabel htmlFor={id}>Password</FieldLabel>
        <Input
          id={id}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isPending}
          autoComplete="current-password"
          autoFocus={autoFocus}
          required
        />
        {error && <FieldError errors={[{ message: error }]} />}
      </Field>

      <DialogFooter>
        <Button
          type="submit"
          variant={submitVariant}
          disabled={isPending || !password}
        >
          {isPending && <Spinner />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}
