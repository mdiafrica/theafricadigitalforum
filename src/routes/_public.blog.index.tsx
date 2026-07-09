import { useMemo, useRef, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight, Clock, Mail, Search, X } from "lucide-react"

import { useI18n } from "@/i18n/context"
import {
  publishedPostCategoriesQueryOptions,
  publishedPostsQueryOptions,
  type PublicListParams,
  type PublicPostListItem,
} from "@/domains/posts"
import type { Locale } from "@/lib/schemas"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { NewsletterForm } from "@/components/newsletter-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_public/blog/")({
  head: () => ({
    meta: [
      { title: "Blog | Africa Digital Forum" },
      {
        name: "description",
        content: "News, insights and stories from the Africa Digital Forum.",
      },
      { property: "og:title", content: "Blog | Africa Digital Forum" },
      {
        property: "og:description",
        content: "News, insights and stories from the Africa Digital Forum.",
      },
    ],
  }),
  // SSR primes the default locale; a client-side locale switch refetches.
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(publishedPostsQueryOptions("en")),
      context.queryClient.ensureQueryData(
        publishedPostCategoriesQueryOptions("en")
      ),
    ]),
  component: BlogRoute,
})

function formatDate(value: Date | string | null, locale: Locale) {
  if (!value) return ""
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(value))
}

const ALL_CATEGORIES = "All"

