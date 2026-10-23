import { createServerFn } from "@tanstack/react-start"

import { requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { AFRICAN_COUNTRIES, PASS_TIERS } from "./registrations.options"

type Count = { label: string; count: number }

const tally = (values: ReadonlyArray<string>): Array<Count> => {
  const map = new Map<string, number>()
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1)
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

const normalizeOrg = (value: string) => value.trim().toLowerCase()

const OTHER_LABEL = "Other"

/** Tally answers, folding every `Other: <text>` into one "Other" row and
 * collecting what people actually wrote. */
const tallyWithOther = (values: ReadonlyArray<string>) => {
  const written = new Map<string, { text: string; count: number }>()
  const regular: Array<string> = []
  let otherCount = 0
  for (const value of values) {
    if (!value.startsWith("Other:")) {
      regular.push(value)
      continue
    }
    otherCount += 1
    const text = value.slice("Other:".length).trim()
    const key = text.toLowerCase()
    const entry = written.get(key)
    if (entry) entry.count += 1
    else written.set(key, { text, count: 1 })
  }
  const items = tally(regular)
  if (otherCount > 0) items.push({ label: OTHER_LABEL, count: otherCount })
  return {
    items: items.sort(
      (a, b) =>
        Number(a.label === OTHER_LABEL) - Number(b.label === OTHER_LABEL) ||
        b.count - a.count ||
        a.label.localeCompare(b.label)
    ),
    others: [...written.values()].sort(
      (a, b) => b.count - a.count || a.text.localeCompare(b.text)
    ),
  }
}

export const getRegistrationOverview = createServerFn({ method: "GET" })
  .middleware([requireOrgPermission({ submission: ["read"] })])
  .handler(async () => {
    const rows = await db.select().from(schema.registration)
    const priceOf = (tier: string) =>
      PASS_TIERS.find((item) => item.id === tier)?.price ?? 0

    const paid = rows.filter((row) => row.paymentStatus === "paid")
    const pending = rows.filter((row) => row.paymentStatus === "pending")
    const waived = rows.filter((row) => row.paymentStatus === "waived")
    const sum = (list: typeof rows) =>
      list.reduce((total, row) => total + priceOf(row.passTier), 0)

    const countries = tally(rows.map((row) => row.country))
    const africanRows = rows.filter((row) =>
      (AFRICAN_COUNTRIES as ReadonlyArray<string>).includes(row.country)
    )

    const countOfType = (type: string) =>
      rows.filter((row) => row.participationType === type).length

    const dayKey = (date: Date) => date.toISOString().slice(0, 10)
    const perDay = new Map<string, number>()
    for (const row of rows) {
      const key = dayKey(row.createdAt)
      perDay.set(key, (perDay.get(key) ?? 0) + 1)
    }
    const timeline: Array<Count> = []
    for (let offset = 13; offset >= 0; offset -= 1) {
      const key = dayKey(new Date(Date.now() - offset * 86_400_000))
      timeline.push({ label: key, count: perDay.get(key) ?? 0 })
    }

    return {
      total: rows.length,
      revenue: {
        collected: sum(paid),
        outstanding: sum(pending),
        waivedValue: sum(waived),
        potential: sum(rows),
      },
      payment: {
        paid: paid.length,
        pending: pending.length,
        waived: waived.length,
      },
      tiers: PASS_TIERS.map((tier) => {
        const tierRows = rows.filter((row) => row.passTier === tier.id)
        return {
          id: tier.id,
          name: tier.name,
          price: tier.price,
          count: tierRows.length,
          collected: sum(
            tierRows.filter((row) => row.paymentStatus === "paid")
          ),
        }
      }),
      audience: {
        startups: countOfType("Startup Founder (Pitch Competition)"),
        sponsors: countOfType("Sponsor / Partner"),
        exhibitors: countOfType("Exhibitor (Innovation Expo)"),
        media: countOfType("Media / Press"),
        speakers: countOfType("Potential Speaker / Thought Leader"),
        attendees: countOfType("Delegate") + countOfType("Attendee"),
        sponsorshipDeckRequests: rows.filter((row) =>
          row.partnershipInterest.startsWith("Yes")
        ).length,
        partnerInterest: rows.filter((row) =>
          row.partnershipInterest.includes("Knowledge/Media Partner")
        ).length,
      },
      participation: tallyWithOther(rows.map((row) => row.participationType)),
      diversity: {
        countryCount: new Set(africanRows.map((row) => row.country)).size,
        international: rows.length - africanRows.length,
        africanShare: rows.length
          ? Math.round((africanRows.length / rows.length) * 100)
          : 0,
        countries,
      },
      organizations: new Set(rows.map((row) => normalizeOrg(row.organization)))
        .size,
      interests: tallyWithOther(rows.flatMap((row) => row.interestAreas)),
      goals: tallyWithOther(rows.map((row) => row.primaryGoal)),
      codesUsed: rows.filter((row) => row.accessCode).length,
      timeline,
    }
  })

export type RegistrationOverview = Awaited<
  ReturnType<typeof getRegistrationOverview>
>
