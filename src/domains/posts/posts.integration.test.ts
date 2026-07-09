import { desc, eq, inArray } from "drizzle-orm"
import { afterAll, describe, expect, it } from "vitest"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import {
  assertSlugAvailable,
  selectPublishedCategories,
  selectPublishedPosts,
  upsertTranslations,
} from "./posts.internal"

/**
 * Integration test — requires the dev containers (`docker compose up -d`).
 * Exercises the translation-row model against the real Postgres: upsert
 * semantics, FR-row removal, slug uniqueness and published-only reads.
 */

const testSlug = (name: string) => `it-${name}-${Date.now()}`
const createdPostIds: string[] = []

async function createTestPost(slug: string) {
  const [row] = await db.insert(schema.post).values({ slug }).returning()
  createdPostIds.push(row.id)
  return row
}

afterAll(async () => {
  for (const id of createdPostIds) {
    await db.delete(schema.post).where(eq(schema.post.id, id))
  }
})

describe("posts translation rows (integration, needs docker compose up)", () => {
  it("upserts EN + FR, updates in place, and drops FR when cleared", async () => {
    const post = await createTestPost(testSlug("upsert"))

    await upsertTranslations(post.id, {
      en: { title: "Hello", excerpt: "hi", category: "News", body: [] },
      fr: { title: "Bonjour", excerpt: "salut", category: "Actus", body: [] },
    })

    let rows = await db.query.postTranslation.findMany({
      where: eq(schema.postTranslation.postId, post.id),
    })
    expect(rows.map((r) => r.locale).sort()).toEqual(["en", "fr"])

    // Second save updates rows rather than duplicating (unique post+locale).
    await upsertTranslations(post.id, {
      en: { title: "Hello v2", excerpt: "", category: "", body: [] },
      fr: { title: "Bonjour v2", excerpt: "", category: "", body: [] },
    })
    rows = await db.query.postTranslation.findMany({
      where: eq(schema.postTranslation.postId, post.id),
    })
    expect(rows).toHaveLength(2)
    expect(rows.find((r) => r.locale === "en")?.title).toBe("Hello v2")

    // Clearing the FR title removes the FR row.
    await upsertTranslations(post.id, {
      en: { title: "Hello v3", excerpt: "", category: "", body: [] },
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
      en: { title: "Draft", excerpt: "", category: "", body: [] },
    })
    await upsertTranslations(published.id, {
      en: { title: "Published", excerpt: "", category: "", body: [] },
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
    const skillsCat = `Digital Skills ${marker}`
    const fintechCat = `Fintech ${marker}`

    const alpha = await createTestPost(testSlug("alpha"))
    const beta = await createTestPost(testSlug("beta"))
    const drafted = await createTestPost(testSlug("hidden"))

    await upsertTranslations(alpha.id, {
      en: { title: `Alpha ${marker}`, excerpt: "reskilling", category: skillsCat, body: [] },
    })
    await upsertTranslations(beta.id, {
      en: { title: `Beta ${marker}`, excerpt: "mobile payments", category: fintechCat, body: [] },
    })
    await upsertTranslations(drafted.id, {
      en: { title: `Draft ${marker}`, excerpt: "", category: skillsCat, body: [] },
    })
    await db
      .update(schema.post)
      .set({ status: "published", publishedAt: new Date() })
      .where(inArray(schema.post.id, [alpha.id, beta.id]))

    const byCategory = await selectPublishedPosts({ locale: "en", category: skillsCat })
    const byCategoryIds = byCategory.map((p) => p.id)
    expect(byCategoryIds).toContain(alpha.id)
    expect(byCategoryIds).not.toContain(beta.id)
    expect(byCategoryIds).not.toContain(drafted.id)

    const bySearch = await selectPublishedPosts({ locale: "en", query: "MOBILE payments" })
    const bySearchIds = bySearch.map((p) => p.id)
    expect(bySearchIds).toContain(beta.id)
    expect(bySearchIds).not.toContain(alpha.id)

    const both = await selectPublishedPosts({ locale: "en", category: fintechCat, query: "alpha" })
    expect(both.map((p) => p.id)).not.toContain(alpha.id)
    expect(both.map((p) => p.id)).not.toContain(beta.id)

    const categories = await selectPublishedCategories("en")
    expect(categories).toContain(skillsCat)
    expect(categories).toContain(fintechCat)

    await db.delete(schema.post).where(eq(schema.post.id, drafted.id))
  })
})
