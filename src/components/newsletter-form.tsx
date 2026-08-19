import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"

import { subscribeNewsletter } from "@/domains/submissions"
import { m } from "@/paraglide/messages"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const schema = z.object({
  email: z.string().min(1).email(),
})

/**
 * Newsletter subscribe row (input + button). Styling is driven by className
 * props so each surface (footer, blog, latest-articles) can match the original
 * design while sharing one TanStack Form + `subscribeNewsletter` integration.
 */
export function NewsletterForm({
  className,
  inputClassName,
  buttonClassName,
}: {
  className?: string
  inputClassName?: string
  buttonClassName?: string
}) {
  const subscribe = useMutation({
    mutationFn: (email: string) => subscribeNewsletter({ data: { email } }),
    onSuccess: () =>
      toast.success(m.home_latest_newsletter_success().replace(/^✓\s*/, ""), {
        description: m.home_latest_newsletter_message(),
      }),
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : m.home_latest_newsletter_error_generic()
      ),
  })

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value, formApi }) => {
      await subscribe
        .mutateAsync(value.email)
        .then(() => formApi.reset())
        .catch(() => {})
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
      className={cn("flex flex-wrap gap-2", className)}
    >
      <form.Field name="email">
        {(field) => (
          <Input
            type="email"
            name={field.name}
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            placeholder={m.home_latest_newsletter_placeholder()}
            aria-label={m.home_latest_newsletter_placeholder()}
            aria-invalid={field.state.meta.errors.length > 0}
            disabled={subscribe.isPending}
            className={cn("min-w-0 flex-1 basis-[180px]", inputClassName)}
          />
        )}
      </form.Field>
      <Button
        type="submit"
        disabled={subscribe.isPending}
        className={buttonClassName}
      >
        {subscribe.isPending && <Spinner data-icon="inline-start" />}
        {subscribe.isPending
          ? m.home_latest_newsletter_sending()
          : m.home_latest_newsletter_button()}
      </Button>
    </form>
  )
}
