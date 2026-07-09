import * as React from "react"

/**
 * Copy text to the clipboard and expose a `copied` flag that resets after 2s,
 * for "Copy" buttons that flip their label to "Copied".
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = React.useState(false)

  function copy(text: string) {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return { copied, copy }
}
