/**
 * The single place user-facing error messages are derived.
 * Strips internal prefixes our server-fn middleware uses (UNAUTHORIZED:/
 * FORBIDDEN:) so toasts stay human.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : ((error as { message?: string } | null)?.message ?? "")

  if (!raw) return fallback
  return raw.replace(/^(UNAUTHORIZED|FORBIDDEN):\s*/, "") || fallback
}
