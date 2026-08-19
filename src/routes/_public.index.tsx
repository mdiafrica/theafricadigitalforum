import { createFileRoute } from "@tanstack/react-router"

import { getLocale } from "@/paraglide/runtime"
import { m } from "@/paraglide/messages"
import { pageHead } from "@/lib/seo"
import { publishedPostsQueryOptions } from "@/domains/posts"
import { Hero } from "@/components/home/hero"
import { Stats } from "@/components/home/stats"
import { Dialogues } from "@/components/home/dialogues"
import { Speakers } from "@/components/home/speakers"
import { LatestArticles } from "@/components/home/latest-articles"

export const Route = createFileRoute("/_public/")({
  // The homepage must never 500 over a posts fetch — fall back and let the
  // client query retry.
  loader: ({ context }) =>
    context.queryClient
      .ensureQueryData(publishedPostsQueryOptions(getLocale()))
      .catch(() => null),
  head: () => ({
    ...pageHead({
      title: m.meta_home_title(),
      description: m.meta_home_description(),
      path: "/",
      locale: getLocale(),
      alternates: true,
    }),
  }),
  component: HomeRoute,
})

function HomeRoute() {
  return (
    <>
      <Hero />
      <Stats />
      <Dialogues />
      <Speakers />
      <LatestArticles />
    </>
  )
}
