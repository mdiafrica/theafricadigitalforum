import { asc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

type SeedItem = {
  day: string
  title: string
  summary: string
  outcome: string
  beneficiaries: string
  speaker?: string
  dayDescription: string
  startsAt?: string
  endsAt?: string
}

const dayOne = "Day One · 26 May 2027"
const dayTwo = "Day Two · 27 May 2027"
const dayOneDescription =
  "Focusing on high-level dialogues, policy frameworks, AI governance, cross-border digital policies, and pan-African digital infrastructure."
const dayTwoDescription =
  "Focusing on venture capital mobilization, grassroots tech ecosystem expansion, and showcasing local software solutions."

const agenda: SeedItem[] = [
  {
    day: dayOne,
    title: "Sovereign Infrastructure & The Unified Digital Market",
    summary:
      "High-level opening positioning Africa as a proactive driver of the global digital decade. Focus on harmonizing digital trade under AfCFTA, expanding broadband access, and closing the 76% usage gap across Sub-Saharan Africa. We expect host country leadership and visiting African leaders from Senegal, Ghana, Côte d'Ivoire Guinea, Rwanda, and Benin to lead this discussion.",
    outcome:
      "Understanding, from the perspective of key policymakers, the required frameworks and commitments for Africa to achieve digital sovereignty and establish a unified digital market.",
    beneficiaries:
      "This session aims to catalyze a strategic shift in how startups approach digital infrastructure development. Additionally, established enterprises within the digital ecosystem will gain genuine insights into policy directions to better inform internal strategies.",
    dayDescription: dayOneDescription,
  },
  {
    day: dayOne,
    title: "Policy Frameworks for Ethical & Localized AI Deployment",
    summary:
      "High-level strategic dialogue convening African ICT and Digital Economy ministers, senior policymakers, and private sector leaders to establish sovereign governance frameworks aimed at capturing Africa's projected $1.2 trillion AI market opportunity by 2030. The session addresses ethical data governance, African language preservation, and public sector integration, while serving as a collaborative platform for private sector innovators to highlight regulatory bottlenecks directly to policymakers.",
    outcome:
      "A strategic paradigm shift in how AI-focused startups architect, scale, and deploy context-aware solutions across the continent, while providing venture capital investors with definitive policy clarity and a comprehensive understanding of the ecosystem's scale.",
    beneficiaries:
      "AI innovators, technology startups, venture capital funds, digital ecosystem builders, and policy research institutes.",
    speaker:
      "African ICT and Digital Economy ministers, senior policymakers, and private sector leaders",
    dayDescription: dayOneDescription,
  },
  {
    day: dayOne,
    title: "Executive VIP Networking Lunch",
    summary:
      "Executive networking for policymakers, enterprise leaders, investors, and Forum partners.",
    outcome: "A focused space for relationship-building and cross-border collaboration.",
    beneficiaries: "Invited VIP delegates and Forum partners.",
    startsAt: "2027-05-26T12:30:00",
    endsAt: "2027-05-26T14:00:00",
    dayDescription: dayOneDescription,
  },
  {
    day: dayOne,
    title: "Regional Cybersecurity Protocols & Pan-African Data Governance",
    summary:
      "CISO-level dialogue on cross-border threat intelligence, inter-state cyber threats, zero-trust security, data sovereignty, and regulatory alignment across AfCFTA member states.",
    outcome:
      "A practical demonstration highlighting critical cybersecurity threats and autonomous attack vectors; a comprehensive review of recent successful cross-border interventions against regional cybercrime. This dialogue equips enterprise leaders and corporate institutions with actionable strategies and frameworks to proactively identify, isolate, and mitigate institutional vulnerabilities and emerging cyber threats while bolstering systemic digital trust.",
    beneficiaries:
      "National cybersecurity agencies, CISOs of enterprise infrastructure, fintech platforms, data protection authorities, and policy leaders driving continental digital trade.",
    speaker:
      "National cybersecurity agencies, enterprise CISOs, fintech platforms, and data protection authorities",
    dayDescription: dayOneDescription,
  },
  {
    day: dayOne,
    title: "Interoperability & Digital Economy Regulations",
    summary:
      "Policy session on Rwanda's eKash instant payment system, the Bank of Ghana's regulatory sandbox and digital asset frameworks, and cross-border licensing in Ghana, Rwanda, and Kenya.",
    outcome:
      "Actionable insights for fintech startups to master regulatory compliance and interoperability best practices, while enabling non-fintech startups and SMEs across agricultural, retail, and health sectors to leverage expanded digital payment footprints for data-driven credit scoring and alternative capital access.",
    beneficiaries:
      "Pan-African fintech founders, digital asset innovators, central bank regulators, commercial banks, and cross-sector startup leaders seeking borderless expansion and alternative financing mechanisms.",
    speaker:
      "Pan-African fintech founders, digital asset innovators, regulators, commercial banks, and startup leaders",
    dayDescription: dayOneDescription,
  },
  {
    day: dayOne,
    title: "Networking & Cultural Reception",
    summary: "Evening networking for state leaders, entrepreneurs, and enterprise sponsors.",
    outcome: "A shared cultural and networking experience for Forum delegates.",
    beneficiaries: "Forum delegates, entrepreneurs, and enterprise sponsors.",
    startsAt: "2027-05-26T17:30:00",
    endsAt: "2027-05-26T19:30:00",
    dayDescription: dayOneDescription,
  },
  {
    day: dayTwo,
    title: "Catalyzing Venture Capital & Unlocking Domestic Capital for African Tech",
    summary:
      "Panel on bridging domestic startup funding gaps, de-risking venture investments, and incentivizing institutional investment across African markets.",
    outcome:
      "Startup founders will gain a clear understanding of the domestic funding ecosystem and explore alternative pathways and strategies for scaling without solely relying or waiting on traditional venture funding.",
    beneficiaries: "Early-stage founders, startup leaders, institutional investors, and venture capital funds.",
    dayDescription: dayTwoDescription,
  },
  {
    day: dayTwo,
    title: "Networking Break & Startup Village Walkthrough",
    summary: "Exploring curated African startup booths in the Startup Village.",
    outcome: "Direct connections between founders, investors, partners, and prospective customers.",
    beneficiaries: "Startup Village Exhibitors",
    speaker: "Startup Village Exhibitors",
    startsAt: "2027-05-27T11:00:00",
    endsAt: "2027-05-27T11:30:00",
    dayDescription: dayTwoDescription,
  },
  {
    day: dayTwo,
    title: "E-Mobility & Urban Transit: Scaling Electric BRT & Clean Transport Ecosystems",
    summary:
      "High-level strategic session drawing from Dakar's landmark all-electric Bus Rapid Transit (BRT) system, which deployed 121 electric buses serving 300,000 daily passengers, cut travel times by 50%, and eliminated 59,000 tons of CO2 annually. The session explores how physical transit infrastructure and digital layers allow African cities to leapfrog carbon-intensive transport.",
    outcome:
      "Operational blueprints and key lessons from Dakar's success are shared to empower nations like Ghana and other African markets entering the e-mobility space with actionable strategies for financing, grid integration, digital payment alignment, and policy frameworks.",
    beneficiaries:
      "E-mobility startups and innovators, municipal transit authorities, ministries of transport and urban planning, green infrastructure investors, and clean energy ecosystem builders.",
    speaker: "Spiro, E-Mobility Ecosystem Leaders, & Municipal Transit Authorities",
    dayDescription: dayTwoDescription,
  },
  {
    day: dayTwo,
    title: "Networking Lunch & Deal Room Engagements",
    summary: "Open Networking & Private Investment Lounges",
    outcome: "Private conversations connecting capital, ideas, and investable opportunities.",
    beneficiaries: "Founders, investors, partners, and prospective customers.",
    startsAt: "2027-05-27T13:00:00",
    endsAt: "2027-05-27T14:15:00",
    dayDescription: dayTwoDescription,
  },
  {
    day: dayTwo,
    title: "Scaling Localized Software & Contextual Digital Tools",
    summary:
      "Spotlight on grassroots innovators, local-language digital solutions, and community hubs expanding internet access and technology literacy across rural areas. This session explores software localization, African languages UI/UX design, offline-first digital architecture, and community-driven technology deployment.",
    outcome:
      "Participants gain practical tools, frameworks, and actionable approaches for localizing software, adapting user interfaces to local languages/dialects, and designing contextually relevant digital tools for low-bandwidth and offline environments. Founders and product teams will leave with proven strategies for accelerating technology adoption and building digital literacy across diverse grassroots communities.",
    beneficiaries:
      "Grassroots innovators, software developers, UI/UX product designers, rural community hub leads, civic tech builders, tech non-profits, and venture builders focused on emerging market solutions.",
    dayDescription: dayTwoDescription,
  },
  {
    day: dayTwo,
    title: "Startup Expo Evening Mixer & Founders Social",
    summary: "Informal networking event for entrepreneurs, investors, and startup mentors.",
    outcome: "New connections and practical conversations across the startup ecosystem.",
    beneficiaries: "Entrepreneurs, investors, startup mentors, and ecosystem partners.",
    startsAt: "2027-05-27T17:15:00",
    endsAt: "2027-05-27T19:00:00",
    dayDescription: dayTwoDescription,
  },
]

async function main() {
  const existing = await db.query.event.findMany({
    columns: { id: true, sortOrder: true },
    orderBy: asc(schema.event.sortOrder),
  })

  if (existing.length > 0) {
    for (const [index, item] of existing.entries()) {
      if (item.sortOrder !== index + 1) {
        await db
          .update(schema.event)
          .set({ sortOrder: index + 1 })
          .where(eq(schema.event.id, item.id))
      }
    }
    console.log("Agenda already seeded - normalized display order.")
    return
  }

  for (const [index, item] of agenda.entries()) {
    const [event] = await db
      .insert(schema.event)
      .values({
        day: item.day,
        startsAt: item.startsAt ? new Date(item.startsAt) : null,
        endsAt: item.endsAt ? new Date(item.endsAt) : null,
        sortOrder: index + 1,
      })
      .returning({ id: schema.event.id })

    await db.insert(schema.eventTranslation).values({
      eventId: event.id,
      locale: "en",
      title: item.title,
      summary: item.summary,
      expectedOutcome: item.outcome,
      beneficiaries: item.beneficiaries,
      speaker: item.speaker ?? "",
      dayDescription: item.dayDescription,
      description: "",
    })
  }

  console.log(`Seeded ${agenda.length} agenda items.`)
}

await main()
process.exit(0)
