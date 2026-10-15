import type { ReactNode } from "react"
import {
  BuildingIcon,
  CoinsIcon,
  GlobeIcon,
  HandshakeIcon,
  RocketIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react"

import {
  useRegistrationOverviewQuery,
  type RegistrationOverview,
} from "@/domains/registrations"
import { PageHeader } from "@/components/admin/page-header"
import { ListSkeleton, QueryError } from "@/components/admin/query-states"

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)

export function RegistrationOverviewView() {
  const query = useRegistrationOverviewQuery()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Registration overview"
        description="Revenue, audience mix and geographic diversity across all forum registrations."
      />
      {query.isPending ? (
        <ListSkeleton rows={4} className="[&>*]:h-24" />
      ) : query.isError ? (
        <QueryError
          title="Couldn't load the overview"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <Overview data={query.data} />
      )}
    </div>
  )
}

function Overview({ data }: { data: RegistrationOverview }) {
  const { revenue, payment, audience, diversity } = data
  const topCountry = diversity.countries[0]

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<CoinsIcon />}
          label="Money raised"
          value={usd(revenue.collected)}
          hint={`${payment.paid} paid registrations`}
        />
        <Stat
          icon={<CoinsIcon />}
          label="Awaiting payment"
          value={usd(revenue.outstanding)}
          hint={`${payment.pending} pending registrations`}
        />
        <Stat
          icon={<TicketIcon />}
          label="Registrations"
          value={String(data.total)}
          hint={`${payment.waived} waived via codes or by admin`}
        />
        <Stat
          icon={<BuildingIcon />}
          label="Organizations"
          value={String(data.organizations)}
          hint="Distinct companies represented"
        />
        <Stat
          icon={<RocketIcon />}
          label="Startups"
          value={String(audience.startups)}
          hint="Startup founders (pitch competition)"
        />
        <Stat
          icon={<HandshakeIcon />}
          label="Sponsors & partners"
          value={String(audience.sponsors)}
          hint={`${audience.sponsorshipDeckRequests} requested the sponsorship deck`}
        />
        <Stat
          icon={<GlobeIcon />}
          label="African countries"
          value={String(diversity.countryCount)}
          hint={`${diversity.africanShare}% African, ${diversity.international} international`}
        />
        <Stat
          icon={<UsersIcon />}
          label="Top country"
          value={topCountry?.label ?? "—"}
          hint={topCountry ? `${topCountry.count} registrations` : "No data yet"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Revenue by pass"
          note={`Full potential value: ${usd(revenue.potential)} · waived value: ${usd(revenue.waivedValue)}`}
        >
          <Bars
            items={data.tiers.map((tier) => ({
              label: `${tier.name} (${usd(tier.price)})`,
              count: tier.count,
              detail: `${usd(tier.collected)} raised`,
            }))}
          />
        </Panel>
        <Panel title="Who is coming">
          <Bars items={data.participation} />
        </Panel>
        <Panel title="Areas of interest">
          <Bars items={data.interests} />
        </Panel>
        <Panel title="Primary goals">
          <Bars items={data.goals} />
        </Panel>
      </div>
    </>
  )
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-5">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground uppercase">
          {label}
        </div>
        <div className="truncate text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </div>
  )
}

function Panel({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold">{title}</h2>
      {note ? <p className="mb-3 text-xs text-muted-foreground">{note}</p> : <div className="mb-3" />}
      {children}
    </section>
  )
}

function Bars({
  items,
}: {
  items: Array<{ label: string; count: number; detail?: string }>
}) {
  const max = Math.max(1, ...items.map((item) => item.count))
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="text-sm">
          <div className="mb-1 flex justify-between gap-3">
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 text-muted-foreground">
              {item.detail ? `${item.detail} · ` : ""}
              <strong className="text-foreground">{item.count}</strong>
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
