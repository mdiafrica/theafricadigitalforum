import * as React from "react"
import {
  DownloadIcon,
  EyeIcon,
  PencilIcon,
  SearchIcon,
  TicketIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import {
  COUNTRIES,
  INTEREST_AREAS,
  PARTICIPATION_TYPES,
  PARTNERSHIP_OPTIONS,
  PASS_TIERS,
  PAYMENT_STATUSES,
  PRIMARY_GOALS,
  updateRegistrationInput,
  useDeleteRegistrationMutation,
  useExportRegistrationsMutation,
  useRegistrationsQuery,
  useUpdateRegistrationMutation,
  useUpdateRegistrationPaymentMutation,
  type PaymentStatus,
  type PassTierId,
  type RegistrationItem,
} from "@/domains/registrations"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import {
  EmptyState,
  ListSkeleton,
  QueryError,
} from "@/components/admin/query-states"
import { Badge } from "@/components/ui/badge"
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

const tierName = (id: string) =>
  PASS_TIERS.find((tier) => tier.id === id)?.name ?? id

const selectClass =
  "h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  )
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function RegistrationsView() {
  const [page, setPage] = React.useState(1)
  const [searchInput, setSearchInput] = React.useState("")
  const [passTier, setPassTier] = React.useState<PassTierId | "">("")
  const search = useDebounced(searchInput.trim())

  const filters = {
    search: search || undefined,
    passTier: passTier || undefined,
  }
  const query = useRegistrationsQuery({ page, ...filters })
  const exportMutation = useExportRegistrationsMutation()

  React.useEffect(() => setPage(1), [search, passTier])

  const handleExport = () =>
    exportMutation.mutate(filters, {
      onSuccess: ({ filename, csv }) => downloadCsv(filename, csv),
      onError: (error) => toast.error(error.message || "Export failed"),
    })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Registrations"
        description="Forum registrations submitted from the public /register page."
      >
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          <DownloadIcon />
          Export CSV
        </Button>
      </PageHeader>

      {query.data ? (
        <div
          role="tablist"
          aria-label="Filter by pass"
          className="flex flex-wrap gap-1 border-b border-border"
        >
          {[
            {
              id: "" as const,
              name: "All",
              count: query.data.tierCounts.reduce((sum, c) => sum + c.count, 0),
            },
            ...PASS_TIERS.map((tier) => ({
              id: tier.id as PassTierId,
              name: tier.name,
              count:
                query.data.tierCounts.find((c) => c.passTier === tier.id)
                  ?.count ?? 0,
            })),
          ].map((tab) => (
            <button
              key={tab.id || "all"}
              type="button"
              role="tab"
              aria-selected={passTier === tab.id}
              onClick={() => setPassTier(tab.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                passTier === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.name}: {tab.count}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name, email, organization, reference"
            className="pl-8"
          />
        </div>
      </div>

      <RegistrationsList query={query} page={page} onPageChange={setPage} />
    </div>
  )
}

function RegistrationsList({
  query,
  page,
  onPageChange,
}: {
  query: ReturnType<typeof useRegistrationsQuery>
  page: number
  onPageChange: (page: number) => void
}) {
  if (query.isPending) return <ListSkeleton rows={4} className="[&>*]:h-14" />
  if (query.isError) {
    return (
      <QueryError
        title="Couldn't load registrations"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const { items, total, pageSize } = query.data
  if (items.length === 0) {
    return <EmptyState icon={TicketIcon}>No registrations found.</EmptyState>
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">Attendee</th>
              <th className="px-4 py-2.5 font-medium">Organization</th>
              <th className="px-4 py-2.5 font-medium">Pass</th>
              <th className="px-4 py-2.5 font-medium">Payment</th>
              <th className="px-4 py-2.5 font-medium">Registered</th>
              <th className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <RegistrationRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} {total === 1 ? "registration" : "registrations"}
        </span>
      </div>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </div>
  )
}

function RegistrationRow({ item }: { item: RegistrationItem }) {
  const mutation = useUpdateRegistrationPaymentMutation()
  const deleteMutation = useDeleteRegistrationMutation()

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3">
        <span className="block font-semibold">
          {[item.title, item.fullName].filter(Boolean).join(" ")}
        </span>
        <span className="block text-xs text-muted-foreground">
          {item.email}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="block">{item.organization}</span>
        <span className="block text-xs text-muted-foreground">
          {item.country}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{tierName(item.passTier)}</td>
      <td className="px-4 py-3">
        <select
          aria-label={`Payment status for ${item.fullName}`}
          className={selectClass}
          value={item.paymentStatus}
          disabled={mutation.isPending}
          onChange={(event) =>
            mutation.mutate(
              {
                data: {
                  id: item.id,
                  paymentStatus: event.target.value as PaymentStatus,
                },
              },
              {
                onSuccess: () => toast.success("Payment status updated"),
                onError: (error) =>
                  toast.error(error.message || "Couldn't update status"),
              }
            )
          }
        >
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
        {new Date(item.createdAt).toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="View registration"
                />
              }
            >
              <EyeIcon />
            </DialogTrigger>
            <RegistrationDetail item={item} />
          </Dialog>
          <EditRegistrationDialog item={item} />
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete registration"
                className="text-destructive"
              >
                <Trash2Icon />
              </Button>
            }
            title="Delete this registration?"
            description={`The registration from ${item.fullName} (${item.reference}) will be permanently removed.`}
            onConfirm={() =>
              deleteMutation.mutate(
                { data: { id: item.id } },
                {
                  onSuccess: () => toast.success("Registration deleted."),
                  onError: () =>
                    toast.error("Couldn't delete the registration."),
                }
              )
            }
          />
        </div>
      </td>
    </tr>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-destructive">{error}</span>
      ) : null}
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <Field label={label} error={error}>
      <select
        className={`${selectClass} w-full`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}

function EditRegistrationDialog({ item }: { item: RegistrationItem }) {
  const [open, setOpen] = React.useState(false)
  const mutation = useUpdateRegistrationMutation()
  const initial = React.useMemo(
    () => ({
      title: item.title,
      fullName: item.fullName,
      email: item.email,
      jobTitle: item.jobTitle,
      organization: item.organization,
      country: item.country,
      linkedinUrl: item.linkedinUrl ?? "",
      referral: item.referral,
      passTier: item.passTier,
      interestAreas: item.interestAreas,
      participationType: item.participationType,
      primaryGoal: item.primaryGoal,
      partnershipInterest: item.partnershipInterest,
    }),
    [item]
  )
  const [form, setForm] = React.useState(initial)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setForm(initial)
      setErrors({})
    }
    setOpen(next)
  }

  const set = <K extends keyof typeof initial>(
    key: K,
    value: (typeof initial)[K]
  ) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = updateRegistrationInput.safeParse({ ...form, id: item.id })
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0])
        next[key] ??= issue.message
      }
      setErrors(next)
      return
    }
    setErrors({})
    mutation.mutate(
      { data: parsed.data },
      {
        onSuccess: () => {
          toast.success("Registration updated.")
          setOpen(false)
        },
        onError: (error) =>
          toast.error(error.message || "Couldn't update the registration."),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Edit registration" />
        }
      >
        <PencilIcon />
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit registration</DialogTitle>
          <p className="text-sm text-muted-foreground">{item.reference}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title" error={errors.title}>
              <Input
                value={form.title}
                maxLength={40}
                onChange={(event) => set("title", event.target.value)}
              />
            </Field>
            <Field label="Full name" error={errors.fullName}>
              <Input
                value={form.fullName}
                onChange={(event) => set("fullName", event.target.value)}
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
              />
            </Field>
            <Field label="Job title" error={errors.jobTitle}>
              <Input
                value={form.jobTitle}
                onChange={(event) => set("jobTitle", event.target.value)}
              />
            </Field>
            <Field label="Organization" error={errors.organization}>
              <Input
                value={form.organization}
                onChange={(event) => set("organization", event.target.value)}
              />
            </Field>
            <SelectField
              label="Country of residence"
              value={form.country}
              options={COUNTRIES}
              error={errors.country}
              onChange={(value) => set("country", value)}
            />
            <Field label="Referred by" error={errors.referral}>
              <Input
                value={form.referral}
                onChange={(event) => set("referral", event.target.value)}
              />
            </Field>
            <Field label="LinkedIn" error={errors.linkedinUrl}>
              <Input
                value={form.linkedinUrl}
                onChange={(event) => set("linkedinUrl", event.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </Field>
            <Field label="Pass" error={errors.passTier}>
              <select
                className={`${selectClass} w-full`}
                value={form.passTier}
                onChange={(event) => set("passTier", event.target.value)}
              >
                {PASS_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name}
                  </option>
                ))}
              </select>
            </Field>
            <SelectField
              label="Participation"
              value={form.participationType}
              options={PARTICIPATION_TYPES}
              error={errors.participationType}
              onChange={(value) => set("participationType", value)}
            />
            <SelectField
              label="Primary goal"
              value={form.primaryGoal}
              options={PRIMARY_GOALS}
              error={errors.primaryGoal}
              onChange={(value) => set("primaryGoal", value)}
            />
            <SelectField
              label="Partnership interest"
              value={form.partnershipInterest}
              options={PARTNERSHIP_OPTIONS}
              error={errors.partnershipInterest}
              onChange={(value) => set("partnershipInterest", value)}
            />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm text-muted-foreground">
              Interest areas
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {INTEREST_AREAS.map((area) => (
                <label key={area} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.interestAreas.includes(area)}
                    onChange={(event) =>
                      set(
                        "interestAreas",
                        event.target.checked
                          ? [...form.interestAreas, area]
                          : form.interestAreas.filter((value) => value !== area)
                      )
                    }
                  />
                  {area}
                </label>
              ))}
            </div>
          </fieldset>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RegistrationDetail({ item }: { item: RegistrationItem }) {
  const fields: Array<[string, React.ReactNode]> = [
    ["Reference", item.reference],
    ["Job title", item.jobTitle],
    ["Organization", item.organization],
    ["Country of residence", item.country],
    [
      "LinkedIn",
      item.linkedinUrl ? (
        <a
          href={item.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          {item.linkedinUrl}
        </a>
      ) : (
        "—"
      ),
    ],
    ["Pass", tierName(item.passTier)],
    ["Referred by", item.referral || "—"],
    ["Interest areas", item.interestAreas.join(", ") || "—"],
    ["Participation", item.participationType],
    ["Primary goal", item.primaryGoal],
    ["Partnership interest", item.partnershipInterest],
    ["Communications consent", item.communicationsConsent ? "Yes" : "No"],
    ["Terms accepted", item.termsAccepted ? "Yes" : "No"],
  ]

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>{item.fullName}</DialogTitle>
        <p className="text-sm text-muted-foreground">{item.email}</p>
      </DialogHeader>
      <dl className="grid grid-cols-[150px_1fr] gap-x-4 gap-y-2 text-sm">
        {fields.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 break-words">{value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </DialogContent>
  )
}
