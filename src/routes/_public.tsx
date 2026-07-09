import { Outlet, createFileRoute } from "@tanstack/react-router"

import { CookieConsent } from "@/components/cookie-consent"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

/** Public site shell — header + footer around every visitor-facing page. */
export const Route = createFileRoute("/_public")({
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      {/* Clears the fixed 85px header; full-bleed heroes pull back up with -mt. */}
      <main className="flex-1 pt-[85px]">
        <Outlet />
      </main>
      <SiteFooter />
      <CookieConsent />
    </div>
  )
}
