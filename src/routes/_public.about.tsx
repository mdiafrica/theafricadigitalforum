import { createFileRoute } from "@tanstack/react-router"
import { BookOpen, Clock, Mail, MapPin, User } from "lucide-react"

import { useI18n } from "@/i18n/context"
import { Reveal } from "@/components/motion"
import { LinkedinIcon } from "@/components/brand-icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import heroBg from "@/assets/images/Image1.png"
import marcPhoto from "@/assets/images/Marc.png"
import cliffordPhoto from "@/assets/images/clifford.png"

const TEAM_PHOTOS = [marcPhoto, cliffordPhoto]
const TEAM_LOCATIONS = ["Togo / Senegal", "Ghana / Rwanda"]
const TEAM_SOCIALS = [
  { linkedin: "https://linkedin.com/in/marcaboflan", email: "marc@africadigitalforum.com" },
  { linkedin: "https://www.linkedin.com/in/ecgyetuah/", email: "clifford@africadigitalforum.com" },
]

export const Route = createFileRoute("/_public/about")({
  head: () => ({
    meta: [
      { title: "About | Africa Digital Forum" },
      {
        name: "description",
        content:
          "Who we are: the team and mission behind the Africa Digital Forum.",
      },
      { property: "og:title", content: "About | Africa Digital Forum" },
      {
        property: "og:description",
        content:
          "Who we are: the team and mission behind the Africa Digital Forum.",
      },
    ],
  }),
  component: AboutRoute,
})

