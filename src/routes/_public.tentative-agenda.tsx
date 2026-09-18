import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { pageHead } from "@/lib/seo"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"
import { publicEventsQueryOptions } from "@/domains/events"
import {
  agendaHeaderDefaults,
  pageContentQueryOptions,
  usePageSection,
} from "@/domains/page-content"
import Logo from "@/assets/images/Logo.png"
import agendaImage from "@/assets/images/Image2.jpg"
import { PreregisterFormDialog } from "@/components/preregister-form-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

type AgendaItem = {
  day: string
  time: string
  title: string
  subtitle?: string
  speaker?: string
  bios?: string[]
  track?: string
  dayDescription?: string
  description?: string
  featured?: boolean
}

const DAY_DESCRIPTIONS: Record<string, string> = {
  "Day One · 26 May 2027":
    "Focusing on high-level dialogues, policy frameworks, AI governance, cross-border digital policies, and pan-African digital infrastructure.",
  "Day Two · 27 May 2027":
    "Day Two_27th May 2027: Focusing on venture capital mobilization, grassroots tech ecosystem expansion, and showcasing local software solutions.",
}

function splitDescription(description?: string) {
  if (!description) {
    return { outcome: "", beneficiaries: "" }
  }

  const marker = /target beneficiaries:/i
  const [outcome, beneficiaries] = description.split(marker)

  return {
    outcome: outcome.replace(/^expected outcome:\s*/i, "").trim(),
    beneficiaries: beneficiaries?.trim() ?? "",
  }
}

