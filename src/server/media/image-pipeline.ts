import { encode } from "blurhash"
import sharp from "sharp"

/**
 * Quality layer at upload time: intrinsic dimensions, a blurhash
 * placeholder, and pre-generated WebP renditions so the frontend can serve
 * `srcset` + blur-up without any on-the-fly resizing.
 */

/** Rendition widths — only those narrower than the original are generated. */
export const VARIANT_WIDTHS = [320, 640, 1024, 1600] as const

export interface ProcessedVariant {
  width: number
  height: number
  size: number
  contentType: "image/webp"
  buffer: Buffer
}

export interface ProcessedImage {
  width: number
  height: number
  blurhash: string
  variants: ProcessedVariant[]
}

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const image = sharp(input, { failOn: "error" })
  const metadata = await image.metadata()
  // rotate() with no args applies EXIF orientation, so stored dimensions
  // match what the browser renders.
  const width = metadata.autoOrient?.width ?? metadata.width
  const height = metadata.autoOrient?.height ?? metadata.height
  if (!width || !height) {
    throw new Error("Could not read image dimensions")
  }

  const [blurhashValue, variants] = await Promise.all([
    encodeBlurhash(input),
    generateVariants(input, width),
  ])

  return { width, height, blurhash: blurhashValue, variants }
}

async function encodeBlurhash(input: Buffer): Promise<string> {
  const { data, info } = await sharp(input)
    .rotate()
    .resize(32, 32, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)
}

async function generateVariants(
  input: Buffer,
  originalWidth: number
): Promise<ProcessedVariant[]> {
  const widths = VARIANT_WIDTHS.filter((w) => w < originalWidth)
  return Promise.all(
    widths.map(async (targetWidth) => {
      const { data, info } = await sharp(input)
        .rotate()
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true })
      return {
        width: info.width,
        height: info.height,
        size: info.size,
        contentType: "image/webp" as const,
        buffer: data,
      }
    })
  )
}
