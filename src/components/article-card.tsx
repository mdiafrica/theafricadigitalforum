import { Link } from "@tanstack/react-router"
import { ArrowRight, Clock } from "lucide-react"

import type { Post } from "@/data/posts"
import { categoryColor } from "@/data/category-colors"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

/** Optional per-locale overrides for card copy (home page uses these). */
type Overrides = { title?: string; excerpt?: string; category?: string }

export function ArticleCard({
  post,
  overrides,
  readMoreLabel = "Read More",
}: {
  post: Post
  overrides?: Overrides
  readMoreLabel?: string
}) {
  const title = overrides?.title ?? post.title
  const excerpt = overrides?.excerpt ?? post.excerpt
  const category = overrides?.category ?? post.category
  const color = categoryColor(post.category)

  return (
    <Card className="group h-full overflow-hidden border-border bg-card py-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className="flex h-full flex-col"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={post.image}
            alt={title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          <span
            className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white backdrop-blur"
            style={{
              backgroundColor: `color-mix(in oklab, ${color} 85%, transparent)`,
            }}
          >
            {category}
          </span>
        </div>

        <CardContent className="flex flex-1 flex-col px-5 pt-5">
          <h3 className="font-heading text-lg leading-snug font-bold text-balance transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between px-5 pb-5">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {post.readTime}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {readMoreLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </CardFooter>
      </Link>
    </Card>
  )
}
