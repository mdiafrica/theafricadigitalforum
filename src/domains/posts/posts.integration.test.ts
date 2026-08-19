import { desc, eq } from "drizzle-orm"
import { afterAll, describe, expect, it } from "vitest"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import {
  assertSlugAvailable,
  publishPostWithLocales,
  selectPublishedCategories,
  selectPublishedPostBySlug,
  selectPublishedPosts,
  setTranslationPublished,
  syncPostCategories,
  upsertTranslations,
} from "./posts.internal"

/**
 * Integration test — requires the dev containers (`docker compose up -d`).
 * Exercises the translation-row model against the real Postgres: upsert
 * semantics, FR-row removal, slug uniqueness and published-only reads.
 */

const testSlug = (name: string) => `it-${name}-${Date.now()}`
const createdPostIds: string[] = []
const createdCategoryIds: string[] = []

async function createTestPost(slug: string) {
  const [row] = await db.insert(schema.post).values({ slug }).returning()
  createdPostIds.push(row.id)
  return row
}

afterAll(async () => {
  for (const id of createdPostIds) {
    await db.delete(schema.post).where(eq(schema.post.id, id))
  }
  // After the posts: post_category rows are gone, so deletes aren't blocked.
  for (const id of createdCategoryIds) {
    await db.delete(schema.category).where(eq(schema.category.id, id))
  }
})

describe("posts translation rows (integration, needs docker compose up)", () => {
  it("upserts EN + FR, updates in place, and drops FR when cleared", async () => {
    const post = await createTestPost(testSlug("upsert"))

    await upsertTranslations(post.id, {
      en: { title: "Hello", excerpt: "hi", body: [] },
      fr: { title: "Bonjour", excerpt: "salut", body: [] },
    })

    let rows = await db.query.postTranslation.findMany({
      where: eq(schema.postTranslation.postId, post.id),
    })
    expect(rows.map((r) => r.locale).sort()).toEqual(["en", "fr"])

    // Second save updates rows rather than duplicating (unique post+locale).
    await upsertTranslations(post.id, {
      en: { title: "Hello v2", excerpt: "", body: [] },
      fr: { title: "Bonjour v2", excerpt: "", body: [] },
    })
    rows = await db.query.postTranslation.findMany({
      where: eq(schema.postTranslation.postId, post.id),
    })
    expect(rows).toHaveLength(2)
    expect(rows.find((r) => r.locale === "en")?.title).toBe("Hello v2")

    // Clearing the FR title removes the FR row.
    await upsertTranslations(post.id, {
      en: { title: "Hello v3", excerpt: "", body: [] },
    })
    rows = await db.query.postTranslation.findMany({
      where: eq(schema.postTranslation.postId, post.id),
    })
    expect(rows.map((r) => r.locale)).toEqual(["en"])
  })

  it("rejects a duplicate slug but allows updating the same post", async () => {
    const slug = testSlug("slug")
    const post = await createTestPost(slug)

    await expect(assertSlugAvailable(slug)).rejects.toThrow(/already in use/)
    await expect(assertSlugAvailable(slug, post.id)).resolves.toBeUndefined()
    await expect(
      assertSlugAvailable(testSlug("other"))
    ).resolves.toBeUndefined()
  })

  it("cascades translations on post delete and filters drafts from public reads", async () => {
    const draft = await createTestPost(testSlug("draft"))
    const published = await createTestPost(testSlug("published"))

    await upsertTranslations(draft.id, {
      en: { title: "Draft", excerpt: "", body: [] },
    })
    await upsertTranslations(published.id, {
      en: { title: "Published", excerpt: "", body: [] },
    })
    await db
      .update(schema.post)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(schema.post.id, published.id))

    // Published-only read (the public fns' where clause).
    const publicRows = await db.query.post.findMany({
      where: eq(schema.post.status, "published"),
      orderBy: desc(schema.post.publishedAt),
      columns: { id: true },
    })
    const publicIds = publicRows.map((r) => r.id)
    expect(publicIds).toContain(published.id)
    expect(publicIds).not.toContain(draft.id)

    // Cascade: deleting the post removes its translation rows.
    await db.delete(schema.post).where(eq(schema.post.id, draft.id))
    const orphans = await db.query.postTranslation.findMany({
      where: eq(schema.postTranslation.postId, draft.id),
    })
    expect(orphans).toHaveLength(0)
  })

  it("filters published posts by category and search IN THE DATABASE", async () => {
    const marker = `cat-${Date.now()}`

    const createCategory = async (slugPart: string, name: string) => {
      const [row] = await db
        .insert(schema.category)
        .values({ slug: `it-${slugPart}-${marker}` })
        .returning()
      createdCategoryIds.push(row.id)
      await db
        .insert(schema.categoryTranslation)
        .values({ categoryId: row.id, locale: "en", name })
      return row
    }

    const skills = await createCategory("skills", `Digital Skills ${marker}`)
    const fintech = await createCategory("fintech", `Fintech ${marker}`)

    const alpha = await createTestPost(testSlug("alpha"))
    const beta = await createTestPost(testSlug("beta"))
    const drafted = await createTestPost(testSlug("hidden"))

    await upsertTranslations(alpha.id, {
      en: { title: `Alpha ${marker}`, excerpt: "reskilling", body: [] },
    })
    await upsertTranslations(beta.id, {
      en: { title: `Beta ${marker}`, excerpt: "mobile payments", body: [] },
    })
    await upsertTranslations(drafted.id, {
      en: { title: `Draft ${marker}`, excerpt: "", body: [] },
    })
    await syncPostCategories(alpha.id, [skills.id])
    await syncPostCategories(beta.id, [fintech.id])
    await syncPostCategories(drafted.id, [skills.id])
    await publishPostWithLocales(alpha.id, [])
    await publishPostWithLocales(beta.id, [])

    const byCategory = await selectPublishedPosts({
      locale: "en",
      categorySlug: skills.slug,
    })
    const byCategoryIds = byCategory.map((p) => p.id)
    expect(byCategoryIds).toContain(alpha.id)
    expect(byCategoryIds).not.toContain(beta.id)
    expect(byCategoryIds).not.toContain(drafted.id)
    // List items carry their locale-resolved category refs.
    expect(
      byCategory.find((p) => p.id === alpha.id)?.categories.map((c) => c.slug)
    ).toContain(skills.slug)

    const bySearch = await selectPublishedPosts({
      locale: "en",
      query: "MOBILE payments",
    })
    const bySearchIds = bySearch.map((p) => p.id)
    expect(bySearchIds).toContain(beta.id)
    expect(bySearchIds).not.toContain(alpha.id)

    const both = await selectPublishedPosts({
      locale: "en",
      categorySlug: fintech.slug,
      query: "alpha",
    })
    expect(both.map((p) => p.id)).not.toContain(alpha.id)
    expect(both.map((p) => p.id)).not.toContain(beta.id)

    // Only categories with published posts appear (drafted's link is not
    // enough on its own — skills qualifies via alpha).
    const categories = await selectPublishedCategories("en")
    const categorySlugs = categories.map((c) => c.slug)
    expect(categorySlugs).toContain(skills.slug)
    expect(categorySlugs).toContain(fintech.slug)

    await db.delete(schema.post).where(eq(schema.post.id, drafted.id))
  })
})

