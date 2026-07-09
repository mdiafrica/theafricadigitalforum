import { useState } from "react"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useInviteMemberForm } from "../hooks/use-invite-member-form"
import { INVITABLE_ROLE_OPTIONS } from "../model/team.schemas"

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false)
  const { form, isSubmitting } = useInviteMemberForm({
    onSuccess: () => setOpen(false),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlus data-icon="inline-start" />
        Invite member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            They&apos;ll receive an email link to create their account.
            Invitations expire after 7 days.
          </DialogDescription>
        </DialogHeader>
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
                    autoFocus
                    placeholder="colleague@example.org"
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
            <form.Field name="role">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Role</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {INVITABLE_ROLE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={
                          field.state.value === option.value
                            ? "default"
                            : "outline"
                        }
                        onClick={() => field.handleChange(option.value)}
                        disabled={isSubmitting}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Admins publish content and manage the team. Secretaries
                    draft and edit content.
                  </p>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Spinner />}
              Send invitation
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
