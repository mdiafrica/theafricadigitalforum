import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useForgotPasswordForm } from "../hooks/use-password-reset-forms"

export function ForgotPasswordForm() {
  const { form, sent, isSubmitting } = useForgotPasswordForm()

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists for that address, we&apos;ve sent a link to
            reset its password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            render={<Link to="/sign-in" />}
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0}
                    disabled={isSubmitting}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Spinner />}
              Send reset link
            </Button>
            <Link
              to="/sign-in"
              className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Back to sign in
            </Link>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
