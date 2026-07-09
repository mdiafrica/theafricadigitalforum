import { desc, eq, sql } from "drizzle-orm"
import { createServerFn } from "@tanstack/react-start"

import { authMiddleware, requireOrgPermission } from "@/domains/auth"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { processImage } from "@/server/media/image-pipeline"
import {
  deleteObjects,
  generateKey,
  getPublicUrl,
  putObject,
} from "@/server/storage"
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  deleteMediaInput,
  listMediaInput,
  updateMediaAltInput,
} from "./media.schemas"

function toMediaItem(row: typeof schema.media.$inferSelect) {
  return {
    ...row,
    url: getPublicUrl(row.storageKey),
    variants: row.variants.map((variant) => ({
      ...variant,
      url: getPublicUrl(variant.key),
    })),
  }
}

/**
 * Streaming-through upload: client → this fn → SeaweedFS. The sharp quality
 * layer runs here — dimensions, blurhash, WebP renditions.
 */
export const uploadMedia = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ media: ["upload"] })])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected form data")
    const file = data.get("file")
    if (!(file instanceof File)) throw new Error("Missing file")
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      throw new Error(
        `Unsupported file type "${file.type}" — use JPEG, PNG, WebP or AVIF`
      )
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error("File is too large (max 10 MB)")
    }
    const alt = data.get("alt")
    return { file, alt: typeof alt === "string" ? alt : "" }
  })
  .handler(async ({ data, context }) => {
    const { file } = data
    const buffer = Buffer.from(await file.arrayBuffer())

    const processed = await processImage(buffer)

    const storageKey = generateKey(file.name, "media")
    const variantBase = storageKey.replace(/\.[^./]+$/, "")
    const variants = processed.variants.map((variant) => ({
      variant,
      key: `${variantBase}-w${variant.width}.webp`,
    }))

    await Promise.all([
      putObject({ key: storageKey, body: buffer, contentType: file.type }),
      ...variants.map(({ variant, key }) =>
        putObject({
          key,
          body: variant.buffer,
          contentType: variant.contentType,
        })
      ),
    ])

    const [row] = await db
      .insert(schema.media)
      .values({
        storageKey,
        mimeType: file.type,
        size: file.size,
        width: processed.width,
        height: processed.height,
        blurhash: processed.blurhash,
        variants: variants.map(({ variant, key }) => ({
          width: variant.width,
          height: variant.height,
          key,
          size: variant.size,
        })),
        alt: data.alt || null,
        uploadedBy: context.auth.user.id,
      })
      .returning()

    return toMediaItem(row)
  })

export const listMedia = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(listMediaInput)
  .handler(async ({ data }) => {
    const offset = (data.page - 1) * data.pageSize
    const [items, [{ total }]] = await Promise.all([
      db.query.media.findMany({
        orderBy: desc(schema.media.createdAt),
        limit: data.pageSize,
        offset,
      }),
      db.select({ total: sql<number>`count(*)::int` }).from(schema.media),
    ])
    return {
      items: items.map(toMediaItem),
      total,
      page: data.page,
      pageSize: data.pageSize,
    }
  })

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ media: ["delete"] })])
  .validator(deleteMediaInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .delete(schema.media)
      .where(eq(schema.media.id, data.id))
      .returning({
        storageKey: schema.media.storageKey,
        variants: schema.media.variants,
      })
    if (!row) throw new Error("Media not found")

    // Row first, objects second: an orphaned object is harmless, a row
    // pointing at deleted objects is a broken image.
    await deleteObjects([
      row.storageKey,
      ...row.variants.map((variant) => variant.key),
    ])

    return { id: data.id }
  })

export const updateMediaAlt = createServerFn({ method: "POST" })
  .middleware([requireOrgPermission({ media: ["upload"] })])
  .validator(updateMediaAltInput)
  .handler(async ({ data }) => {
    const [row] = await db
      .update(schema.media)
      .set({ alt: data.alt || null })
      .where(eq(schema.media.id, data.id))
      .returning()
    if (!row) throw new Error("Media not found")
    return toMediaItem(row)
  })

export type MediaItem = Awaited<ReturnType<typeof uploadMedia>>
