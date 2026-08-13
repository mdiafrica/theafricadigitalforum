import { createFileRoute } from "@tanstack/react-router"

import { pageHead } from "@/lib/seo"
import { publishedPostsQueryOptions } from "@/domains/posts"
import { Hero } from "@/components/home/hero"
import { Stats } from "@/components/home/stats"
import { Dialogues } from "@/components/home/dialogues"
import { Speakers } from "@/components/home/speakers"
import { LatestArticles } from "@/components/home/latest-articles"

export const Route = createFileRoute("/_public/")({
  // SSR primes the default locale; the homepage must never 500 over a
  // posts fetch — fall back and let the client query retry.
  loader: ({ context }) =>
    context.queryClient
      .ensureQueryData(publishedPostsQueryOptions("en"))
      .catch(() => null),
  head: () => ({
    ...pageHead({
      title:
        "Africa Digital Forum | Africa's Premier Digital Innovation & Technology Forum",
      description:
        "Africa Digital Forum (ADF) is Africa's premier platform connecting governments, technology leaders, startups, investors, academia and innovators to accelerate digital transformation across the continent.",
      path: "/",
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
