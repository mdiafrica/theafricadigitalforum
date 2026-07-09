import * as React from "react"
import { toast } from "sonner"

import {
  usePageContentAdminQuery,
  useSavePageContentMutation,
} from "@/domains/page-content"
import { en } from "@/i18n/en"
import { fr } from "@/i18n/fr"
import { PageHeader } from "@/components/admin/page-header"
import { ListSkeleton, QueryError } from "@/components/admin/query-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getErrorMessage } from "@/lib/error"
import { JsonSectionForm, type JsonObject } from "./json-section-form"

/**
 * Sections editable per page, with their i18n defaults as the starting
 * content (the public components fall back to the same defaults until a
 * section is saved). Extend this map as more pages migrate.
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
      defaults: { en: en.home.hero, fr: fr.home.hero },
    },
    {
      section: "stats",
      title: "Stats",
      defaults: {
        en: {
          items: [1000, 50, 150, 200, 100, 50].map((value, i) => ({
            value,
            suffix: "+",
            label: en.home.stats[i]?.label ?? "",
          })),
        },
        fr: {
          items: [1000, 50, 150, 200, 100, 50].map((value, i) => ({
            value,
            suffix: "+",
            label: fr.home.stats[i]?.label ?? "",
          })),
        },
      },
    },
    {
      section: "dialogues",
      title: "High-level dialogues",
      defaults: {
        en: {
          label: en.home.dialoguesLabel,
          title: en.home.dialoguesTitle,
          subtitle: en.home.dialoguesSubtitle,
          items: en.home.dialogues,
        },
        fr: {
          label: fr.home.dialoguesLabel,
          title: fr.home.dialoguesTitle,
          subtitle: fr.home.dialoguesSubtitle,
          items: fr.home.dialogues,
        },
      },
    },
  ],
}

export function PagesView() {
  const page = "home"
  const contentQuery = usePageContentAdminQuery(page)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Pages"
        description="Edit the copy on the public pages. Sections start from the built-in text and go live as soon as you save them."
      />

      {contentQuery.isPending && (
        <ListSkeleton rows={2} className="[&>*]:h-60" />
      )}

      {contentQuery.isError && (
        <QueryError
          title="Couldn't load page content"
          error={contentQuery.error}
          onRetry={() => void contentQuery.refetch()}
        />
      )}

      {contentQuery.data &&
        PAGE_SECTIONS[page].map(({ section, title, defaults }) => {
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
    </div>
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
