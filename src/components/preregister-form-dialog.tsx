import { useEffect, useState } from "react"
import { RefreshCw, TriangleAlert } from "lucide-react"

import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const PREREGISTER_FORM_URLS: Record<string, string> = {
  en: "https://docs.google.com/forms/d/e/1FAIpQLSePI2YjuaiqUvhvmYWKIH4OEueTxCJ7Wfh7z8ZjQJR5EgfneQ/viewform?embedded=true",
  fr: "https://docs.google.com/forms/d/e/1FAIpQLScbHZ5J5-jX9sGHTDTzxjZ6pmZax3qFz61MMHMhgR6x4Z_DTg/viewform?embedded=true",
}

export function PreregisterFormDialog() {
  const [hasFailed, setHasFailed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const formUrl =
    PREREGISTER_FORM_URLS[getLocale()] ?? PREREGISTER_FORM_URLS.en

  useEffect(() => {
    if (!isLoading) return

    const timeout = window.setTimeout(() => setHasFailed(true), 12_000)
    return () => window.clearTimeout(timeout)
  }, [attempt, isLoading])

  const retry = () => {
    setHasFailed(false)
    setIsLoading(true)
    setAttempt((currentAttempt) => currentAttempt + 1)
  }

  return (
    <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto lg:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{m.preregister_dialog_title()}</DialogTitle>
      </DialogHeader>
      {hasFailed ? (
        <div className="flex h-[75vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <TriangleAlert className="size-10 text-primary" aria-hidden="true" />
          <div className="space-y-1.5">
            <p className="font-semibold">{m.preregister_form_unavailable_title()}</p>
            <p className="max-w-md text-sm text-muted-foreground">
              {m.preregister_form_unavailable_description()}
            </p>
          </div>
          <Button variant="outline" onClick={retry}>
            <RefreshCw aria-hidden="true" />
            {m.preregister_form_retry()}
          </Button>
        </div>
      ) : (
        <iframe
          key={attempt}
          src={formUrl}
          title={m.preregister_dialog_title()}
          className="h-[75vh] w-full rounded-md border-0"
          onError={() => {
            setHasFailed(true)
            setIsLoading(false)
          }}
          onLoad={() => setIsLoading(false)}
        >
          Loading...
        </iframe>
      )}
    </DialogContent>
  )
}