const AGENDA_ITEMS: AgendaItem[] = [
  {
    day: "Day One · 26 May 2027",
    time: "TBC",
    title: "Sovereign Infrastructure & The Unified Digital Market",
    subtitle:
      "High-level opening positioning Africa as a proactive driver of the global digital decade. Focus on harmonizing digital trade under AfCFTA, expanding broadband access, and closing the 76% usage gap across Sub-Saharan Africa. We expect host country leadership and visiting African leaders from Senegal, Ghana, Côte d'Ivoire Guinea, Rwanda, and Benin to lead this discussion.",
    track: "Policy & Governance",
    description:
      "Expected Outcome: Understanding, from the perspective of key policymakers, the required frameworks and commitments for Africa to achieve digital sovereignty and establish a unified digital market. Target Beneficiaries: This session aims to catalyze a strategic shift in how startups approach digital infrastructure development. Additionally, established enterprises within the digital ecosystem will gain genuine insights into policy directions to better inform internal strategies.",
  },
  {
    day: "Day One · 26 May 2027",
    time: "TBC",
    title: "Policy Frameworks for Ethical & Localized AI Deployment",
    subtitle:
      "High-level strategic dialogue convening African ICT and Digital Economy ministers, senior policymakers, and private sector leaders to establish sovereign governance frameworks aimed at capturing Africa's projected $1.2 trillion AI market opportunity by 2030. The session addresses ethical data governance, African language preservation, and public sector integration, while serving as a collaborative platform for private sector innovators to highlight regulatory bottlenecks directly to policymakers.",
    speaker:
      "African ICT and Digital Economy ministers, senior policymakers, and private sector leaders",
    track: "Policy & Governance",
    description:
      "Expected Outcome: A strategic paradigm shift in how AI-focused startups architect, scale, and deploy context-aware solutions across the continent, while providing venture capital investors with definitive policy clarity and a comprehensive understanding of the ecosystem's scale. Target Beneficiaries: AI innovators, technology startups, venture capital funds, digital ecosystem builders, and policy research institutes.",
  },
  {
    day: "Day One · 26 May 2027",
    time: "12:30 – 14:00",
    title: "Executive VIP Networking Lunch",
    subtitle:
      "Executive networking for policymakers, enterprise leaders, investors, and Forum partners.",
    track: "Policy & Governance",
    description:
      "Expected outcome: a focused space for relationship-building and cross-border collaboration. Target beneficiaries: invited VIP delegates and Forum partners.",
  },
  {
    day: "Day One · 26 May 2027",
    time: "TBC",
    title: "Regional Cybersecurity Protocols & Pan-African Data Governance",
    subtitle:
      "CISO-level dialogue on cross-border threat intelligence, inter-state cyber threats, zero-trust security, data sovereignty, and regulatory alignment across AfCFTA member states.",
    speaker:
      "National cybersecurity agencies, enterprise CISOs, fintech platforms, and data protection authorities",
    track: "Infrastructure & Trust",
    description:
      "Expected Outcome: A practical demonstration highlighting critical cybersecurity threats and autonomous attack vectors; a comprehensive review of recent successful cross-border interventions against regional cybercrime. This dialogue equips enterprise leaders and corporate institutions with actionable strategies and frameworks to proactively identify, isolate, and mitigate institutional vulnerabilities and emerging cyber threats while bolstering systemic digital trust. Target Beneficiaries: National cybersecurity agencies, CISOs of enterprise infrastructure, fintech platforms, data protection authorities, and policy leaders driving continental digital trade.",
  },
  {
    day: "Day One · 26 May 2027",
    time: "TBC",
    title: "Interoperability & Digital Economy Regulations",
    subtitle:
      "Policy session on Rwanda’s eKash instant payment system, the Bank of Ghana’s regulatory sandbox and digital asset frameworks, and cross-border licensing in Ghana, Rwanda, and Kenya.",
    speaker:
      "Pan-African fintech founders, digital asset innovators, regulators, commercial banks, and startup leaders",
    track: "Infrastructure & Trust",
    description:
      "Expected Outcome: Actionable insights for fintech startups to master regulatory compliance and interoperability best practices, while enabling non-fintech startups and SMEs across agricultural, retail, and health sectors to leverage expanded digital payment footprints for data-driven credit scoring and alternative capital access. Target Beneficiaries: Pan-African fintech founders, digital asset innovators, central bank regulators, commercial banks, and cross-sector startup leaders seeking borderless expansion and alternative financing mechanisms.",
  },
  {
    day: "Day One · 26 May 2027",
    time: "17:30 – 19:30",
    title: "Networking & Cultural Reception",
    subtitle:
      "Evening networking for state leaders, entrepreneurs, and enterprise sponsors.",
    track: "Policy & Governance",
    description:
      "Expected outcome: a shared cultural and networking experience for Forum delegates.",
  },
  {
    day: "Day Two · 27 May 2027",
    time: "TBC",
    title:
      "Catalyzing Venture Capital & Unlocking Domestic Capital for African Tech",
    subtitle:
      "Panel on bridging domestic startup funding gaps, de-risking venture investments, and incentivizing institutional investment across African markets.",
    track: "Capital & Ecosystems",
    description:
      "Expected Outcome: Startup founders will gain a clear understanding of the domestic funding ecosystem and explore alternative pathways and strategies for scaling without solely relying or waiting on traditional venture funding. Target Beneficiaries: Early-stage founders, startup leaders, institutional investors, and venture capital funds.",
  },
  {
    day: "Day Two · 27 May 2027",
    time: "11:00 – 11:30",
    title: "Networking Break & Startup Village Walkthrough",
    subtitle:
      "Exploring curated African startup booths in the Startup Village.",
    speaker: "Startup Village Exhibitors",
    track: "Capital & Ecosystems",
    description:
      "Expected outcome: direct connections between founders, investors, partners, and prospective customers.",
  },
  {
    day: "Day Two · 27 May 2027",
    time: "TBC",
    title:
      "E-Mobility & Urban Transit: Scaling Electric BRT & Clean Transport Ecosystems",
    subtitle:
      "High-level strategic session drawing from Dakar's landmark all-electric Bus Rapid Transit (BRT) system—which deployed 121 electric buses serving 300,000 daily passengers, cut travel times by 50%, and eliminated 59,000 tons of CO2 annually—as a model for sustainable urban mobility. The session explores how combining physical transit infrastructure with digital layers (real-time vehicle data, fleet management, and integrated digital payment systems) allows African cities to leapfrog traditional carbon-intensive transport.",
    speaker:
      "Spiro, E-Mobility Ecosystem Leaders, & Municipal Transit Authorities",
    track: "Infrastructure & Trust",
    description:
      "Expected Outcome: Operational blueprints and key lessons from Dakar's success are shared to empower nations like Ghana and other African markets entering the e-mobility space with actionable strategies for financing, grid integration, digital payment alignment, and policy frameworks. Target Beneficiaries: E-mobility startups and innovators, municipal transit authorities, ministries of transport and urban planning, green infrastructure investors, and clean energy ecosystem builders.",
  },
  {
    day: "Day Two · 27 May 2027",
    time: "13:00 – 14:15",
    title: "Networking Lunch & Deal Room Engagements",
    subtitle: "Open networking and private investment lounges.",
    track: "Capital & Ecosystems",
    description:
      "Expected outcome: private conversations connecting capital, ideas, and investable opportunities.",
  },
  {
    day: "Day Two · 27 May 2027",
    time: "TBC",
    title: "Scaling Localized Software & Contextual Digital Tools",
    subtitle:
      "Spotlight on grassroots innovators, local-language digital solutions, and community hubs expanding internet access and technology literacy across rural areas. This session explores effective software localization methodologies, African languages UI/UX design, offline-first digital architecture, and community-driven technology deployment.",
    track: "Local Innovation",
    description:
      "Expected Outcome: Participants gain practical tools, frameworks, and actionable approaches for localizing software, adapting user interfaces to local languages/dialects, and designing contextually relevant digital tools for low-bandwidth and offline environments. Founders and product teams will leave with proven strategies for accelerating technology adoption and building digital literacy across diverse grassroots communities. Target Beneficiaries: Grassroots innovators, software developers, UI/UX product designers, rural community hub leads, civic tech builders, tech non-profits, and venture builders focused on emerging market solutions.",
  },
  {
    day: "Day Two · 27 May 2027",
    time: "17:15 – 19:00",
    title: "Startup Expo Evening Mixer & Founders Social",
    subtitle:
      "Informal networking event for entrepreneurs, investors, and startup mentors.",
    track: "Capital & Ecosystems",
    description:
      "Expected outcome: new connections and practical conversations across the startup ecosystem.",
  },
]