describe("language visibility (integration, needs docker compose up)", () => {
  const translationRows = (postId: string) =>
    db.query.postTranslation.findMany({
      where: eq(schema.postTranslation.postId, postId),
    })

  it("publishPostWithLocales publishes EN always and FR only when chosen", async () => {
    const chosen = await createTestPost(testSlug("pub-both"))
    const withheld = await createTestPost(testSlug("pub-en-only"))
    for (const post of [chosen, withheld]) {
      await upsertTranslations(post.id, {
        en: { title: "English", excerpt: "", body: [] },
        fr: { title: "Français", excerpt: "", body: [] },
      })
    }

    // EN is implied even when not passed; FR follows the dialog choice.
    await publishPostWithLocales(chosen.id, ["fr"])
    await publishPostWithLocales(withheld.id, [])

    const chosenRows = await translationRows(chosen.id)
    expect(chosenRows.every((r) => r.published)).toBe(true)

    const withheldRows = await translationRows(withheld.id)
    expect(withheldRows.find((r) => r.locale === "en")?.published).toBe(true)
    expect(withheldRows.find((r) => r.locale === "fr")?.published).toBe(false)

    const [postRow] = await db
      .select()
      .from(schema.post)
      .where(eq(schema.post.id, chosen.id))
    expect(postRow.status).toBe("published")
    expect(postRow.publishedAt).not.toBeNull()
  })

  it("hides posts without a published requested-locale translation from lists", async () => {
    const marker = `vis-${Date.now()}`
    const bilingual = await createTestPost(testSlug("vis-bilingual"))
    const enOnly = await createTestPost(testSlug("vis-en-only"))
    const frWithheld = await createTestPost(testSlug("vis-fr-withheld"))

    await upsertTranslations(bilingual.id, {
      en: { title: `Bilingual ${marker}`, excerpt: "", body: [] },
      fr: { title: `Bilingue ${marker}`, excerpt: "", body: [] },
    })
    await upsertTranslations(enOnly.id, {
      en: { title: `EnOnly ${marker}`, excerpt: "", body: [] },
    })
    await upsertTranslations(frWithheld.id, {
      en: { title: `Withheld ${marker}`, excerpt: "", body: [] },
      fr: { title: `Retenu ${marker}`, excerpt: "", body: [] },
    })

    await publishPostWithLocales(bilingual.id, ["fr"])
    await publishPostWithLocales(enOnly.id, [])
    await publishPostWithLocales(frWithheld.id, [])

    const enIds = (
      await selectPublishedPosts({ locale: "en", query: marker })
    ).map((p) => p.id)
    expect(enIds).toContain(bilingual.id)
    expect(enIds).toContain(enOnly.id)
    expect(enIds).toContain(frWithheld.id)

    const frList = await selectPublishedPosts({ locale: "fr", query: marker })
    const frIds = frList.map((p) => p.id)
    expect(frIds).toContain(bilingual.id)
    expect(frIds).not.toContain(enOnly.id)
    expect(frIds).not.toContain(frWithheld.id)
    // Visible FR rows carry FR text, never an EN fallback.
    expect(frList.find((p) => p.id === bilingual.id)?.title).toBe(
      `Bilingue ${marker}`
    )
  })

  it("detail fallback serves EN when the FR translation is unpublished, and FR toggles independently", async () => {
    const post = await createTestPost(testSlug("vis-detail"))
    await upsertTranslations(post.id, {
      en: { title: "Detail EN", excerpt: "", body: [] },
      fr: { title: "Detail FR", excerpt: "", body: [] },
    })
    await publishPostWithLocales(post.id, [])

    // FR row exists but is unpublished: the FR reader gets the EN fallback,
    // never the draft French text.
    let detail = await selectPublishedPostBySlug(post.slug, "fr")
    expect(detail?.title).toBe("Detail EN")

    await setTranslationPublished(post.id, "fr", true)
    detail = await selectPublishedPostBySlug(post.slug, "fr")
    expect(detail?.title).toBe("Detail FR")

    // Unpublishing FR alone keeps EN live.
    await setTranslationPublished(post.id, "fr", false)
    detail = await selectPublishedPostBySlug(post.slug, "fr")
    expect(detail?.title).toBe("Detail EN")
    const enDetail = await selectPublishedPostBySlug(post.slug, "en")
    expect(enDetail?.title).toBe("Detail EN")
  })

  it("category filter only lists categories with posts visible in the locale", async () => {
    const marker = `viscat-${Date.now()}`
    const [category] = await db
      .insert(schema.category)
      .values({ slug: `it-viscat-${marker}` })
      .returning()
    createdCategoryIds.push(category.id)
    await db.insert(schema.categoryTranslation).values([
      { categoryId: category.id, locale: "en", name: `VisCat ${marker}` },
      { categoryId: category.id, locale: "fr", name: `VisCatFr ${marker}` },
    ])

    const enOnly = await createTestPost(testSlug("viscat-post"))
    await upsertTranslations(enOnly.id, {
      en: { title: `VisCatPost ${marker}`, excerpt: "", body: [] },
    })
    await syncPostCategories(enOnly.id, [category.id])
    await publishPostWithLocales(enOnly.id, [])

    const enCategories = await selectPublishedCategories("en")
    expect(enCategories.map((c) => c.id)).toContain(category.id)

    // The category's only post is EN-only, so the FR filter bar omits it.
    const frCategories = await selectPublishedCategories("fr")
    expect(frCategories.map((c) => c.id)).not.toContain(category.id)
  })

  it("guards setTranslationPublished: FR only, row must exist", async () => {
    const post = await createTestPost(testSlug("vis-guard"))
    await upsertTranslations(post.id, {
      en: { title: "Guard EN", excerpt: "", body: [] },
    })
    await publishPostWithLocales(post.id, [])

    await expect(setTranslationPublished(post.id, "en", false)).rejects.toThrow(
      /source/i
    )
    await expect(setTranslationPublished(post.id, "fr", true)).rejects.toThrow(
      /no french/i
    )
  })
})
