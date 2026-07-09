import { useState } from "react"
import { Link } from "@tanstack/react-router"

import { useI18n } from "@/i18n/context"
import { LANGUAGES, type Lang } from "@/i18n"
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

/** Route path paired with the index of its label in the `nav` i18n array. */
const NAV_ITEMS = [
  { to: "/", labelIndex: 0, exact: true },
  { to: "/about", labelIndex: 1, exact: false },
  { to: "/why-adf", labelIndex: 2, exact: false },
  { to: "/host-city", labelIndex: 3, exact: false },
  { to: "/blog", labelIndex: 4, exact: false },
  { to: "/contact", labelIndex: 5, exact: false },
] as const

const LANG_LABELS: Record<Lang, string> = {
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

export function SiteHeader() {
  const { t, lang, setLang } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navLabels = t.nav

  return (
    <header className="fixed inset-x-0 top-0 z-[200] flex h-[85px] items-center justify-between border-b border-white/[0.12] bg-black px-[5%] font-nav tracking-[0.02em]">
      <Link
        to="/"
        aria-label="Africa Digital Forum — home"
        className="flex shrink-0 items-center py-1"
      >
        <img src={Logo} alt="Africa Digital Forum" className="h-[110px] w-auto" />
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
            {navLabels[item.labelIndex]}
            <span className="absolute inset-x-0 -bottom-[3px] h-[2.5px] rounded-full bg-gradient-to-r from-primary to-[#a066f5] opacity-0 transition-opacity group-hover/nav:opacity-40 group-data-[status=active]/nav:opacity-100" />
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <LanguageMenu lang={lang} onSelect={setLang} />

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
          <SheetContent side="right" className="w-72 border-white/10 bg-black">
            <nav className="mt-6 flex flex-col gap-1 px-4">
              {NAV_ITEMS.map((item) => (
                <SheetClose
                  key={item.to}
                  render={
                    <Link
                      to={item.to}
                      activeOptions={{ exact: item.exact }}
                      activeProps={{ "data-status": "active" }}
                      className="rounded-r-md border-l-[3px] border-transparent px-4 py-3 text-sm font-medium tracking-[0.1em] text-white uppercase transition-colors hover:bg-white/[0.08] data-[status=active]:border-primary data-[status=active]:bg-white/[0.08] data-[status=active]:font-bold data-[status=active]:text-primary"
                    >
                      {navLabels[item.labelIndex]}
                    </Link>
                  }
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

function LanguageMenu({
  lang,
  onSelect,
}: {
  lang: Lang
  onSelect: (l: Lang) => void
}) {
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
        <span className="text-[12px] font-bold">{lang.toUpperCase()}</span>
        <span className="text-[8px]">▼</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {LANGUAGES.map((code) => (
          <DropdownMenuItem key={code} onClick={() => onSelect(code)}>
            <span className="w-7 font-bold">{code.toUpperCase()}</span>
            <span className="flex-1">{LANG_LABELS[code]}</span>
            {lang === code && <span className="text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
