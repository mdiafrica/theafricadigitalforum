# Africa Digital Forum — Frontend

Marketing site for the Africa Digital Forum (ADF), rebuilt on a modern full‑stack
React foundation.

## Stack

- **[TanStack Start](https://tanstack.com/start)** — full‑stack React framework (SSR + server functions)
- **[TanStack Router](https://tanstack.com/router)** — type‑safe file‑based routing
- **React 19** + **TypeScript**
- **Tailwind CSS v4** with **[shadcn/ui](https://ui.shadcn.com)** (`base-nova` style, base‑ui primitives)
- **lucide-react** icons (brand/social glyphs are inline SVGs in `src/components/brand-icons.tsx` — lucide dropped brand icons in v1)
- Self‑hosted fonts via Fontsource: **Syne** (headings) + **Geist** (body)

## Getting started

```bash
pnpm install
pnpm dev        # dev server on http://localhost:3000
pnpm build      # production build
pnpm typecheck  # tsc --noEmit
```

## Project layout

```
src/
  routes/            file-based routes (/, /about, /why-adf, /host-city,
                     /blog, /blog/$slug, /contact) + __root shell
  components/        SiteHeader, SiteFooter, ArticleCard, motion, section-heading,
                     page-hero, brand-icons, home/* sections, ui/* (shadcn)
  i18n/              EN/FR translation tree + React context provider
  data/              posts, speakers, category colors
  lib/server/        TanStack server functions (newsletter, contact)
  styles.css         Tailwind + ADF dark theme tokens (deep navy + violet/blue)
```

## Notes

- The site is a committed **dark theme** (deep navy + violet accents); the palette
  lives in `src/styles.css`.
- **Bilingual (EN/FR):** language auto‑detects Francophone‑Africa timezones and
  persists to `localStorage`. All page copy lives under `src/i18n/`.
- **Server functions** (`src/lib/server/forms.ts`) validate the newsletter and
  contact submissions server‑side. They currently acknowledge input; wiring them
  to real persistence / email is the job of the forthcoming admin backend.
- `vite.config.ts` sets `ssr.noExternal: ["@base-ui/react"]` and dedupes React —
  required so base‑ui components (Field/Input/Dialog) resolve a single React
  instance during SSR.
