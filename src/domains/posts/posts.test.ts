import { describe, expect, it } from "vitest"

import { pickTranslation, readTimeMinutes } from "./posts.internal"
import { slugify } from "./posts.schemas"
import type { TranslationRow } from "./posts.internal"

function translation(locale: "en" | "fr", title: string): TranslationRow {
  return {
    id: `${locale}-id`,
    postId: "post-id",
    locale,
    title,
    excerpt: "",
    category: null,
    body: [],
  }
}

describe("slugify", () => {
  it("lowercases, strips accents and collapses separators", () => {
    expect(slugify("Togo's Government Roadmap 2025")).toBe(
      "togo-s-government-roadmap-2025"
    )
    expect(slugify("Économie numérique — l'avenir!")).toBe(
      "economie-numerique-l-avenir"
    )
    expect(slugify("  --hello--  ")).toBe("hello")
  })
})

describe("pickTranslation", () => {
  const en = translation("en", "Hello")
  const fr = translation("fr", "Bonjour")

  it("prefers the requested locale", () => {
    expect(pickTranslation([en, fr], "fr")).toBe(fr)
    expect(pickTranslation([en, fr], "en")).toBe(en)
  })

  it("falls back to the other locale when missing", () => {
    expect(pickTranslation([en], "fr")).toBe(en)
    expect(pickTranslation([fr], "en")).toBe(fr)
  })

  it("returns null with no translations", () => {
    expect(pickTranslation([], "en")).toBeNull()
  })
})

describe("readTimeMinutes", () => {
  it("counts words across nested nodes at ~200 wpm, minimum 1", () => {
    expect(readTimeMinutes([])).toBe(1)

    const words = Array.from({ length: 600 }, (_, i) => `word${i}`).join(" ")
    const body = [
      { type: "p", children: [{ text: words }] },
      {
        type: "column_group",
        children: [
          {
            type: "column",
            children: [{ type: "p", children: [{ text: words }] }],
          },
        ],
      },
    ]
    // 1200 words / 200 wpm = 6 minutes.
    expect(readTimeMinutes(body)).toBe(6)
  })
})
