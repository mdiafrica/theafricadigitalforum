import { z } from "zod"

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB

export const listMediaInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(24),
})
export type ListMediaInput = z.infer<typeof listMediaInput>

export const deleteMediaInput = z.object({
  id: z.uuid(),
})
export type DeleteMediaInput = z.infer<typeof deleteMediaInput>

export const updateMediaAltInput = z.object({
  id: z.uuid(),
  alt: z.string().trim().max(500),
})
export type UpdateMediaAltInput = z.infer<typeof updateMediaAltInput>