function AboutRoute() {
  const { t } = useI18n()
  const about = t.about

  const team = about.team.map((member, i) => ({
    ...member,
    photo: TEAM_PHOTOS[i],
    location: TEAM_LOCATIONS[i] ?? member.location,
    socials: TEAM_SOCIALS[i],
  }))

  return (
    <div className="bg-white font-nav">
      {/* Hero */}
      <section
        className="relative -mt-[85px] overflow-hidden bg-[#0d0d0d] bg-cover bg-center px-[8%] pt-[140px] pb-[120px] text-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(5,13,26,0.65)] to-[rgba(5,13,26,0.88)]" />
        <div className="relative mx-auto max-w-[760px]">
          <Reveal>
            <h1 className="mb-5 text-[clamp(32px,4vw,56px)] leading-[1.1] font-extrabold tracking-[0.05em] text-white">
              {about.heroTitle}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto max-w-[600px] text-base leading-[1.7] text-white/70">
              {about.heroSubtitle}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Vision */}
      <Reveal>
        <div className="grid items-start gap-10 bg-[#111111] px-[8%] py-[72px] md:grid-cols-[280px_1fr] md:gap-[160px]">
          <h2 className="text-[13px] font-bold tracking-[0.12em] text-white uppercase">
            {about.visionLabel}
          </h2>
          <p className="max-w-[520px] text-[15px] leading-[1.75] text-white/[0.88] md:mr-[80px] md:ml-[40px] md:text-justify">
            {about.visionText}
          </p>
        </div>
      </Reveal>

      {/* Mission */}
      <Reveal>
        <div
          className="relative grid items-start gap-10 bg-[#1a1a1a] bg-cover bg-center px-[8%] py-[72px] md:grid-cols-[280px_1fr] md:gap-[160px]"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-black/[0.52]" />
          <h2 className="relative text-[13px] font-bold tracking-[0.12em] text-white uppercase">
            {about.missionLabel}
          </h2>
          <p className="relative max-w-[520px] text-[15px] leading-[1.75] text-white/[0.88] md:mr-[80px] md:ml-[40px] md:text-justify">
            {about.missionText}
          </p>
        </div>
      </Reveal>

      {/* Organizing directors */}
      <section className="relative isolate bg-[#f5f5f3] px-[6%] py-[80px]">
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-cover bg-top"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[#f5f5f3]/75" />

        <div className="relative">
          <Reveal>
            <p className="mb-2 text-[12px] font-bold tracking-[0.14em] text-primary uppercase">
              {about.teamLabel}
            </p>
            <h2 className="mb-2.5 text-[clamp(24px,3vw,36px)] font-extrabold tracking-[0.03em] text-[#1a1a1a]">
              {about.teamHeading}
            </h2>
            <div className="mb-12 h-0.5 w-12 rounded-sm bg-primary" />
          </Reveal>

          <div className="grid justify-center gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,580px))]">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i === 0 ? 0.05 : 0.15}>
                <DirectorCard member={member} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory board */}
      <section
        className="relative overflow-hidden bg-[#0d0d0d] bg-cover bg-center px-[8%] py-[100px]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-[rgba(5,13,26,0.82)]" />
        <div className="relative mx-auto max-w-[720px] text-center">
          <Reveal>
            <h2
              className="mb-2 text-[clamp(24px,3vw,36px)] font-extrabold tracking-[0.05em] text-white [&_span]:text-primary"
              dangerouslySetInnerHTML={{ __html: about.advisoryHeading }}
            />
            <div className="mx-auto mb-5 h-[3px] w-16 rounded-sm bg-primary" />
            <p className="mx-auto mb-14 max-w-[500px] text-[15px] leading-[1.65] text-white/60">
              {about.advisorySubtext}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mb-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="flex flex-col items-center gap-3 rounded-2xl border-white/10 bg-white/[0.05] px-4 pt-8 pb-7"
                >
                  <div className="flex size-16 items-center justify-center rounded-full border-2 border-primary/35 bg-primary/[0.18] text-primary">
                    <User className="size-6" />
                  </div>
                  <div className="h-2.5 w-20 rounded-md bg-white/[0.12]" />
                  <div className="h-2 w-14 rounded-md bg-primary/25" />
                </Card>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-6 py-2.5 text-[13px] font-semibold tracking-[0.06em] text-[#a78bfa] uppercase">
              <Clock className="size-4" />
              {about.advisoryBadge}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

type Member = {
  name: string
  title: string
  location: string
  bio: string
  longBio: string
  photo: string
  socials: { linkedin: string; email: string }
}

function DirectorCard({ member }: { member: Member }) {
  return (
    <Card className="group grid grid-cols-[minmax(150px,200px)_minmax(0,1fr)] items-stretch overflow-hidden rounded-[20px] border-black/[0.06] bg-white p-0 shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_16px_40px_rgba(124,58,237,0.13)]">
      <div className="relative flex min-h-[280px] overflow-hidden bg-gradient-to-b from-[#3b0764] to-[#6d28d9]">
        <img
          src={member.photo}
          alt={member.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-0 right-0 z-[1] h-full w-8 bg-gradient-to-r from-transparent to-[#f5f5f3]" />
        <div className="absolute inset-x-0 bottom-0 z-[2] h-[3px] bg-gradient-to-r from-primary to-[#a855f7]" />
      </div>

      <div className="flex min-w-0 flex-col justify-between bg-white pt-6 pr-[22px] pb-[22px] pl-5">
        <div>
          <div className="mb-1.5 text-[10px] font-bold tracking-[0.1em] text-primary uppercase">
            {member.title}
          </div>
          <h3 className="mb-3 text-base leading-[1.25] font-bold tracking-[-0.01em] text-[#1a1a1a]">
            {member.name}
          </h3>
          <div className="mb-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.04em] text-[#888888]">
            <MapPin className="size-3 text-primary" />
            {member.location}
          </div>
          <p className="text-justify text-xs leading-[1.75] text-[#555555]">
            {member.bio}
          </p>

          <BioDialog member={member} />
        </div>

        <div>
          <div className="mt-4 mb-3.5 h-px bg-black/[0.07]" />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="icon"
              render={
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                />
              }
              className="size-[30px] rounded-full border-primary/25 bg-transparent text-primary hover:scale-110 hover:border-primary hover:bg-primary hover:text-white dark:border-primary/25 dark:bg-transparent dark:hover:bg-primary"
            >
              <LinkedinIcon className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              render={
                <a href={`mailto:${member.socials.email}`} aria-label="Email" />
              }
              className="h-[30px] gap-1.5 rounded-full border-primary/25 bg-transparent px-2.5 text-[11px] font-medium text-primary hover:border-primary hover:bg-primary hover:text-white dark:border-primary/25 dark:bg-transparent dark:hover:bg-primary"
            >
              <Mail className="size-3.5" />
              {member.socials.email}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function BioDialog({ member }: { member: Member }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="link"
            size="sm"
            className="mt-3 h-auto gap-2 px-0 text-[0.8rem] font-semibold tracking-[0.05em] text-primary uppercase hover:text-[#5b21b6]"
          />
        }
      >
        <BookOpen className="size-3.5" />
        Read more
      </DialogTrigger>
      <DialogContent className="grid max-h-[80vh] gap-0 overflow-hidden p-0 sm:max-w-[880px] md:grid-cols-[280px_1fr]">
        {/* Left: profile */}
        <div className="flex flex-col items-center overflow-y-auto border-b border-primary/[0.08] bg-[#f9f8ff] px-6 pt-8 pb-7 text-center md:border-r md:border-b-0">
          <img
            src={member.photo}
            alt={member.name}
            className="mb-5 size-[160px] rounded-full border-[3px] border-primary object-cover shadow-[0_0_0_6px_rgba(124,58,237,0.12),0_8px_24px_rgba(124,58,237,0.18)]"
          />
          <DialogTitle className="mb-1.5 text-[1.3rem] leading-[1.3] font-extrabold tracking-[-0.02em] text-[#1a1a1a]">
            {member.name}
          </DialogTitle>
          <span className="rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-[10px] font-bold tracking-[0.1em] text-primary uppercase">
            {member.title}
          </span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.04em] text-[#888888]">
            <MapPin className="size-3 text-primary" />
            {member.location}
          </span>

          <p className="mt-5 w-full border-t border-primary/[0.08] pt-4 text-[9px] font-bold tracking-[0.16em] text-[#aaaaaa] uppercase">
            Connect
          </p>
          <div className="flex flex-col items-center gap-2.5">
            <Button
              variant="outline"
              size="icon"
              render={
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                />
              }
              className="size-11 rounded-full border-primary/20 bg-primary/[0.04] text-primary hover:border-primary hover:bg-primary hover:text-white dark:border-primary/20 dark:bg-primary/[0.04] dark:hover:bg-primary"
            >
              <LinkedinIcon className="size-4.5" />
            </Button>
            <Button
              variant="outline"
              render={
                <a href={`mailto:${member.socials.email}`} aria-label="Email" />
              }
              className="h-11 gap-2.5 rounded-full border-primary/30 bg-primary/[0.06] px-4 text-[13px] font-semibold text-primary hover:border-primary hover:bg-primary hover:text-white dark:border-primary/30 dark:bg-primary/[0.06] dark:hover:bg-primary"
            >
              <Mail className="size-4.5" />
              {member.socials.email}
            </Button>
          </div>
        </div>

        {/* Right: bio */}
        <div className="flex flex-col overflow-y-auto bg-white px-8 pt-7 pb-7">
          <div className="mb-5 border-b-2 border-primary/[0.08] pb-4">
            <p className="mb-1 text-[10px] font-bold tracking-[0.12em] text-primary uppercase">
              Bio
            </p>
            <h2 className="text-lg leading-[1.35] font-bold text-[#1a1a1a]">
              {member.title}
            </h2>
            <p className="text-[13px] font-medium text-[#666666]">
              Africa Digital Forum
            </p>
          </div>
          <div className="flex flex-col gap-4 text-sm leading-[1.8] text-[#2a2a2a]">
            {member.longBio.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
