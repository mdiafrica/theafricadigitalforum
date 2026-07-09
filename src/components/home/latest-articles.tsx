import { Link } from "@tanstack/react-router"
import { ArrowRight, Mail } from "lucide-react"

import { useI18n } from "@/i18n/context"
import { POSTS } from "@/data/posts"
import { Button } from "@/components/ui/button"
import { NewsletterForm } from "@/components/newsletter-form"

export function LatestArticles() {
  const { t } = useI18n()
  const latest = t.home.latest
  const posts = POSTS.slice(0, 3)

  return (
    <section className="bg-[#f5f5f5] px-[5%] py-20 font-nav">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-10">
          <div className="min-w-[280px] flex-1">
            <h2 className="mb-2 text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.02em] text-[#1a1a1a] after:mt-3 after:block after:h-[3px] after:w-11 after:rounded-sm after:bg-primary">
              {latest.title}
            </h2>
            <p className="max-w-[560px] text-sm leading-[1.6] text-black/60">
              {latest.subtitle}
            </p>
          </div>
          <div className="flex min-w-[260px] shrink-0 flex-col items-end gap-1.5 pt-7">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] text-primary uppercase">
              <Mail className="size-3.5" />
              {latest.newsletter.label}
            </div>
            <NewsletterForm
              className="w-full"
              inputClassName="h-auto rounded-lg border-[1.5px] border-[#d0c8e0] bg-white py-2.5 text-[13px] text-[#1a1a1a] focus-visible:border-primary"
              buttonClassName="h-auto rounded-lg px-5 py-2.5 text-[13px] font-bold hover:bg-[#6d28d9]"
            />
          </div>
        </div>

        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => {
            const override = t.home.latestPosts[i]
            return (
              <Link
                key={post.id}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group block overflow-hidden rounded-2xl border border-black/[0.04] bg-white transition-transform duration-300 hover:-translate-y-1.5"
              >
                <div className="relative h-[180px] overflow-hidden">
                  <img
                    src={post.image}
                    alt={override?.title ?? post.title}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-[9px] font-bold tracking-[0.06em] text-white uppercase">
                    {override?.category ?? post.category}
                  </span>
                </div>
                <div className="px-[22px] pt-5 pb-6">
                  <h3 className="mb-2.5 line-clamp-2 text-base font-bold tracking-[-0.01em] text-[#1a1a1a] [line-height:1.4]">
                    {override?.title ?? post.title}
                  </h3>
                  <p className="line-clamp-3 text-[13px] leading-[1.6] text-black/70">
                    {override?.excerpt ?? post.excerpt}
                  </p>
                  <span className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-primary transition-all group-hover:gap-2.5">
                    {latest.readMore}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-2 text-center">
          <Button
            variant="outline"
            render={<Link to="/blog" />}
            className="h-auto rounded-full border-[1.5px] border-primary bg-transparent px-6 py-2.5 text-[13px] font-bold tracking-[0.06em] text-primary hover:bg-primary hover:text-white dark:border-primary dark:bg-transparent dark:hover:bg-primary"
          >
            {latest.viewAll}
            <ArrowRight data-icon="inline-end" className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
