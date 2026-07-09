export interface TotpManualEntry {
  issuer: string
  accountName: string
  secret: string
}

export function parseTotpUri(totpUri: string): TotpManualEntry | null {
  try {
    const url = new URL(totpUri)
    if (url.protocol !== "otpauth:" || url.hostname !== "totp") {
      return null
    }

    const secret = url.searchParams.get("secret")?.replace(/\s+/g, "")
    const decodedLabel = decodeURIComponent(url.pathname.replace(/^\//, ""))
    const separatorIndex = decodedLabel.indexOf(":")

    const labelIssuer =
      separatorIndex >= 0 ? decodedLabel.slice(0, separatorIndex).trim() : ""
    const accountName =
      separatorIndex >= 0
        ? decodedLabel.slice(separatorIndex + 1).trim()
        : decodedLabel.trim()
    const issuer = url.searchParams.get("issuer")?.trim() || labelIssuer

    if (!secret || !issuer || !accountName) {
      return null
    }

    return { issuer, accountName, secret }
  } catch {
    return null
  }
}
