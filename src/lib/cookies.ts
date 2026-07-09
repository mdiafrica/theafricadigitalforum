/** Cookie helpers + consent storage (ported from the original site). */

export type CookieCategory = "essential" | "analytics" | "preference" | "marketing"
export type CookiePreferences = Record<CookieCategory, boolean>
export type ConsentType = "all" | "essential" | "custom"

export type CookieConsent = {
  preferences: CookiePreferences
  type: ConsentType
  timestamp: string
}

const CONSENT_KEY = "adf_cookie_consent"

export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export function getCookie(name: string): string {
  if (typeof document === "undefined") return ""
  return document.cookie.split("; ").reduce((result, pair) => {
    const [key, ...rest] = pair.split("=")
    return key === name ? decodeURIComponent(rest.join("=")) : result
  }, "")
}

export function eraseCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function getCookieConsent(): CookieConsent | null {
  const raw = getCookie(CONSENT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CookieConsent
  } catch {
    return null
  }
}

export function saveCookieConsent(preferences: CookiePreferences, type: ConsentType) {
  setCookie(
    CONSENT_KEY,
    JSON.stringify({
      preferences,
      type,
      timestamp: new Date().toISOString(),
    } satisfies CookieConsent),
    365
  )
}

export function resetCookieConsent() {
  eraseCookie(CONSENT_KEY)
}

export function isCategoryAllowed(category: CookieCategory): boolean {
  if (category === "essential") return true
  return getCookieConsent()?.preferences[category] ?? false
}

export function getCookieCount(): number {
  if (typeof document === "undefined") return 0
  return document.cookie.split(";").filter((c) => c.trim()).length
}