export const Route = createFileRoute("/_public/tentative-agenda")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(publicEventsQueryOptions(getLocale())),
      context.queryClient.ensureQueryData(
        pageContentQueryOptions("agenda", getLocale())
      ),
    ]).catch(() => null),
  head: () => ({
    ...pageHead({
      title: "Agenda | Africa Digital Forum 2027",
      description:
        "Official program agenda for the Africa Digital Forum, 26–28 May 2027, themed Shaping Africa's Digital Future.",
      path: "/tentative-agenda",
      locale: getLocale(),
      alternates: true,
    }),
  }),
  component: TentativeAgendaPage,
})

function TentativeAgendaPage() {
  const header = usePageSection(
    "agenda",
    "header",
    getLocale(),
    agendaHeaderDefaults(getLocale())
  )
  const eventsQuery = useQuery(publicEventsQueryOptions(getLocale()))
  const agendaItems: AgendaItem[] =
    eventsQuery.data && eventsQuery.data.length > 0
      ? eventsQuery.data.map((event) => ({
          day: event.day || "Agenda",
          time: event.startsAt
            ? new Date(event.startsAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "TBC",
          title: event.title,
          subtitle: event.summary,
          speaker: event.speaker,
          bios: undefined,
          dayDescription: event.dayDescription,
          description: `Expected Outcome: ${event.expectedOutcome} Target Beneficiaries: ${event.beneficiaries}`,
        }))
      : AGENDA_ITEMS

  return (
    <div className="min-h-full bg-[#eeece7] px-0 py-0 text-[#13263f] sm:px-[3%] sm:py-8 lg:px-[5%]">
      <div className="mx-auto max-w-[1800px] overflow-hidden border border-[#d9d4cc] bg-[#f8f7f3] shadow-[0_18px_50px_rgba(19,38,63,0.14)] sm:rounded-[4px]">
        <header
          className="relative min-h-[390px] overflow-hidden border-b-[6px] border-violet-400 bg-[#102b4a] px-6 pt-6 pb-10 text-white sm:px-10 sm:pt-8 lg:px-16 lg:pt-10"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(10, 35, 61, 0.98) 0%, rgba(10, 35, 61, 0.94) 38%, rgba(10, 35, 61, 0.52) 70%, rgba(10, 35, 61, 0.3) 100%), url(${header.backgroundImage || agendaImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <img
            src={Logo}
            alt="Africa Digital Forum"
            className="relative z-10 mb-8 h-14 w-auto object-contain object-left sm:h-20 lg:h-24"
          />
          <div className="relative z-10 max-w-[850px]">
          <h1 className="mb-4 text-left font-serif text-4xl leading-none font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            {header.title}
          </h1>
          <p className="mb-5 text-left">
            <span className="inline-block border-l-4 border-violet-300 pl-4 text-lg font-semibold tracking-[0.04em] text-violet-200 sm:text-2xl">
              {header.theme}
            </span>
            <span className="mt-5 block text-xl font-bold tracking-[0.12em] text-white uppercase sm:text-2xl">
              {header.dates}
            </span>
          </p>
          </div>
        </header>

        <main className="w-full bg-[#f8f7f3] p-5 sm:p-8 lg:p-12">
          <div className="w-full space-y-4">
            {agendaItems.map((item, index) => {
              const isNewDay =
                index === 0 || agendaItems[index - 1]?.day !== item.day
              const { outcome, beneficiaries } = splitDescription(item.description)

              return (
                <div
                  key={item.time + item.title}
                  className="w-full border-b border-[#d8d3ca] bg-transparent transition hover:bg-[#f0ede6]"
                >
                  {isNewDay && (
                    <>
                      <div className="flex flex-col gap-3 border-b border-[#b18b4b] bg-[#102b4a] px-4 py-4 text-white md:flex-row md:items-center md:justify-between md:gap-6 md:px-5">
                        <span className="text-base font-black tracking-[0.08em] text-violet-200 uppercase">
                          {item.day}
                        </span>
                        <span className="max-w-[760px] text-sm leading-relaxed font-medium text-white/85 md:text-right md:text-base">
                          {item.dayDescription ?? DAY_DESCRIPTIONS[item.day]}
                        </span>
                      </div>
                      {index === 0 && (
                        <div className="grid gap-5 border-b border-violet-300/60 bg-[#e9e4da] px-5 py-3 text-[10px] font-black tracking-[0.14em] text-violet-800 uppercase md:grid-cols-[72px_minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1fr)] md:px-6">
                          <span>Time</span>
                          <span>Session Title</span>
                          <span>Summary</span>
                          <span>Expected Outcome</span>
                          <span>Target Beneficiaries</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="grid gap-5 overflow-hidden p-5 md:grid-cols-[72px_minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1fr)] md:items-start md:p-6">
                    <div className="min-w-0 whitespace-nowrap text-[11px] font-bold tracking-[0.04em] text-violet-800 md:text-xs">
                      {item.time}
                    </div>

                    <div className="min-w-0 break-words">
                      <div className="text-xs font-extrabold tracking-[-0.02em] text-[#13263f] md:text-sm">
                        {item.title}
                      </div>
                      {item.speaker && (
                        <div className="mt-2 text-xs font-semibold tracking-[0.08em] text-violet-700 uppercase md:text-[11px]">
                          {item.speaker}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 break-words text-[11px] leading-5 font-medium text-[#4c5560] md:text-xs">
                      {item.subtitle ?? "-"}
                    </div>

                    <div className="min-w-0 break-words text-[11px] leading-5 text-[#4c5560] md:text-xs">
                      {outcome || "-"}
                    </div>

                    <div className="min-w-0 break-words text-[11px] leading-5 text-[#4c5560] md:text-xs">
                      {beneficiaries || "-"}
                    </div>

                  </div>

                  {item.bios?.length && (
                    <div className="border-t border-[#d8d3ca] bg-[#eeeae2] px-4 py-4 md:px-6">
                      {item.bios && item.bios.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {item.bios.map((person) => (
                            <span
                              key={person}
                              className="border border-violet-300/50 bg-[#f8f7f3] px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-violet-800 uppercase"
                            >
                              {person}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-10 border-t-[5px] border-violet-400 bg-[#102b4a] px-6 py-7 text-white md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[10px] font-bold tracking-[0.15em] text-violet-200 uppercase">
                  Visitors
                </div>
                <div className="mt-2 text-3xl font-black tracking-[-0.05em] md:text-5xl">
                  Book a seat
                </div>
              </div>
              <Dialog>
                <DialogTrigger
                  render={
                    <Button className="h-auto border-2 border-primary px-9 py-3.5 text-sm font-bold tracking-[0.06em] text-white capitalize shadow-[0_4px_20px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 hover:border-[#6d28d9] hover:bg-[#6d28d9] hover:shadow-[0_8px_28px_rgba(124,58,237,0.55)]" />
                  }
                >
                  {m.preregister_button()}
                </DialogTrigger>
                <PreregisterFormDialog />
              </Dialog>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
