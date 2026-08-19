import { useState } from "react"
import { Link } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"
import { getLocale, locales, setLocale } from "@/paraglide/runtime"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import Logo from "@/assets/images/Logo.png"

type Locale = (typeof locales)[number]

/** Route path paired with its nav label message. */
const NAV_ITEMS = [
  { to: "/", label: m.nav_home, exact: true },
  { to: "/about", label: m.nav_about, exact: false },
  { to: "/why-adf", label: m.nav_why_adf, exact: false },
  { to: "/host-city", label: m.nav_host_city, exact: false },
  { to: "/blog", label: m.nav_blog, exact: false },
  { to: "/contact", label: m.nav_contact, exact: false },
] as const

const LANG_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
}

function WorldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7C3AED"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[18px] shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
    </svg>
  )
}

function AboutIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function WhyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function BlogIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function ContactIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

const NAV_ICONS = {
  "/": HomeIcon,
  "/about": AboutIcon,
  "/why-adf": WhyIcon,
  "/host-city": LocationIcon,
  "/blog": BlogIcon,
  "/contact": ContactIcon,
}

export function SiteHeader() {
  const locale = getLocale()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[85px] items-center justify-between border-b border-white/[0.12] bg-black px-[5%] font-nav tracking-[0.02em]">
      <Link
        to="/"
        aria-label="Africa Digital Forum — home"
        className="flex shrink-0 items-center py-1"
      >
        <img
          src={Logo}
          alt="Africa Digital Forum"
          className="h-20 w-auto sm:h-[150px]"
        />
      </Link>

      <nav className="hidden items-center gap-10 lg:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact }}
            activeProps={{ "data-status": "active" }}
            className="group/nav relative py-1.5 text-[18px] font-medium tracking-[0.08em] text-white uppercase transition-colors hover:text-[#cccccc] data-[status=active]:font-bold data-[status=active]:text-primary"
          >
            {item.label()}
            <span className="absolute inset-x-0 -bottom-[3px] h-[2.5px] rounded-full bg-gradient-to-r from-primary to-[#a066f5] opacity-0 transition-opacity group-hover/nav:opacity-40 group-data-[status=active]/nav:opacity-100" />
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <LanguageMenu />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className="rounded-md border-white/20 bg-white/[0.08] text-lg leading-none text-white hover:border-[#cccccc] hover:bg-white/[0.14] lg:hidden dark:border-white/20 dark:bg-white/[0.08] dark:hover:bg-white/[0.14]"
              />
            }
          >
            ☰
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[85%] max-w-sm border-white/10 bg-black/95 backdrop-blur-xl sm:w-80"
          >
            <div className="mt-8 flex flex-col gap-2">
              {/* Header with close button */}
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-medium tracking-[0.2em] text-white/40 uppercase">
                  Menu
                </span>
                <SheetClose className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <CloseIcon />
                </SheetClose>
              </div>

              {NAV_ITEMS.map((item) => {
                const IconComponent = NAV_ICONS[item.to]
                return (
                  <SheetClose
                    key={item.to}
                    render={
                      <Link
                        to={item.to}
                        activeOptions={{ exact: item.exact }}
                        activeProps={{ "data-status": "active" }}
                        className={`group relative flex items-center gap-4 rounded-xl px-5 py-4 text-[15px] font-medium tracking-[0.12em] text-white/80 uppercase transition-all duration-300 ease-out hover:bg-white/10 hover:pl-7 hover:text-white data-[status=active]:bg-gradient-to-r data-[status=active]:from-primary/20 data-[status=active]:to-transparent data-[status=active]:font-bold data-[status=active]:text-white data-[status=active]:shadow-[inset_0_1px_0_rgba(124,58,237,0.3)]`}
                      >
                        {/* Active indicator dot */}
                        <span
                          className={`absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-[#a066f5] transition-all duration-300 ${item.to === window.location.pathname ? "scale-100 opacity-100" : "scale-50 opacity-0"} group-hover:scale-100 group-hover:opacity-40`}
                        />

                        {/* Icon */}
                        <span className="text-primary/60 transition-colors group-hover:text-primary/80 group-data-[status=active]/nav:text-primary">
                          <IconComponent />
                        </span>

                        {/* Label */}
                        <span className="flex-1">{item.label()}</span>

                        {/* Arrow indicator */}
                        <span
                          className={`text-xs transition-all duration-300 ${item.to === window.location.pathname ? "translate-x-0 text-primary opacity-100" : "-translate-x-2 opacity-0"} group-hover:translate-x-0 group-hover:opacity-100`}
                        >
                          →
                        </span>
                      </Link>
                    }
                  />
                )
              })}

              {/* Language selector in mobile menu */}
              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between px-5">
                  <span className="text-xs font-medium tracking-[0.2em] text-white/40 uppercase">
                    Language
                  </span>
                  <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                    {locales.map((code) => (
                      <button
                        key={code}
                        onClick={() => setLocale(code)}
                        className={`rounded-md px-4 py-1.5 text-xs font-bold tracking-wider transition-all ${
                          locale === code
                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                        } `}
                      >
                        {code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

function LanguageMenu() {
  const locale = getLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="gap-1.5 rounded-lg border-white/20 bg-white/[0.08] px-2.5 text-[11px] font-semibold tracking-[0.1em] text-white hover:border-[#cccccc] hover:bg-white/[0.14] dark:border-white/20 dark:bg-white/[0.08] dark:hover:bg-white/[0.14]"
          />
        }
      >
        <WorldIcon />
        <span className="text-[12px] font-bold">{locale.toUpperCase()}</span>
        <span className="text-[8px]">▼</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {locales.map((code) => (
          <DropdownMenuItem key={code} onClick={() => setLocale(code)}>
            <span className="w-7 font-bold">{code.toUpperCase()}</span>
            <span className="flex-1">{LANG_LABELS[code]}</span>
            {locale === code && <span className="text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
