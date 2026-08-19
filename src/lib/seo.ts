import { env } from "@/env"

export const SITE_NAME = "Africa Digital Forum"
export const SITE_URL = env.VITE_PUBLIC_SITE_URL.replace(/\/$/, "")

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

type SiteLocale = "en" | "fr"

/**
 * English lives on bare paths, French under /fr/ (ADR-0002). The FR home is
 * "/fr/" (with slash) — the paraglide middleware 307s "/fr" to it.
 */
export function localePath(path: string, locale: SiteLocale): string {
  if (locale === "en") return path
  return `/fr${path}`
}

const OG_LOCALES: Record<SiteLocale, string> = {
  en: "en_US",
  fr: "fr_FR",
}

/** hreflang alternates for a page that exists in both languages. */
export function hreflangLinks(path: string) {
  return [
    { rel: "alternate", hreflang: "en", href: absoluteUrl(path) },
    {
      rel: "alternate",
      hreflang: "fr",
      href: absoluteUrl(localePath(path, "fr")),
    },
    { rel: "alternate", hreflang: "x-default", href: absoluteUrl(path) },
  ]
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
  locale,
  alternates,
  canonicalPath,
}: {
  title: string
  description: string
  /** UNLOCALIZED route path ("/about") — emits canonical + og:url when set. */
  path?: string
  /** Absolute or site-relative image URL for og/twitter cards. */
  image?: string | null
  type?: "website" | "article"
  /** Locale the page is served in — localizes canonical/og:url + og:locale. */
  locale?: SiteLocale
  /** Emit hreflang links — pass true only when both language pages exist. */
  alternates?: boolean
  /**
   * Canonical override (unlocalized). Used by the FR article page serving the
   * EN fallback body: its canonical is the EN URL, not /fr/….
   */
  canonicalPath?: string
}) {
  const servedPath =
    path !== undefined ? localePath(path, locale ?? "en") : undefined
  const url = servedPath !== undefined ? absoluteUrl(servedPath) : undefined
  const canonicalUrl =
    canonicalPath !== undefined ? absoluteUrl(canonicalPath) : url
  const imageUrl = image ? absoluteUrl(image) : undefined

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      ...(locale
        ? [{ property: "og:locale", content: OG_LOCALES[locale] }]
        : []),
      ...(url ? [{ property: "og:url", content: url }] : []),
      ...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(imageUrl ? [{ name: "twitter:image", content: imageUrl }] : []),
    ],
    links: [
      ...(canonicalUrl ? [{ rel: "canonical", href: canonicalUrl }] : []),
      ...(alternates && path !== undefined ? hreflangLinks(path) : []),
    ],
  }
}
