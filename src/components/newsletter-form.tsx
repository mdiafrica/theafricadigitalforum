import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"

import { subscribeNewsletter } from "@/domains/submissions"
import { useI18n } from "@/i18n/context"
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
  const { t } = useI18n()
  const copy = t.home.latest.newsletter

  const subscribe = useMutation({
    mutationFn: (email: string) => subscribeNewsletter({ data: { email } }),
    onSuccess: () =>
      toast.success(copy.success.replace(/^✓\s*/, ""), {
        description: copy.message,
      }),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : copy.errorGeneric),
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
      className={cn("flex gap-2", className)}
    >
      <form.Field name="email">
        {(field) => (
          <Input
            type="email"
            name={field.name}
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            placeholder={copy.placeholder}
            aria-label={copy.placeholder}
            aria-invalid={field.state.meta.errors.length > 0}
            disabled={subscribe.isPending}
            className={cn("flex-1", inputClassName)}
          />
        )}
      </form.Field>
      <Button
        type="submit"
        disabled={subscribe.isPending}
        className={buttonClassName}
      >
        {subscribe.isPending && <Spinner data-icon="inline-start" />}
        {subscribe.isPending ? copy.sending : copy.button}
      </Button>
    </form>
  )
}
