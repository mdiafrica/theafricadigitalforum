import { Link } from "@tanstack/react-router"
import { ArrowRight, Clock } from "lucide-react"

import type { PublicPostListItem } from "@/domains/posts"
import type { Locale } from "@/lib/schemas"

export function formatPostDate(value: Date | string | null, locale: Locale) {
  if (!value) return ""
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(value))
}

export function CoverImage({
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

export function PostCard({
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
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
    >
      <div className="relative h-[200px] overflow-hidden">
        <CoverImage
          post={post}
          className="transition-transform duration-500 group-hover:scale-[1.08]"
        />
        {post.categories[0] && (
          <span
            className="absolute top-3 right-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.06em] text-white uppercase"
            style={{ backgroundColor: post.categories[0].color }}
          >
            {post.categories[0].name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2.5 line-clamp-2 text-base leading-[1.4] font-bold tracking-[-0.01em] text-ink group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-3 flex-1 text-[13px] leading-[1.6] text-ink-muted">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between border-t border-ink/5 pt-3.5 text-xs text-ink-muted/80">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {post.readTimeMin} min · {formatPostDate(post.publishedAt, locale)}
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
