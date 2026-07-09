import { BellRing, Mic } from "lucide-react"

import { useI18n } from "@/i18n/context"
import { usePublicSpeakersQuery, type PublicSpeaker } from "@/domains/speakers"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LinkedinIcon, XIcon } from "@/components/brand-icons"
import bgImage from "@/assets/images/Image6.jpg"

export function Speakers() {
  const { t, lang } = useI18n()
  const section = t.home.speakersSection
  const teaser = t.home.speakersTeaser

  const speakersQuery = usePublicSpeakersQuery(lang)
  const speakers = speakersQuery.data ?? []

  return (
    <section
      id="speakers"
      className="relative overflow-hidden bg-cover bg-center px-[5%] py-24 font-nav"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 z-0 bg-black/[0.85]" />

      <div className="relative z-[1] mx-auto max-w-[1200px]">
        <div className="mb-3 inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.14em] text-primary uppercase">
          <span className="h-0.5 w-6 rounded-sm bg-primary" />
          {section.label}
        </div>
        <h2 className="mb-3 text-2xl font-extrabold tracking-[0.05em] text-white after:mt-3 after:block after:h-[3px] after:w-11 after:rounded-sm after:bg-primary">
          {section.title}
        </h2>
        <p className="mb-10 max-w-[560px] text-[13px] leading-[1.6] text-white/60">
          {section.subtitle}
        </p>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {speakersQuery.isPending &&
            Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-[20px]" />
            ))}

          {speakers.map((speaker, i) => (
            <SpeakerCard key={speaker.id} speaker={speaker} index={i} />
          ))}

          {!speakersQuery.isPending && (
            <div className="flex h-full flex-col items-center justify-center rounded-[20px] border-[0.5px] border-primary/30 bg-white/[0.06] px-4 py-6 text-center backdrop-blur-sm">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Mic className="size-6" />
              </div>
              <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-white">
                {teaser.name}
              </h3>
              <p className="mt-1 text-[11px] text-white/60">{teaser.role}</p>
              <div className="my-3 h-0.5 w-10 rounded-sm bg-primary" />
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                {teaser.cta}
                <BellRing className="size-3.5" />
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const SOCIAL_BTN_CLASS =
  "size-[26px] rounded-md border-[0.5px] border-black/[0.12] bg-black/[0.03] text-black/70 hover:bg-primary hover:text-white dark:border-black/[0.12] dark:bg-black/[0.03] dark:hover:bg-primary"

function SpeakerCard({
  speaker,
  index,
}: {
  speaker: PublicSpeaker
  index: number
}) {
  return (
    <div className="flex h-full flex-col items-center rounded-[20px] border-[0.5px] border-white/10 bg-white px-4 pt-6 pb-[18px] text-center transition-transform duration-300 hover:-translate-y-1.5">
      <div className="relative mb-3.5 size-[150px] shrink-0">
        <span className="pointer-events-none absolute -inset-1 rounded-full border-2 border-primary/30" />
        {speaker.photoUrl ? (
          <img
            src={speaker.photoUrl}
            alt={speaker.name}
            loading="lazy"
            className="size-full rounded-full border-2 border-white object-cover object-top"
          />
        ) : (
          <div className="size-full rounded-full border-2 border-white bg-gradient-to-br from-primary/25 to-primary/5" />
        )}
        <span className="absolute right-1 bottom-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary text-[10px] font-extrabold tracking-[0.04em] text-white">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="mb-1 text-[15px] leading-[1.2] font-extrabold tracking-[-0.02em] text-[#111111]">
        {speaker.name}
      </h3>
      <p className="mb-3 text-[11px] leading-[1.3] font-medium text-black/60">
        {speaker.role}
      </p>
      <div className="mx-auto mb-3 h-0.5 w-10 rounded-sm bg-primary" />

      <div className="mt-0.5 flex gap-2">
        {speaker.twitterUrl && (
          <Button
            variant="outline"
            size="icon"
            render={
              <a
                href={speaker.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${speaker.name} on X`}
              />
            }
            className={SOCIAL_BTN_CLASS}
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
        {speaker.linkedinUrl && (
          <Button
            variant="outline"
            size="icon"
            render={
              <a
                href={speaker.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${speaker.name} on LinkedIn`}
              />
            }
            className={SOCIAL_BTN_CLASS}
          >
            <LinkedinIcon className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
