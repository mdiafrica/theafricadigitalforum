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
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth/auth-client"
import { useAcceptInvitationFlow } from "../hooks/use-accept-invitation-flow"

export function AcceptInvitationView({
  invitationId,
}: {
  invitationId: string
}) {
  const flow = useAcceptInvitationFlow(invitationId)

  if (flow.step === "loading") {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (flow.step === "invalid") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitation unavailable</CardTitle>
          <CardDescription>
            This invitation is invalid, expired, or was already used. Ask an
            administrator to send you a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" render={<Link to="/" />}>
            Back to the site
          </Button>
        </CardContent>
      </Card>
    )
  }

  const preview = flow.preview!

  if (flow.step === "mismatch") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Signed in as someone else</CardTitle>
          <CardDescription>
            This invitation is for <strong>{preview.email}</strong>, but
            you&apos;re signed in as <strong>{flow.session?.user.email}</strong>
            . Sign out first, then open the invite link again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              void authClient.signOut().then(() => window.location.reload())
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (flow.step === "authed-confirm") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join the team</CardTitle>
          <CardDescription>
            {preview.inviterName} invited you to join the Africa Digital Forum
            team as <strong>{preview.role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            disabled={flow.isSubmitting}
            onClick={() => flow.acceptMutation.mutate()}
          >
            {flow.isSubmitting && <Spinner />}
            Accept invitation
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (flow.step === "existing-user") {
    const form = flow.existingUserForm
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            {preview.inviterName} invited <strong>{preview.email}</strong> to
            join as <strong>{preview.role}</strong>. Sign in to accept.
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
              <form.Field name="password">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="current-password"
                      autoFocus
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={field.state.meta.errors.length > 0}
                      disabled={flow.isSubmitting}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <Button
                type="submit"
                disabled={flow.isSubmitting}
                className="w-full"
              >
                {flow.isSubmitting && <Spinner />}
                Sign in &amp; accept
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    )
  }

  // new-user
  const form = flow.newUserForm
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          {preview.inviterName} invited <strong>{preview.email}</strong> to join
          the Africa Digital Forum team as <strong>{preview.role}</strong>.
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
            <form.Field name="name">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    autoComplete="name"
                    autoFocus
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0}
                    disabled={flow.isSubmitting}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
            <form.Field name="username">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    autoComplete="username"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0}
                    disabled={flow.isSubmitting}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0}
                    disabled={flow.isSubmitting}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
            <form.Field name="confirmPassword">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0}
                    disabled={flow.isSubmitting}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
            <Button
              type="submit"
              disabled={flow.isSubmitting}
              className="w-full"
            >
              {flow.isSubmitting && <Spinner />}
              Create account &amp; join
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
