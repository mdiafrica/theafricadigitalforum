import { env } from "@/env"
import type { Locale } from "@/lib/schemas"

export const SITE_NAME = "Africa Digital Forum"
export const SITE_URL = env.VITE_PUBLIC_SITE_URL.replace(/\/$/, "")

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/**
 * English lives on bare paths, French under /fr/ (ADR-0002). The FR home is
 * "/fr/" (with slash) — the paraglide middleware 307s "/fr" to it.
 */
export function localePath(path: string, locale: Locale): string {
  if (locale === "en") return path
  return `/fr${path}`
}

const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
}

/**
 * The alternate-language URL set for a page that exists in both languages —
 * shared by <head> hreflang links and the sitemap's xhtml:link entries so
 * they can't drift.
 */
export function hreflangAlternates(path: string) {
  return [
    { hreflang: "en", path },
    { hreflang: "fr", path: localePath(path, "fr") },
    { hreflang: "x-default", path },
  ]
}

/**
 * hreflang <link> objects for a page that exists in both languages. React
 * casing (hrefLang) — these render through HeadContent as React elements;
 * the sitemap's XML builder uses the lowercase attribute directly.
 */
export function hreflangLinks(path: string) {
  return hreflangAlternates(path).map((alt) => ({
    rel: "alternate",
    hrefLang: alt.hreflang,
    href: absoluteUrl(alt.path),
  }))
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
}: {
  title: string
  description: string
  /** UNLOCALIZED route path ("/about") — emits canonical + og:url when set. */
  path?: string
  /** Absolute or site-relative image URL for og/twitter cards. */
  image?: string | null
  type?: "website" | "article"
  /**
   * Locale of the CONTENT being served — localizes canonical/og:url and sets
   * og:locale. The FR article page serving the EN fallback body passes "en",
   * which canonicalizes it to the EN URL (ADR-0003).
   */
  locale?: Locale
  /** Emit hreflang links — pass true only when both language pages exist. */
  alternates?: boolean
}) {
  const servedPath =
    path !== undefined ? localePath(path, locale ?? "en") : undefined
  const url = servedPath !== undefined ? absoluteUrl(servedPath) : undefined
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
      ...(url ? [{ rel: "canonical", href: url }] : []),
      ...(alternates && path !== undefined ? hreflangLinks(path) : []),
    ],
  }
}
