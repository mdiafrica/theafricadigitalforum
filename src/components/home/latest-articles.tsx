import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Mail, Newspaper } from "lucide-react"

import { useI18n } from "@/i18n/context"
import { publishedPostsQueryOptions } from "@/domains/posts"
import type { PublicPostListItem } from "@/domains/posts"
import { Button } from "@/components/ui/button"
import { EmptyCard } from "@/components/empty-card"
import { NewsletterForm } from "@/components/newsletter-form"
import { CoverImage } from "@/components/post-card"
import { Skeleton } from "@/components/ui/skeleton"

export function LatestArticles() {
  const { t, lang } = useI18n()
  const latest = t.home.latest
  const postsQuery = useQuery(publishedPostsQueryOptions(lang))
  const posts = (postsQuery.data ?? []).slice(0, 3)

  return (
    <section className="bg-[#f5f5f5] px-[5%] py-20 font-nav">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-10">
          <div className="min-w-[min(280px,100%)] flex-1">
            <h2 className="mb-2 text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.02em] text-[#1a1a1a] after:mt-3 after:block after:h-[3px] after:w-11 after:rounded-sm after:bg-primary">
              {latest.title}
            </h2>
            <p className="max-w-[560px] text-sm leading-[1.6] text-black/60">
              {latest.subtitle}
            </p>
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-[260px] sm:items-end sm:pt-7">
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

        {postsQuery.isPending ? (
          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-[320px] rounded-2xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyCard icon={Newspaper}>{t.blog.empty}</EmptyCard>
        ) : (
          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <HomeArticleCard
                key={post.id}
                post={post}
                readMoreLabel={latest.readMore}
              />
            ))}
          </div>
        )}

        {posts.length > 0 && (
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
        )}
      </div>
    </section>
  )
}

/** Compact card for the home page — lighter than the blog's PostCard. */
function HomeArticleCard({
  post,
  readMoreLabel,
}: {
  post: PublicPostListItem
  readMoreLabel: string
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group block overflow-hidden rounded-2xl border border-ink/5 bg-white transition-transform duration-300 hover:-translate-y-1.5"
    >
      <div className="relative h-[180px] overflow-hidden">
        <CoverImage
          post={post}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {post.categories[0] && (
          <span
            className="absolute top-3 right-3 rounded-full px-3 py-1 text-[9px] font-bold tracking-[0.06em] text-white uppercase"
            style={{ backgroundColor: post.categories[0].color }}
          >
            {post.categories[0].name}
          </span>
        )}
      </div>
      <div className="px-[22px] pt-5 pb-6">
        <h3 className="mb-2.5 line-clamp-2 text-base [line-height:1.4] font-bold tracking-[-0.01em] text-ink">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-[13px] leading-[1.6] text-ink/70">
          {post.excerpt}
        </p>
        <span className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-primary transition-all group-hover:gap-2.5">
          {readMoreLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}
