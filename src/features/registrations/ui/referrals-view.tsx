import * as React from "react"
import { PencilIcon, Trash2Icon, UserRoundPlusIcon } from "lucide-react"
import { toast } from "sonner"

import {
  useDeleteReferralOptionMutation,
  useReferralOptionsAdminQuery,
  useSaveReferralOptionMutation,
  type ReferralOptionItem,
} from "@/domains/registrations"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { PageHeader } from "@/components/admin/page-header"
import {
  EmptyState,
  ListSkeleton,
  QueryError,
} from "@/components/admin/query-states"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function ReferralsView() {
  const query = useReferralOptionsAdminQuery()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Referrals"
        description="The choices shown in the required “Who referred you?” field on the registration form."
      />
      <AddReferralForm />
      {query.isPending ? (
        <ListSkeleton rows={3} className="[&>*]:h-12" />
      ) : query.isError ? (
        <QueryError
          title="Couldn't load referrals"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : query.data.length === 0 ? (
        <EmptyState icon={UserRoundPlusIcon}>
          No referral options yet. The registration form needs at least one.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Registrations</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((item) => (
                <ReferralRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AddReferralForm() {
  const save = useSaveReferralOptionMutation()
  const [name, setName] = React.useState("")

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    save.mutate(
      { data: { name } },
      {
        onSuccess: () => {
          toast.success("Referral added")
          setName("")
        },
        onError: (error) => toast.error(error.message || "Could not add"),
      }
    )
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-3 rounded-xl border border-border bg-card p-4"
    >
      <label className="flex-1 space-y-1 text-xs font-medium">
        New referral
        <Input
          required
          maxLength={200}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Partner or person name"
        />
      </label>
      <Button type="submit" disabled={save.isPending}>
        {save.isPending && <Spinner />}
        Add
      </Button>
    </form>
  )
}

function ReferralRow({ item }: { item: ReferralOptionItem }) {
  const remove = useDeleteReferralOptionMutation()

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium">{item.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{item.used}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          <EditReferralDialog item={item} />
          <ConfirmDialog
            title="Delete this referral?"
            description="Past registrations keep what they selected. It will no longer be offered on the form."
            confirmLabel="Delete"
            onConfirm={() =>
              remove.mutate(
                { data: { id: item.id } },
                { onError: (error) => toast.error(error.message) }
              )
            }
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete referral"
                className="text-destructive"
              >
                <Trash2Icon />
              </Button>
            }
          />
        </div>
      </td>
    </tr>
  )
}

function EditReferralDialog({ item }: { item: ReferralOptionItem }) {
  const save = useSaveReferralOptionMutation()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(item.name)

  const onOpenChange = (next: boolean) => {
    if (next) setName(item.name)
    setOpen(next)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    save.mutate(
      { data: { id: item.id, name } },
      {
        onSuccess: () => {
          toast.success("Referral updated")
          setOpen(false)
        },
        onError: (error) => toast.error(error.message || "Could not update"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Edit referral">
            <PencilIcon />
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit referral</DialogTitle>
          </DialogHeader>
          <Input
            required
            maxLength={200}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <DialogFooter>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Spinner />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
