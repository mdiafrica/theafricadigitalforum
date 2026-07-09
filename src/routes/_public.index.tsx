import { createFileRoute } from "@tanstack/react-router"

import { Hero } from "@/components/home/hero"
import { Stats } from "@/components/home/stats"
import { Dialogues } from "@/components/home/dialogues"
import { Speakers } from "@/components/home/speakers"
import { LatestArticles } from "@/components/home/latest-articles"

export const Route = createFileRoute("/_public/")({ component: HomeRoute })

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
