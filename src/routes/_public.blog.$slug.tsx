import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { ArrowLeft, CalendarDays, Clock } from "lucide-react"
import type { Value } from "platejs"

import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"
import {
  publishedPostCategoriesQueryOptions,
  publishedPostQueryOptions,
  relatedPostsQueryOptions,
} from "@/domains/posts"
import type { Locale } from "@/lib/schemas"
import { absoluteUrl, localePath, pageHead } from "@/lib/seo"
import { RichTextView } from "@/components/editor/rich-text-view"
import { NewsletterForm } from "@/components/newsletter-form"
import { PostCard, formatPostDate } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_public/blog/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(
      publishedPostQueryOptions(params.slug, getLocale())
    )
    if (!post) throw notFound()
    return {
      title: post.title,
      excerpt: post.excerpt,
      coverUrl: post.coverUrl,
      authorName: post.byline.name,
      isBoard: post.byline.isBoard,
      publishedAt: post.publishedAt,
      servedLocale: post.servedLocale,
      hasPublishedFr: post.hasPublishedFr,
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {}
    const path = `/blog/${params.slug}`
    // The FR URL serving the EN fallback body is a duplicate of the EN page:
    // describe the CONTENT locale, which canonicalizes it to the bare URL,
    // sets og:locale en_US, and claims no FR alternate (ADR-0003).
    const contentLocale =
      getLocale() === "fr" && loaderData.servedLocale === "en"
        ? "en"
        : getLocale()
    return {
      ...pageHead({
        title: `${loaderData.title} | Africa Digital Forum`,
        description: loaderData.excerpt,
        path,
        image: loaderData.coverUrl,
        type: "article",
        locale: contentLocale,
        alternates: loaderData.hasPublishedFr,
      }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            description: loaderData.excerpt,
            ...(loaderData.coverUrl
              ? { image: absoluteUrl(loaderData.coverUrl) }
              : {}),
            author: {
              "@type": loaderData.isBoard ? "Organization" : "Person",
              name: loaderData.authorName,
            },
            publisher: {
              "@type": "Organization",
              name: "Africa Digital Forum",
            },
            ...(loaderData.publishedAt
              ? {
                  datePublished: new Date(loaderData.publishedAt).toISOString(),
                }
              : {}),
            mainEntityOfPage: absoluteUrl(localePath(path, contentLocale)),
          }),
        },
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
  const lang = getLocale()

  const postQuery = useQuery(publishedPostQueryOptions(slug, lang))
  const relatedQuery = useQuery(relatedPostsQueryOptions(slug, lang))
  const categoriesQuery = useQuery(publishedPostCategoriesQueryOptions(lang))

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

  const related = relatedQuery.data?.related ?? []
  const more = relatedQuery.data?.more ?? []
  const allCategories = categoriesQuery.data ?? []
  const authorInitials = post.byline.name
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
              className="size-full scale-[1.01] object-cover [object-position:center_40%]"
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
                {m.blog_single_article_back_to_blog()}
              </Button>

              <div className="mt-[84px] max-w-[800px]">
                {post.categories.length > 0 && (
                  <div className="mb-[18px] flex flex-wrap gap-2">
                    {post.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-block rounded-full px-3.5 py-[5px] text-[11px] font-bold tracking-[0.06em] text-white uppercase shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="mb-4 line-clamp-3 text-[clamp(22px,2.8vw,38px)] leading-[1.12] font-extrabold tracking-[-0.02em] text-balance text-white max-[900px]:text-[clamp(20px,4.5vw,32px)]">
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
          {/* Article card (legacy contentMain) */}
          <div className="rounded-[22px] border border-primary/[0.06] bg-white p-7 shadow-[0_1px_2px_rgba(20,10,40,0.04),0_12px_32px_rgba(20,10,40,0.05)] sm:p-10 lg:px-14 lg:py-12">
            {post.categories[0] && (
              <div
                className="mb-5 text-xs font-bold tracking-[0.08em] uppercase"
                style={{ color: post.categories[0].color }}
              >
                {post.categories[0].name}
              </div>
            )}

            <div
              // The body can be the EN fallback on a French page (ADR-0003);
              // mark the mixed-language region for assistive tech + search.
              lang={post.servedLocale}
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
            <div className="mt-12 flex items-start gap-4 rounded-2xl border border-black/[0.06] bg-[#faf9fc] p-6">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary ring-2 ring-primary/20">
                {authorInitials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#1a1a1a]">{post.byline.name}</p>
                <p className="mt-1 text-sm leading-[1.65] text-[#555555]">
                  {post.byline.bio ?? "Africa Digital Forum"}
                </p>
              </div>
            </div>

            {/* Topics */}
            {post.categories.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2.5 border-t border-black/[0.06] pt-6">
                <span className="text-sm font-bold text-[#1a1a1a]">
                  {m.blog_single_article_topics_label()}
                </span>
                {post.categories.map((category) => (
                  <Link
                    key={category.id}
                    to="/blog"
                    className="rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                    style={{
                      borderColor: category.color,
                      color: category.color,
                    }}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <h4 className="text-lg font-extrabold tracking-[-0.01em] text-[#1a1a1a]">
                {m.blog_single_article_subscribe_title()}
              </h4>
              <p className="mt-2 mb-4 text-sm leading-[1.6] text-[#666666]">
                {m.blog_single_article_subscribe_text()}
              </p>
              <NewsletterForm
                className="flex-col"
                inputClassName="h-auto rounded-lg border-[#e2e8f0] bg-[#f8fafc] py-2.5 text-[#1a1a1a] placeholder:text-[#a0aec0] focus-visible:border-primary focus-visible:bg-white dark:border-[#e2e8f0] dark:bg-[#f8fafc]"
                buttonClassName="h-auto w-full rounded-lg py-2.5 font-bold hover:bg-[#6d28d9]"
              />
            </div>

            {allCategories.length > 0 && (
              <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
                <h4 className="mb-4 text-lg font-extrabold tracking-[-0.01em] text-[#1a1a1a]">
                  {m.blog_single_article_categories_title()}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((category) => (
                    <Link
                      key={category.id}
                      to="/blog"
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                      style={{
                        borderColor: category.color,
                        color: category.color,
                      }}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
                <h4 className="mb-4 text-lg font-extrabold tracking-[-0.01em] text-[#1a1a1a]">
                  {m.blog_single_article_related_title()}
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
                      <div className="min-w-0">
                        <h5 className="line-clamp-2 text-[13px] leading-[1.4] font-semibold text-[#1a1a1a] group-hover:text-primary">
                          {rel.title}
                        </h5>
                        <p className="mt-1 text-[11px] text-[#999999]">
                          {formatPostDate(rel.publishedAt, lang)} ·{" "}
                          {rel.readTimeMin} min
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/blog"
                  className="mt-5 inline-flex items-center gap-1.5 border-t border-black/[0.06] pt-4 text-[13px] font-bold text-primary hover:underline"
                >
                  {m.blog_single_article_view_all()} →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* More from the blog */}
      {more.length > 0 && (
        <section className="mx-auto max-w-[1340px] px-6 pb-20">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-[22px] w-1 shrink-0 rounded-sm bg-primary" />
              <h2 className="text-[clamp(20px,2.5vw,26px)] font-extrabold tracking-[-0.01em] text-[#1a1a1a]">
                {m.blog_single_article_more_title()}
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-[13px] font-bold text-primary hover:underline"
            >
              {m.blog_single_article_view_all()} →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {more.map((item) => (
              <PostCard
                key={item.id}
                post={item}
                locale={lang}
                readMoreLabel={m.blog_single_article_read_more()}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
