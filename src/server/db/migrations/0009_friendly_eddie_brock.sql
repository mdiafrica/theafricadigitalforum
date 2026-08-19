ALTER TABLE "post_translation" ADD COLUMN "published" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
-- Backfill: today every translation of a published post is publicly visible
-- (coalesce-to-EN behavior), so mark them all published to preserve the
-- current site exactly as-is (ADR-0003).
UPDATE "post_translation" SET "published" = true
WHERE "post_id" IN (SELECT "id" FROM "post" WHERE "status" = 'published');
