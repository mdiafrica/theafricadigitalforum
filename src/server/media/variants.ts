import type * as schema from "@/server/db/schema"
import { getPublicUrl } from "@/server/storage"

type MediaRow = typeof schema.media.$inferSelect

/**
 * Public URL of the rendition at `preferredWidth`, falling back to the
 * largest rendition, then the original upload.
 */
export function mediaVariantUrl(
  media: MediaRow | null,
  preferredWidth: number
): string | null {
  if (!media) return null
  const variant =
    media.variants.find((v) => v.width === preferredWidth) ??
    media.variants.at(-1)
  return getPublicUrl(variant?.key ?? media.storageKey)
}
