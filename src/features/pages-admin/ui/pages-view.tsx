import * as React from "react"
import { toast } from "sonner"

import {
  usePageContentAdminQuery,
  useSavePageContentMutation,
} from "@/domains/page-content"
import { m } from "@/paraglide/messages"
import { EDITORIAL_BOARD_DEFAULTS } from "@/lib/editorial-board"
import { PageHeader } from "@/components/admin/page-header"
import { ListSkeleton, QueryError } from "@/components/admin/query-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getErrorMessage } from "@/lib/error"
import { JsonSectionForm } from "./json-section-form"
import type { JsonObject } from "./json-section-form"

/** The message defaults below need a pinned locale, not the ambient one. */
type AdminLocale = "en" | "fr"

const heroDefaults = (locale: AdminLocale): JsonObject => ({
  date: m.home_hero_date({}, { locale }),
  title: m.home_hero_title({}, { locale }),
  tagline: m.home_hero_tagline({}, { locale }),
  button: m.home_hero_button({}, { locale }),
  slides: [
    {
      title: m.home_hero_slide_beautiful_lome_title({}, { locale }),
      location: m.home_hero_slide_beautiful_lome_location({}, { locale }),
    },
    {
      title: m.home_hero_slide_cultural_heritage_title({}, { locale }),
      location: m.home_hero_slide_cultural_heritage_location({}, { locale }),
    },
    {
      title: m.home_hero_slide_modern_lome_title({}, { locale }),
      location: m.home_hero_slide_modern_lome_location({}, { locale }),
    },
  ],
})

const statsDefaults = (locale: AdminLocale): JsonObject => {
  const labels = [
    m.home_stats_participants_label({}, { locale }),
    m.home_stats_countries_label({}, { locale }),
    m.home_stats_speakers_label({}, { locale }),
    m.home_stats_startups_label({}, { locale }),
    m.home_stats_partners_label({}, { locale }),
    m.home_stats_investors_label({}, { locale }),
  ]
  return {
    items: [1000, 50, 150, 200, 100, 50].map((value, i) => ({
      value,
      suffix: "+",
      label: labels[i] ?? "",
    })),
  }
}

const dialoguesDefaults = (locale: AdminLocale): JsonObject => ({
  label: m.home_dialogues_label({}, { locale }),
  title: m.home_dialogues_title({}, { locale }),
  subtitle: m.home_dialogues_subtitle({}, { locale }),
  items: [
    {
      title: m.home_dialogues_presidential_title({}, { locale }),
      text: m.home_dialogues_presidential_text({}, { locale }),
    },
    {
      title: m.home_dialogues_ministerial_title({}, { locale }),
      text: m.home_dialogues_ministerial_text({}, { locale }),
    },
    {
      title: m.home_dialogues_practitioners_title({}, { locale }),
      text: m.home_dialogues_practitioners_text({}, { locale }),
    },
    {
      title: m.home_dialogues_startup_investor_title({}, { locale }),
      text: m.home_dialogues_startup_investor_text({}, { locale }),
    },
    {
      title: m.home_dialogues_ai_summit_title({}, { locale }),
      text: m.home_dialogues_ai_summit_text({}, { locale }),
    },
    {
      title: m.home_dialogues_awards_gala_title({}, { locale }),
      text: m.home_dialogues_awards_gala_text({}, { locale }),
    },
  ],
})

/**
 * Sections editable per page, with their built-in message defaults as the
 * starting content (the public components fall back to the same defaults
 * until a section is saved). Extend this map as more pages migrate.
 */
const PAGE_SECTIONS: Record<
  string,
  Array<{
    section: string
    title: string
    defaults: { en: JsonObject; fr: JsonObject }
  }>
> = {
  home: [
    {
      section: "hero",
      title: "Hero",
      defaults: { en: heroDefaults("en"), fr: heroDefaults("fr") },
    },
    {
      section: "stats",
      title: "Stats",
      defaults: { en: statsDefaults("en"), fr: statsDefaults("fr") },
    },
    {
      section: "dialogues",
      title: "High-level dialogues",
      defaults: { en: dialoguesDefaults("en"), fr: dialoguesDefaults("fr") },
    },
  ],
  site: [
    {
      section: "editorial-board",
      title: "Editorial Board byline",
      defaults: {
        en: { ...EDITORIAL_BOARD_DEFAULTS },
        fr: { ...EDITORIAL_BOARD_DEFAULTS },
      },
    },
  ],
}

export function PagesView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Pages"
        description="Edit the copy on the public pages. Sections start from the built-in text and go live as soon as you save them."
      />
      <PageSections page="home" />
      <PageSections page="site" />
    </div>
  )
}

function PageSections({ page }: { page: keyof typeof PAGE_SECTIONS }) {
  const contentQuery = usePageContentAdminQuery(page)

  if (contentQuery.isPending) {
    return <ListSkeleton rows={1} className="[&>*]:h-60" />
  }
  if (contentQuery.isError) {
    return (
      <QueryError
        title="Couldn't load page content"
        error={contentQuery.error}
        onRetry={() => void contentQuery.refetch()}
      />
    )
  }

  return (
    <>
      {PAGE_SECTIONS[page].map(({ section, title, defaults }) => {
        const rows = contentQuery.data.filter((r) => r.section === section)
        return (
          <SectionCard
            key={section}
            page={page}
            section={section}
            title={title}
            saved={{
              en: rows.find((r) => r.locale === "en")?.data,
              fr: rows.find((r) => r.locale === "fr")?.data,
            }}
            defaults={defaults}
          />
        )
      })}
    </>
  )
}

function SectionCard({
  page,
  section,
  title,
  saved,
  defaults,
}: {
  page: string
  section: string
  title: string
  saved: { en?: JsonObject; fr?: JsonObject }
  defaults: { en: JsonObject; fr: JsonObject }
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge variant={saved.en || saved.fr ? "default" : "secondary"}>
            {saved.en || saved.fr ? "customized" : "built-in text"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="en">
          <TabsList>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="fr">Français</TabsTrigger>
          </TabsList>
          <TabsContent value="en" keepMounted className="pt-4">
            <LocaleEditor
              page={page}
              section={section}
              locale="en"
              initial={saved.en ?? defaults.en}
            />
          </TabsContent>
          <TabsContent value="fr" keepMounted className="pt-4">
            <LocaleEditor
              page={page}
              section={section}
              locale="fr"
              initial={saved.fr ?? defaults.fr}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function LocaleEditor({
  page,
  section,
  locale,
  initial,
}: {
  page: string
  section: string
  locale: "en" | "fr"
  initial: JsonObject
}) {
  const [value, setValue] = React.useState(initial)
  const saveMutation = useSavePageContentMutation()

  return (
    <div className="space-y-4">
      <JsonSectionForm value={value} onChange={setValue} />
      <Button
        type="button"
        disabled={saveMutation.isPending}
        onClick={() =>
          saveMutation.mutate(
            { page, section, locale, data: value },
            {
              onSuccess: () =>
                toast.success(`Saved ${section} (${locale.toUpperCase()}).`),
              onError: (error) =>
                toast.error(
                  getErrorMessage(error, "Couldn't save the section.")
                ),
            }
          )
        }
      >
        {saveMutation.isPending && <Spinner />}
        Save {locale.toUpperCase()}
      </Button>
    </div>
  )
}
