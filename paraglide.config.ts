/**
 * Single source of truth for paraglide compiler options — imported by both
 * vite.config.ts (dev/build) and scripts/compile-paraglide.ts (typecheck/CI),
 * so the strategy and URL patterns can't drift between the two.
 *
 * See docs/adr/0002-url-prefix-locale-routing.md for why URL-prefix + these
 * strategy semantics were chosen.
 */

import type { CompilerOptions } from "@inlang/paraglide-js"

// Surfaces that are never localized: admin, auth pages, API + server-fn
// endpoints, and the sitemap keep one URL for every locale. The identity
// `localized` entries make localizeUrl/deLocalizeUrl no-ops there, so the
// server middleware never redirects them.
const NON_LOCALIZED =
  "/:prefix(admin|api|_serverFn|_server|sign-in|forgot-password|reset-password|accept-invitation|sitemap\\.xml)/:rest(.*)?"

export const paraglideOptions: CompilerOptions = {
  project: "./project.inlang",
  outdir: "./src/paraglide",
  // .d.ts output so tsc can typecheck against the generated runtime.
  emitTsDeclarations: true,
  // Order matters: cookie (remembered choice) and Accept-Language (first
  // visit) outrank the URL, which is what makes the middleware 302 bare URLs
  // to /fr/… for French-preference visitors. Crawlers send neither, so they
  // crawl both URL trees without redirects.
  strategy: ["cookie", "preferredLanguage", "url", "baseLocale"],
  urlPatterns: [
    {
      pattern: NON_LOCALIZED,
      localized: [
        ["en", NON_LOCALIZED],
        ["fr", NON_LOCALIZED],
      ],
    },
    // English lives on bare paths, French under /fr/. FR first so locale
    // extraction tests the prefixed pattern before the catch-all.
    {
      pattern: "/:path(.*)?",
      localized: [
        ["fr", "/fr/:path(.*)?"],
        ["en", "/:path(.*)?"],
      ],
    },
  ],
}
