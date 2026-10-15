import { createServerFn } from "@tanstack/react-start"

import { requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { INTERNATIONAL, PASS_TIERS } from "./registrations.options"

type Count = { label: string; count: number }

const tally = (values: ReadonlyArray<string>): Array<Count> => {
  const map = new Map<string, number>()
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1)
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

const normalizeOrg = (value: string) => value.trim().toLowerCase()

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
    const africanRows = rows.filter((row) => row.country !== INTERNATIONAL)

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
          collected: sum(tierRows.filter((row) => row.paymentStatus === "paid")),
        }
      }),
      audience: {
        startups: countOfType("Startup Founder (Pitch Competition)"),
        sponsors: countOfType("Sponsor / Partner"),
        exhibitors: countOfType("Exhibitor (Innovation Expo)"),
        media: countOfType("Media / Press"),
        speakers: countOfType("Potential Speaker / Thought Leader"),
        attendees: countOfType("Attendee"),
        sponsorshipDeckRequests: rows.filter((row) =>
          row.partnershipInterest.startsWith("Yes")
        ).length,
        partnerInterest: rows.filter((row) =>
          row.partnershipInterest.includes("Knowledge/Media Partner")
        ).length,
      },
      participation: tally(rows.map((row) => row.participationType)),
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
      interests: tally(rows.flatMap((row) => row.interestAreas)),
      goals: tally(rows.map((row) => row.primaryGoal)),
      codesUsed: rows.filter((row) => row.accessCode).length,
      timeline,
    }
  })

export type RegistrationOverview = Awaited<
  ReturnType<typeof getRegistrationOverview>
>
