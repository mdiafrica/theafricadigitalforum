import { readFile } from "node:fs/promises"
import path from "node:path"

import { asc } from "drizzle-orm"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { processImage } from "@/server/media/image-pipeline"
import { generateKey, putObject } from "@/server/storage"
import { home as homeEn } from "@/i18n/en/pages/home"
import { home as homeFr } from "@/i18n/fr/pages/home"

/**
 * One-off content migration: move the hardcoded home-page speakers
 * (i18n EN/FR text + local portrait assets) into the media library and the
 * speaker tables. Idempotent: skips entirely when any speakers exist.
 *
 * Run: pnpm db:seed:speakers
 */

// Portrait files, aligned by index with the i18n `home.speakers` arrays
// (same ordering src/data/speakers.ts used).
const PORTRAITS = [
  "H.E. Cina Lawson.png",
  "LACINA KONE.png",
  "Tony O. Elumelu.png",
  "REBECCA ENOCHONG.png",
  "Mitchell Elegbe.png",
  "Shola Akinlade.png",
  "TIDIANE DEME.avif",
  "GEOFFROY-Odundo-scaled.jpeg",
  "Hassanein HIRIDJEE.jpeg",
  "Juliana Rotich.jpeg",
  "Iyinoluwa Aboyeji.jpg",
]

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".webp": "image/webp",
}

async function uploadPortrait(fileName: string) {
  const filePath = path.join(process.cwd(), "src/assets/images", fileName)
  const buffer = await readFile(filePath)
  const contentType =
    CONTENT_TYPES[path.extname(fileName).toLowerCase()] ?? "image/jpeg"

  const processed = await processImage(buffer)
  const storageKey = generateKey(fileName, "media")
  const variantBase = storageKey.replace(/\.[^./]+$/, "")
  const variants = processed.variants.map((variant) => ({
    variant,
    key: `${variantBase}-w${variant.width}.webp`,
  }))

  await Promise.all([
    putObject({ key: storageKey, body: buffer, contentType }),
    ...variants.map(({ variant, key }) =>
      putObject({ key, body: variant.buffer, contentType: variant.contentType })
    ),
  ])

  const [row] = await db
    .insert(schema.media)
    .values({
      storageKey,
      mimeType: contentType,
      size: buffer.byteLength,
      width: processed.width,
      height: processed.height,
      blurhash: processed.blurhash,
      variants: variants.map(({ variant, key }) => ({
        width: variant.width,
        height: variant.height,
        key,
        size: variant.size,
      })),
      alt: fileName.replace(/\.[^.]+$/, ""),
    })
    .returning({ id: schema.media.id })

  return row.id
}

async function main() {
  const existing = await db.query.speaker.findMany({
    columns: { id: true },
    orderBy: asc(schema.speaker.sortOrder),
    limit: 1,
  })
  if (existing.length > 0) {
    console.log("Speakers already seeded — nothing to do.")
    return
  }

  const speakersEn = homeEn.speakers
  const speakersFr = homeFr.speakers

  for (let i = 0; i < speakersEn.length; i++) {
    const en = speakersEn[i]
    const fr = speakersFr[i]
    const portrait = PORTRAITS[i]

    console.log(`Seeding speaker ${i + 1}/${speakersEn.length}: ${en.name}`)
    const photoMediaId = portrait ? await uploadPortrait(portrait) : null

    const [row] = await db
      .insert(schema.speaker)
      .values({
        photoMediaId,
        twitterUrl: en.twitter || null,
        linkedinUrl: en.linkedin || null,
        sortOrder: (i + 1) * 10,
      })
      .returning({ id: schema.speaker.id })

    await db.insert(schema.speakerTranslation).values([
      { speakerId: row.id, locale: "en", name: en.name, role: en.role },
      ...(fr
        ? [
            {
              speakerId: row.id,
              locale: "fr" as const,
              name: fr.name,
              role: fr.role,
            },
          ]
        : []),
    ])
  }

  console.log("Done.")
}

await main()
process.exit(0)
