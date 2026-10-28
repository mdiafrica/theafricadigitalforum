import * as React from "react"
import { CopyIcon, KeyRoundIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  PASS_TIERS,
  useCreateRegistrationCodeMutation,
  useDeleteRegistrationCodeMutation,
  useRegistrationCodesQuery,
  useSetRegistrationCodeActiveMutation,
  useUpdateRegistrationCodeMutation,
  type RegistrationCodeItem,
} from "@/domains/registrations"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { PageHeader } from "@/components/admin/page-header"
import {
  EmptyState,
  ListSkeleton,
  QueryError,
} from "@/components/admin/query-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const selectClass =
  "h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const tierName = (id: string | null) =>
  id
    ? (PASS_TIERS.find((tier) => tier.id === id)?.name ?? id)
    : "Attendee picks"

function codeStatus(item: RegistrationCodeItem) {
  if (!item.active) return "Inactive"
  if (item.expiresAt && new Date(item.expiresAt) < new Date()) return "Expired"
  if (item.maxUses !== null && item.usedCount >= item.maxUses) return "Used up"
  return "Active"
}

export function RegistrationCodesView() {
  const query = useRegistrationCodesQuery()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Access codes"
        description="Codes that waive payment at registration, for the ADF team, support staff, or organizations that paid for their members."
      />
      <CreateCodeForm />
      {query.isPending ? (
        <ListSkeleton rows={3} className="[&>*]:h-14" />
      ) : query.isError ? (
        <QueryError
          title="Couldn't load codes"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : query.data.length === 0 ? (
        <EmptyState icon={KeyRoundIcon}>No access codes yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">Code</th>
                <th className="px-4 py-2.5 font-medium">Label</th>
                <th className="px-4 py-2.5 font-medium">Pass</th>
                <th className="px-4 py-2.5 font-medium">Used</th>
                <th className="px-4 py-2.5 font-medium">Expires</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((item) => (
                <CodeRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CreateCodeForm() {
  const create = useCreateRegistrationCodeMutation()
  const [label, setLabel] = React.useState("")
  const [code, setCode] = React.useState("")
  const [passTier, setPassTier] = React.useState("")
  const [maxUses, setMaxUses] = React.useState("")
  const [expiresAt, setExpiresAt] = React.useState("")

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    create.mutate(
      {
        data: {
          label,
          code: code.trim() ? code.trim().toUpperCase() : undefined,
          passTier: (passTier || undefined) as never,
          maxUses: maxUses ? Number(maxUses) : undefined,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        },
      },
      {
        onSuccess: (row) => {
          toast.success(`Code ${row.code} created`)
          setLabel("")
          setCode("")
          setPassTier("")
          setMaxUses("")
          setExpiresAt("")
        },
        onError: (error) => toast.error(error.message || "Could not create"),
      }
    )
  }

  return (
    <form
      onSubmit={submit}
      className="grid items-end gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <label className="space-y-1 text-xs font-medium lg:col-span-2">
        Label
        <Input
          required
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="e.g. Acme Corp (10 seats)"
        />
      </label>
      <label className="space-y-1 text-xs font-medium">
        Custom code (optional)
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Auto-generated"
        />
      </label>
      <label className="space-y-1 text-xs font-medium">
        Locked pass
        <select
          className={`${selectClass} w-full`}
          value={passTier}
          onChange={(event) => setPassTier(event.target.value)}
        >
          <option value="">Attendee picks</option>
          {PASS_TIERS.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-medium">
        Max uses
        <Input
          type="number"
          min={1}
          value={maxUses}
          onChange={(event) => setMaxUses(event.target.value)}
          placeholder="Unlimited"
        />
      </label>
      <label className="space-y-1 text-xs font-medium">
        Expires
        <Input
          type="date"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
        />
      </label>
      <Button
        type="submit"
        disabled={create.isPending}
        className="lg:col-start-6"
      >
        {create.isPending && <Spinner />}
        Create code
      </Button>
    </form>
  )
}

const toDateInput = (value: Date | string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : ""

function EditCodeDialog({ item }: { item: RegistrationCodeItem }) {
  const update = useUpdateRegistrationCodeMutation()
  const [open, setOpen] = React.useState(false)
  const [expiresAt, setExpiresAt] = React.useState("")
  const [maxUses, setMaxUses] = React.useState("")

  const onOpenChange = (next: boolean) => {
    if (next) {
      setExpiresAt(toDateInput(item.expiresAt))
      setMaxUses(item.maxUses === null ? "" : String(item.maxUses))
    }
    setOpen(next)
  }

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    update.mutate(
      {
        data: {
          id: item.id,
          // End of the chosen day so the code works through that date.
          expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`) : null,
          maxUses: maxUses ? Number(maxUses) : null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Code updated")
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
          <Button variant="ghost" size="icon-sm" aria-label="Edit code">
            <PencilIcon />
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={save} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit {item.code}</DialogTitle>
          </DialogHeader>
          <label className="block space-y-1 text-xs font-medium">
            Expires (leave empty for no expiry)
            <Input
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </label>
          <label className="block space-y-1 text-xs font-medium">
            Max uses (leave empty for unlimited)
            <Input
              type="number"
              min={Math.max(1, item.usedCount)}
              value={maxUses}
              onChange={(event) => setMaxUses(event.target.value)}
            />
          </label>
          <DialogFooter>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Spinner />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CodeRow({ item }: { item: RegistrationCodeItem }) {
  const toggle = useSetRegistrationCodeActiveMutation()
  const remove = useDeleteRegistrationCodeMutation()
  const status = codeStatus(item)

  const copy = async () => {
    await navigator.clipboard.writeText(item.code)
    toast.success("Code copied")
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
      <td className="px-4 py-3">{item.label}</td>
      <td className="px-4 py-3">{tierName(item.passTier)}</td>
      <td className="px-4 py-3">
        {item.usedCount}
        {item.maxUses !== null ? ` / ${item.maxUses}` : ""}
      </td>
      <td className="px-4 py-3">
        {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "—"}
      </td>
      <td className="px-4 py-3">
        <Badge variant={status === "Active" ? "default" : "secondary"}>
          {status}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copy code"
            onClick={copy}
          >
            <CopyIcon />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={toggle.isPending}
            onClick={() =>
              toggle.mutate({ data: { id: item.id, active: !item.active } })
            }
          >
            {item.active ? "Deactivate" : "Activate"}
          </Button>
          <EditCodeDialog item={item} />
          <ConfirmDialog
            title="Delete this code?"
            description="People who already registered with it keep their waived status."
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
                aria-label="Delete code"
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
