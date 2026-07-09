import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  BarChart3,
  Check,
  ChevronUp,
  Cookie,
  FileText,
  Info,
  Languages,
  Loader2,
  Lock,
  Megaphone,
  RotateCcw,
  Save,
  Settings2,
  Shield,
  X,
  type LucideIcon,
} from "lucide-react"

import {
  getCookieConsent,
  getCookieCount,
  resetCookieConsent,
  saveCookieConsent,
  type CookieCategory,
  type CookiePreferences,
} from "@/lib/cookies"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

type Category = {
  id: CookieCategory
  label: string
  description: string
  icon: LucideIcon
  alwaysOn: boolean
}

const CATEGORIES: Category[] = [
  {
    id: "essential",
    label: "Essential",
    description:
      "Necessary for the technical operation and security of the site. Cannot be disabled.",
    icon: Shield,
    alwaysOn: true,
  },
  {
    id: "analytics",
    label: "Analytical",
    description:
      "Allow us to measure audience and understand which sections (e.g., Startup Village, AI Arena) interest our visitors.",
    icon: BarChart3,
    alwaysOn: false,
  },
  {
    id: "preference",
    label: "Preference",
    description:
      "Used for automatic language detection (French/English) based on your geolocation.",
    icon: Languages,
    alwaysOn: false,
  },
  {
    id: "marketing",
    label: "Marketing",
    description:
      "Allow us to track the effectiveness of our campaigns for recruiting sponsors and speakers.",
    icon: Megaphone,
    alwaysOn: false,
  },
]

const DEFAULT_PREFERENCES = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat.alwaysOn
  return acc
}, {} as CookiePreferences)

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false)
  const [showDetails, setShowDetails] = React.useState(false)
  const [preferences, setPreferences] =
    React.useState<CookiePreferences>(DEFAULT_PREFERENCES)
  const [isSaving, setIsSaving] = React.useState(false)
  const [cookieCount, setCookieCount] = React.useState(0)

  React.useEffect(() => {
    setCookieCount(getCookieCount())
    if (getCookieConsent()) return
    const timer = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const save = (prefs: CookiePreferences, type: "all" | "essential" | "custom") => {
    setIsSaving(true)
    saveCookieConsent(prefs, type)
    setTimeout(() => {
      setVisible(false)
      setIsSaving(false)
    }, 400)
  }

  const acceptAll = () =>
    save(
      CATEGORIES.reduce((acc, cat) => {
        acc[cat.id] = true
        return acc
      }, {} as CookiePreferences),
      "all"
    )

  const rejectNonEssential = () => save(DEFAULT_PREFERENCES, "essential")

  const toggle = (category: Category) => {
    if (category.alwaysOn) return
    setPreferences((prev) => ({ ...prev, [category.id]: !prev[category.id] }))
  }

  const resetConsent = () => {
    resetCookieConsent()
    window.location.reload()
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie Consent"
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/30 p-5 duration-300 animate-in fade-in"
    >
      <div className="w-full max-w-[720px] duration-300 animate-in slide-in-from-bottom-4">
        <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-primary/[0.08] bg-white p-6 text-[#1a1a1a] shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-7">
          {/* Header */}
          <div className="mb-4 flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/[0.05] text-primary">
              <Cookie className="size-6" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-bold tracking-[-0.02em] text-[#1a1a1a]">
                🍪 Cookie Preferences
              </h3>
              <p className="text-sm leading-[1.6] text-[#4b5563]">
                We use cookies to enhance your experience on the Africa Digital
                Forum platform. Choose your preferences below.
              </p>
            </div>
          </div>

          {/* Cookie badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.06] px-4 py-1 text-xs font-medium text-[#6b21a5]">
            <Info className="size-3.5 text-primary" />
            <span>{cookieCount} active cookies on this site</span>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={acceptAll}
              disabled={isSaving}
              className="h-11 min-w-[120px] flex-1 gap-2 rounded-[10px] bg-gradient-to-br from-primary to-[#6d28d9] font-semibold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:opacity-90 dark:from-primary dark:to-[#6d28d9] dark:text-white"
            >
              <Check className="size-4" />
              Accept All
            </Button>
            <Button
              onClick={rejectNonEssential}
              disabled={isSaving}
              className="h-11 min-w-[120px] flex-1 gap-2 rounded-[10px] bg-[#f3f4f6] font-semibold text-[#1a1a1a] hover:bg-[#e5e7eb] dark:bg-[#f3f4f6] dark:text-[#1a1a1a] dark:hover:bg-[#e5e7eb]"
            >
              <X className="size-4" />
              Reject Non-Essential
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDetails((s) => !s)}
              disabled={isSaving}
              className="h-11 min-w-[120px] flex-1 gap-2 rounded-[10px] border-2 border-primary/20 bg-transparent font-semibold text-primary hover:bg-primary/[0.06] hover:text-primary dark:border-primary/20 dark:bg-transparent dark:text-primary dark:hover:bg-primary/[0.06]"
            >
              {showDetails ? (
                <ChevronUp className="size-4" />
              ) : (
                <Settings2 className="size-4" />
              )}
              {showDetails ? "Hide Settings" : "Customize"}
            </Button>
          </div>

          {/* Categories */}
          {showDetails && (
            <div className="mt-4 border-t border-black/[0.06] pt-4 duration-300 animate-in fade-in">
              {CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 border-b border-black/[0.04] py-3"
                >
                  <div className="flex flex-1 items-start gap-3">
                    <category.icon className="mt-0.5 size-[18px] shrink-0 text-primary" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1a1a1a]">
                        {category.label}
                        {category.alwaysOn && (
                          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-[10px] font-bold tracking-[0.05em] text-primary uppercase">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[13px] leading-[1.5] text-[#4b5563]">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[category.id]}
                    onCheckedChange={() => toggle(category)}
                    disabled={category.alwaysOn || isSaving}
                    aria-label={category.label}
                  />
                </div>
              ))}

              <Button
                onClick={() => save(preferences, "custom")}
                disabled={isSaving}
                className="mt-4 h-11 w-full gap-2 rounded-[10px] bg-gradient-to-br from-primary to-[#6d28d9] font-semibold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:opacity-90 dark:from-primary dark:to-[#6d28d9] dark:text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-black/[0.06] pt-4 text-[13px] font-medium text-[#6b7280]">
            <Link
              to="/privacy"
              onClick={() => setVisible(false)}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Lock className="size-3.5" />
              Privacy Policy
            </Link>
            <span className="text-black/20">•</span>
            <Link
              to="/terms"
              onClick={() => setVisible(false)}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <FileText className="size-3.5" />
              Terms of Use
            </Link>
            <span className="text-black/20">•</span>
            <button
              type="button"
              onClick={resetConsent}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <RotateCcw className="size-3.5" />
              Reset Consent
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
