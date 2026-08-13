import { env } from "@/env"

export const SITE_NAME = "Africa Digital Forum"
export const SITE_URL = env.VITE_PUBLIC_SITE_URL.replace(/\/$/, "")

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/**
 * Standard head() payload for a public page: title/description, canonical,
 * Open Graph and Twitter tags. Spread the result in a route's head().
 */
export function pageHead({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string
  description: string
  /** Route path ("/about") — emits canonical + og:url when set. */
  path?: string
  /** Absolute or site-relative image URL for og/twitter cards. */
  image?: string | null
  type?: "website" | "article"
}) {
  const url = path !== undefined ? absoluteUrl(path) : undefined
  const imageUrl = image ? absoluteUrl(image) : undefined

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      ...(url ? [{ property: "og:url", content: url }] : []),
      ...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(imageUrl ? [{ name: "twitter:image", content: imageUrl }] : []),
    ],
    links: url ? [{ rel: "canonical", href: url }] : [],
  }
}
