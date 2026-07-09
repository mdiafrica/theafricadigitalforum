import sharp from "sharp"
import { describe, expect, it } from "vitest"

import {
  deleteObjects,
  generateKey,
  getPublicUrl,
  putObject,
} from "@/server/storage"
import { processImage, VARIANT_WIDTHS } from "./image-pipeline"

/**
 * Integration test — requires the dev containers (`docker compose up -d`).
 * Exercises the whole media quality layer: sharp processing, SeaweedFS
 * upload, the anonymous-read bucket policy, and deletion.
 */

async function makeTestImage(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 120, g: 60, b: 200 },
    },
  })
    .jpeg({ quality: 90 })
    .toBuffer()
}

describe("image pipeline (integration, needs docker compose up)", () => {
  it("extracts dimensions, blurhash and all four variants from a large image", async () => {
    const image = await makeTestImage(2000, 1200)
    const processed = await processImage(image)

    expect(processed.width).toBe(2000)
    expect(processed.height).toBe(1200)
    expect(processed.blurhash.length).toBeGreaterThan(6)
    expect(processed.variants.map((v) => v.width)).toEqual([...VARIANT_WIDTHS])
    // Aspect ratio preserved on renditions.
    expect(processed.variants[0].height).toBe(192) // 320 * 1200/2000
  })

  it("only generates variants narrower than the original", async () => {
    const image = await makeTestImage(700, 700)
    const processed = await processImage(image)
    expect(processed.variants.map((v) => v.width)).toEqual([320, 640])
  })

  it("uploads to the public bucket and serves anonymously, then deletes", async () => {
    const image = await makeTestImage(400, 300)
    const key = generateKey("policy-test.jpg", "media-test")

    await putObject({ key, body: image, contentType: "image/jpeg" })

    // Anonymous GET — no credentials, bare fetch. Proves the bucket policy.
    const url = getPublicUrl(key)
    const response = await fetch(url)
    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe("image/jpeg")
    const served = Buffer.from(await response.arrayBuffer())
    expect(served.equals(image)).toBe(true)

    await deleteObjects([key])
    const afterDelete = await fetch(url)
    expect(afterDelete.status).toBeGreaterThanOrEqual(400)
  })
})
