import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { i18n, LANGUAGES, type Lang, type Translation } from "./index"

type I18nValue = {
  lang: Lang
  t: Translation
  setLang: (lang: Lang) => void
}

const I18nContext = createContext<I18nValue | null>(null)

const STORAGE_KEY = "adf-lang"

// Francophone-Africa timezones — visitors there default to French (ported from
// the original app's auto-detect).
const FRENCH_TIMEZONES = new Set([
  "Africa/Abidjan",
  "Africa/Ouagadougou",
  "Africa/Porto-Novo",
  "Africa/Lome",
  "Africa/Dakar",
  "Africa/Bamako",
  "Africa/Conakry",
  "Africa/Bissau",
  "Africa/Niamey",
  "Africa/Ndjamena",
  "Africa/Bangui",
  "Africa/Douala",
  "Africa/Libreville",
  "Africa/Malabo",
  "Africa/Brazzaville",
  "Africa/Kinshasa",
  "Africa/Bujumbura",
  "Africa/Tunis",
  "Africa/Algiers",
  "Africa/Casablanca",
  "Indian/Antananarivo",
])

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Server + first client render must agree, so start from a stable default and
  // resolve the real preference after mount.
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
      if (stored && LANGUAGES.includes(stored)) {
        setLangState(stored)
        return
      }
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (FRENCH_TIMEZONES.has(tz)) setLangState("fr")
    } catch {
      /* ignore access errors */
    }
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18nValue>(
    () => ({ lang, t: i18n[lang], setLang }),
    [lang, setLang]
  )

  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n(): I18nValue {
  const ctx = use(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider")
  return ctx
}