function BlogRoute() {
  const { t, lang } = useI18n()
  const blog = t.blog
  const newsletterRef = useRef<HTMLDivElement>(null)

  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebouncedValue(query.trim(), 300)

  const isFiltering = category !== ALL_CATEGORIES || debouncedQuery !== ""
  const params: PublicListParams | undefined = isFiltering
    ? {
        category: category === ALL_CATEGORIES ? undefined : category,
        query: debouncedQuery || undefined,
      }
    : undefined

  const postsQuery = useQuery({
    ...publishedPostsQueryOptions(lang, params),
    placeholderData: keepPreviousData,
  })
  const posts = useMemo(() => postsQuery.data ?? [], [postsQuery.data])

  const categoriesQuery = useQuery(publishedPostCategoriesQueryOptions(lang))
  const categories = useMemo(
    () => [ALL_CATEGORIES, ...(categoriesQuery.data ?? [])],
    [categoriesQuery.data]
  )

  const featured = isFiltering ? undefined : posts[0]
  const sidebar = isFiltering ? [] : posts.slice(1, 4)

  return (
    <main className="bg-[#f5f5f5] font-nav">
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Page header */}
        <div className="mt-3 mb-9 flex flex-wrap justify-between gap-8">
          <div className="min-w-[260px] flex-1">
            <h1 className="mt-7 mb-2 text-[clamp(28px,4vw,44px)] leading-[1.1] font-extrabold tracking-[-0.02em] text-[#1a1a1a]">
              {blog.pageTitle}
            </h1>
            <p className="max-w-[540px] text-[15px] leading-[1.6] text-[#666666]">
              {blog.pageSub}
            </p>
          </div>
          <div className="shrink-0 sm:mt-[70px]">
            <Button
              onClick={() =>
                newsletterRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="h-auto gap-2 rounded-full px-[22px] py-2.5 text-[13px] font-bold shadow-[0_4px_12px_rgba(124,58,237,0.25)] hover:bg-[#6d28d9]"
            >
              <Mail className="size-4" />
              {blog.subscribeBtn ?? "Subscribe"}
            </Button>
          </div>
        </div>

        {/* Hero grid: featured + sidebar */}
        {featured && (
          <div
            className={`mt-5 mb-14 grid gap-5 ${sidebar.length > 0 ? "lg:grid-cols-[1fr_380px]" : ""}`}
          >
            <FeaturedCard
              post={featured}
              locale={lang}
              readMore={blog.featured.readMore}
            />
            {sidebar.length > 0 && (
              <div className="flex flex-col gap-1">
                {sidebar.map((post) => (
                  <SideStory key={post.id} post={post} locale={lang} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Articles section header */}
        <div className="mb-7">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="h-[22px] w-1 shrink-0 rounded-sm bg-primary" />
            <h2 className="text-[clamp(20px,2.5vw,26px)] font-extrabold tracking-[-0.01em] text-[#1a1a1a]">
              {blog.sectionTitle}
            </h2>
            <div className="relative ml-auto max-w-[260px]">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#888888]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={blog.searchPlaceholder}
                aria-label={blog.searchPlaceholder}
                className="h-auto rounded-full border-[#e8e8e8] bg-white py-2 pr-9 pl-10 text-[13px] text-[#1a1a1a] placeholder:text-[#888888] focus-visible:border-primary dark:border-[#e8e8e8] dark:bg-white"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-1.5 size-6 -translate-y-1/2 rounded-full bg-[#f0edf7] text-primary hover:bg-primary hover:text-white dark:hover:bg-primary"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = category === cat
                return (
                  <Button
                    key={cat}
                    variant={active ? "default" : "outline"}
                    onClick={() => setCategory(cat)}
                    className={
                      active
                        ? "h-auto rounded-full px-4 py-[7px] text-xs font-semibold"
                        : "h-auto rounded-full border-[#e8e8e8] bg-white px-4 py-[7px] text-xs font-semibold text-[#666666] hover:border-primary hover:text-primary dark:border-[#e8e8e8] dark:bg-white dark:hover:bg-white"
                    }
                  >
                    {cat}
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        {/* Grid */}
        {postsQuery.isPending ? (
          <div className="grid gap-6 pb-16 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="aspect-[16/12] w-full rounded-2xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="mb-16 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#d8d8d8] bg-white py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#f0edf7] text-primary">
              <Search className="size-5" />
            </div>
            <p className="max-w-sm text-sm text-[#666666]">{blog.noResults}</p>
          </div>
        ) : (
          <div className="grid gap-6 pb-16 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                locale={lang}
                readMoreLabel={blog.featured.readMore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Newsletter */}
      <div ref={newsletterRef} className="bg-white px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            {blog.newsletter.eyebrow}
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-[-0.02em] text-[#1a1a1a] sm:text-4xl">
            {blog.newsletter.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#666666]">
            {blog.newsletter.sub}
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <NewsletterForm
              inputClassName="h-auto rounded-lg border-[#e2e8f0] bg-[#f8fafc] py-2.5 text-[#1a1a1a] placeholder:text-[#a0aec0] focus-visible:border-primary focus-visible:bg-white dark:border-[#e2e8f0] dark:bg-[#f8fafc]"
              buttonClassName="h-auto rounded-lg px-5 py-2.5 font-bold hover:bg-[#6d28d9]"
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function CoverImage({
  post,
  className,
}: {
  post: PublicPostListItem
  className?: string
}) {
  if (!post.coverUrl) {
    return (
      <div
        className={`absolute inset-0 size-full bg-gradient-to-br from-primary/25 via-primary/10 to-white ${className ?? ""}`}
      />
    )
  }
  return (
    <img
      src={post.coverUrl}
      alt={post.title}
      loading="lazy"
      className={`absolute inset-0 size-full object-cover ${className ?? ""}`}
    />
  )
}

function FeaturedCard({
  post,
  locale,
  readMore,
}: {
  post: PublicPostListItem
  locale: Locale
  readMore: string
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group relative flex min-h-[420px] items-end overflow-hidden rounded-[14px] lg:min-h-[480px]"
    >
      <CoverImage
        post={post}
        className="transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(5,13,26,0.08)] to-[rgba(5,13,26,0.92)]" />
      <div className="relative z-10 p-8 sm:p-9">
        {post.category && (
          <span className="mb-3.5 inline-block rounded-full bg-primary px-3.5 py-1 text-[11px] font-bold tracking-[0.5px] text-white">
            {post.category}
          </span>
        )}
        <h2 className="mb-3 text-[clamp(20px,2.4vw,28px)] leading-[1.3] font-extrabold tracking-[-0.02em] text-white">
          {post.title}
        </h2>
        <p className="mb-4 line-clamp-2 max-w-2xl text-sm leading-[1.7] text-white/[0.72]">
          {post.excerpt}
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-white/70">
          <span className="font-semibold text-white/90">{post.authorName}</span>
          <span className="text-white/40">·</span>
          <span>{formatDate(post.publishedAt, locale)}</span>
          <span className="text-white/40">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {post.readTimeMin} min
          </span>
        </div>
        <span className="inline-flex items-center gap-2 rounded border border-white/30 bg-white/15 px-[22px] py-2.5 text-[13px] font-bold text-white backdrop-blur transition-colors group-hover:border-primary group-hover:bg-primary">
          {readMore}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

function SideStory({
  post,
  locale,
}: {
  post: PublicPostListItem
  locale: Locale
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex flex-1 items-center gap-3.5 rounded-[10px] border border-[#e8e8e8] bg-white p-4 transition-all duration-300 hover:translate-x-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
    >
      <div className="relative size-[90px] shrink-0 overflow-hidden rounded-[7px]">
        <CoverImage
          post={post}
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1">
        {post.category && (
          <span className="text-[10px] font-bold tracking-[0.06em] text-primary uppercase">
            {post.category}
          </span>
        )}
        <h3 className="line-clamp-2 text-[13px] leading-[1.4] font-bold text-[#1a1a1a] group-hover:text-primary">
          {post.title}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#999999]">
          <Clock className="size-3" />
          {post.readTimeMin} min · {formatDate(post.publishedAt, locale)}
        </span>
      </div>
    </Link>
  )
}

function PostCard({
  post,
  locale,
  readMoreLabel,
}: {
  post: PublicPostListItem
  locale: Locale
  readMoreLabel: string
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
    >
      <div className="relative h-[200px] overflow-hidden">
        <CoverImage
          post={post}
          className="transition-transform duration-500 group-hover:scale-[1.08]"
        />
        {post.category && (
          <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-[0.06em] text-white uppercase">
            {post.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2.5 line-clamp-2 text-base leading-[1.4] font-bold tracking-[-0.01em] text-[#1a1a1a] group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-3 flex-1 text-[13px] leading-[1.6] text-[#666666]">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between border-t border-[#f0f0f0] pt-3.5 text-xs text-[#888888]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {post.readTimeMin} min · {formatDate(post.publishedAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-primary transition-all group-hover:gap-2">
            {readMoreLabel}
            <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
