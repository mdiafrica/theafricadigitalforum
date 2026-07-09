import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { ArrowLeft, CalendarDays, Clock } from "lucide-react"
import type { Value } from "platejs"

import { useI18n } from "@/i18n/context"
import {
  publishedPostQueryOptions,
  publishedPostsQueryOptions,
} from "@/domains/posts"
import type { Locale } from "@/lib/schemas"
import { RichTextView } from "@/components/editor/rich-text-view"
import { NewsletterForm } from "@/components/newsletter-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_public/blog/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(
      publishedPostQueryOptions(params.slug, "en")
    )
    if (!post) throw notFound()
    return { title: post.title, excerpt: post.excerpt }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    return {
      meta: [
        { title: `${loaderData.title} | Africa Digital Forum` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:type", content: "article" },
      ],
    }
  },
  component: ArticleRoute,
})

function formatDate(value: Date | string | null, locale: Locale) {
  if (!value) return ""
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "long",
  }).format(new Date(value))
}

function ArticleRoute() {
  const { slug } = Route.useParams()
  const { t, lang } = useI18n()
  const single = t.blog.singleArticle

  const postQuery = useQuery(publishedPostQueryOptions(slug, lang))
  const relatedQuery = useQuery(publishedPostsQueryOptions(lang))

  if (postQuery.isPending) {
    return (
      <main className="min-h-screen bg-[#f6f5f8] font-nav">
        <Skeleton className="h-[520px] w-full" />
        <div className="mx-auto max-w-[760px] space-y-6 px-6 py-16">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    )
  }

  const post = postQuery.data
  if (!post) throw notFound()

  const related = (relatedQuery.data ?? [])
    .filter((item) => item.slug !== slug)
    .slice(0, 3)
  const authorInitials = post.authorName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")

  return (
    <main className="min-h-screen bg-[#f6f5f8] font-nav">
      {/* Hero */}
      <section className="relative -mt-[85px] bg-[#0a0a0a]">
        <div className="relative h-[72vh] max-h-[820px] min-h-[520px] overflow-hidden">
          {post.coverUrl ? (
            <img
              src={post.coverUrl}
              alt={post.title}
              className="size-full scale-[1.02] object-cover"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-primary/40 to-[#0a0a0a]" />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_100%,rgba(124,58,237,0.22)_0%,rgba(124,58,237,0)_55%),linear-gradient(180deg,rgba(5,8,16,0.15)_0%,rgba(5,8,16,0.55)_55%,rgba(5,8,16,0.92)_100%)]" />
          <div className="absolute inset-0 flex items-end pb-[68px]">
            <div className="relative mx-auto w-full max-w-[1340px] px-6">
              <Button
                variant="outline"
                render={<Link to="/blog" />}
                className="absolute top-[30px] left-6 h-auto gap-2 rounded-full border-white/[0.16] bg-white/[0.07] px-[18px] py-2.5 text-[13px] font-semibold text-white/90 backdrop-blur-md hover:-translate-x-1 hover:border-white/30 hover:bg-white/[0.16] hover:text-white dark:border-white/[0.16] dark:bg-white/[0.07] dark:hover:bg-white/[0.16]"
              >
                <ArrowLeft className="size-4" />
                {single.backToBlog}
              </Button>

              <div className="mt-[84px] max-w-[800px]">
                {post.category && (
                  <span className="mb-[18px] inline-block rounded-full bg-primary px-3.5 py-[5px] text-[11px] font-bold tracking-[0.06em] text-white uppercase shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
                    {post.category}
                  </span>
                )}
                <h1 className="mb-[18px] line-clamp-3 text-[clamp(28px,3.8vw,46px)] leading-[1.18] font-extrabold tracking-[-0.02em] text-balance text-white">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-white/75">
                  <span className="font-semibold text-white/90">
                    {post.authorName}
                  </span>
                  <span className="text-white/40">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    {formatDate(post.publishedAt, lang)}
                  </span>
                  <span className="text-white/40">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {post.readTimeMin} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content + sidebar */}
      <section className="mx-auto max-w-[1340px] px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          {/* Article body */}
          <div>
            <div
              style={
                {
                  "--foreground": "#1a1a1a",
                  "--muted-foreground": "#444444",
                } as React.CSSProperties
              }
            >
              <RichTextView
                value={post.body as Value}
                className="article-prose"
              />
            </div>

            {/* Author bio */}
            <div className="mt-12 flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white p-6">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary ring-2 ring-primary/20">
                {authorInitials}
              </div>
              <div>
                <p className="font-bold text-[#1a1a1a]">{post.authorName}</p>
                <p className="text-sm text-[#666666]">Africa Digital Forum</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <h4 className="text-lg font-extrabold tracking-[-0.01em] text-[#1a1a1a]">
                {single.subscribeTitle}
              </h4>
              <p className="mt-2 mb-4 text-sm leading-[1.6] text-[#666666]">
                {single.subscribeText}
              </p>
              <NewsletterForm
                className="flex-col"
                inputClassName="h-auto rounded-lg border-[#e2e8f0] bg-[#f8fafc] py-2.5 text-[#1a1a1a] placeholder:text-[#a0aec0] focus-visible:border-primary focus-visible:bg-white dark:border-[#e2e8f0] dark:bg-[#f8fafc]"
                buttonClassName="h-auto w-full rounded-lg py-2.5 font-bold hover:bg-[#6d28d9]"
              />
            </div>

            {related.length > 0 && (
              <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
                <h4 className="mb-4 text-lg font-extrabold tracking-[-0.01em] text-[#1a1a1a]">
                  {single.relatedTitle}
                </h4>
                <div className="flex flex-col gap-4">
                  {related.map((rel) => (
                    <Link
                      key={rel.id}
                      to="/blog/$slug"
                      params={{ slug: rel.slug }}
                      className="group flex gap-3"
                    >
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                        {rel.coverUrl ? (
                          <img
                            src={rel.coverUrl}
                            alt={rel.title}
                            loading="lazy"
                            className="absolute inset-0 size-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-primary/5" />
                        )}
                      </div>
                      <h5 className="line-clamp-3 text-[13px] leading-[1.4] font-semibold text-[#1a1a1a] group-hover:text-primary">
                        {rel.title}
                      </h5>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
