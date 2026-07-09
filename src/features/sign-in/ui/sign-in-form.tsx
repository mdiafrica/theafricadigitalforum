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
import { useSignInForm } from "../hooks/use-sign-in-form"

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const { step, form, totpForm, isSubmitting } = useSignInForm({ redirectTo })

  if (step === "totp") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void totpForm.handleSubmit()
            }}
          >
            <FieldGroup>
              <totpForm.Field name="code">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Code</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      autoFocus
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={field.state.meta.errors.length > 0}
                      disabled={isSubmitting}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </totpForm.Field>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Spinner />}
                Verify
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Team access to the Africa Digital Forum admin.
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
            <form.Field name="identifier">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>
                    Email or username
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    autoComplete="username"
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
            <form.Field name="password">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
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
              Sign in
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
