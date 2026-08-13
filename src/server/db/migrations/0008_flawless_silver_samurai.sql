CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"color" text DEFAULT '#7C3AED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "category_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "category_translation_category_id_locale_uq" UNIQUE("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "post_category" (
	"post_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "post_category_post_id_category_id_pk" PRIMARY KEY("post_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "category_translation" ADD CONSTRAINT "category_translation_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_category" ADD CONSTRAINT "post_category_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_category" ADD CONSTRAINT "post_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_translation_category_id_idx" ON "category_translation" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "post_category_category_id_idx" ON "post_category" USING btree ("category_id");--> statement-breakpoint
-- Data migration: rename the secretary org role to editor.
UPDATE "member" SET "role" = 'editor' WHERE "role" = 'secretary';--> statement-breakpoint
UPDATE "invitation" SET "role" = 'editor' WHERE "role" = 'secretary';--> statement-breakpoint
-- Seed the legacy category taxonomy (slug, color) with EN/FR names.
INSERT INTO "category" ("slug", "color") VALUES
	('digital-policy', '#7C3AED'),
	('cybersecurity', '#1D4ED8'),
	('infrastructure', '#065F46'),
	('startup-ecosystem', '#92400E'),
	('fintech-payments', '#9F1239'),
	('trade-afcfta', '#1E3A5F'),
	('ai-data', '#0F766E'),
	('gender-inclusion', '#BE185D')
ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
INSERT INTO "category_translation" ("category_id", "locale", "name")
SELECT c."id", v.locale, v.name
FROM (VALUES
	('digital-policy', 'en', 'Digital Policy'),
	('digital-policy', 'fr', 'Politique numérique'),
	('cybersecurity', 'en', 'Cybersecurity'),
	('cybersecurity', 'fr', 'Cybersécurité'),
	('infrastructure', 'en', 'Infrastructure'),
	('infrastructure', 'fr', 'Infrastructure'),
	('startup-ecosystem', 'en', 'Startup Ecosystem'),
	('startup-ecosystem', 'fr', 'Écosystème des startups'),
	('fintech-payments', 'en', 'Fintech & Payments'),
	('fintech-payments', 'fr', 'Fintech et paiements'),
	('trade-afcfta', 'en', 'Trade & AfCFTA'),
	('trade-afcfta', 'fr', 'Commerce et ZLECAf'),
	('ai-data', 'en', 'AI & Data'),
	('ai-data', 'fr', 'IA et données'),
	('gender-inclusion', 'en', 'Gender & Inclusion'),
	('gender-inclusion', 'fr', 'Genre et inclusion')
) AS v(slug, locale, name)
JOIN "category" c ON c."slug" = v.slug
ON CONFLICT ON CONSTRAINT "category_translation_category_id_locale_uq" DO NOTHING;--> statement-breakpoint
-- Backfill: create categories for post labels that match no known name.
WITH pairs AS (
	SELECT p."id" AS post_id, p."updated_at",
		NULLIF(btrim(en."category"), '') AS en_label,
		NULLIF(btrim(fr."category"), '') AS fr_label
	FROM "post" p
	LEFT JOIN "post_translation" en ON en."post_id" = p."id" AND en."locale" = 'en'
	LEFT JOIN "post_translation" fr ON fr."post_id" = p."id" AND fr."locale" = 'fr'
), named AS (
	SELECT post_id, "updated_at", COALESCE(en_label, fr_label) AS canon, fr_label
	FROM pairs WHERE COALESCE(en_label, fr_label) IS NOT NULL
)
INSERT INTO "category" ("slug", "color")
SELECT DISTINCT btrim(regexp_replace(lower(n.canon), '[^a-z0-9]+', '-', 'g'), '-'), '#7C3AED'
FROM named n
WHERE NOT EXISTS (
	SELECT 1 FROM "category_translation" ct WHERE lower(ct."name") = lower(n.canon)
)
ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
-- Backfill: EN names for the categories created from post labels.
WITH pairs AS (
	SELECT p."id" AS post_id, p."updated_at",
		NULLIF(btrim(en."category"), '') AS en_label,
		NULLIF(btrim(fr."category"), '') AS fr_label
	FROM "post" p
	LEFT JOIN "post_translation" en ON en."post_id" = p."id" AND en."locale" = 'en'
	LEFT JOIN "post_translation" fr ON fr."post_id" = p."id" AND fr."locale" = 'fr'
), named AS (
	SELECT post_id, "updated_at", COALESCE(en_label, fr_label) AS canon, fr_label
	FROM pairs WHERE COALESCE(en_label, fr_label) IS NOT NULL
)
INSERT INTO "category_translation" ("category_id", "locale", "name")
SELECT DISTINCT c."id", 'en', n.canon
FROM named n
JOIN "category" c ON c."slug" = btrim(regexp_replace(lower(n.canon), '[^a-z0-9]+', '-', 'g'), '-')
ON CONFLICT ON CONSTRAINT "category_translation_category_id_locale_uq" DO NOTHING;--> statement-breakpoint
-- Backfill: FR names, most recently updated post wins on conflicts.
WITH pairs AS (
	SELECT p."id" AS post_id, p."updated_at",
		NULLIF(btrim(en."category"), '') AS en_label,
		NULLIF(btrim(fr."category"), '') AS fr_label
	FROM "post" p
	LEFT JOIN "post_translation" en ON en."post_id" = p."id" AND en."locale" = 'en'
	LEFT JOIN "post_translation" fr ON fr."post_id" = p."id" AND fr."locale" = 'fr'
), named AS (
	SELECT post_id, "updated_at", COALESCE(en_label, fr_label) AS canon, fr_label
	FROM pairs WHERE COALESCE(en_label, fr_label) IS NOT NULL
), fr_pick AS (
	SELECT DISTINCT ON (canon) canon, fr_label
	FROM named WHERE fr_label IS NOT NULL
	ORDER BY canon, "updated_at" DESC
)
INSERT INTO "category_translation" ("category_id", "locale", "name")
SELECT c."id", 'fr', f.fr_label
FROM fr_pick f
JOIN "category" c ON c."slug" = btrim(regexp_replace(lower(f.canon), '[^a-z0-9]+', '-', 'g'), '-')
ON CONFLICT ON CONSTRAINT "category_translation_category_id_locale_uq" DO NOTHING;--> statement-breakpoint
-- Backfill: link posts to categories by label match (either locale).
WITH pairs AS (
	SELECT p."id" AS post_id, p."updated_at",
		NULLIF(btrim(en."category"), '') AS en_label,
		NULLIF(btrim(fr."category"), '') AS fr_label
	FROM "post" p
	LEFT JOIN "post_translation" en ON en."post_id" = p."id" AND en."locale" = 'en'
	LEFT JOIN "post_translation" fr ON fr."post_id" = p."id" AND fr."locale" = 'fr'
), named AS (
	SELECT post_id, "updated_at", COALESCE(en_label, fr_label) AS canon, fr_label
	FROM pairs WHERE COALESCE(en_label, fr_label) IS NOT NULL
)
INSERT INTO "post_category" ("post_id", "category_id")
SELECT DISTINCT n.post_id, ct."category_id"
FROM named n
JOIN "category_translation" ct ON lower(ct."name") = lower(n.canon)
ON CONFLICT DO NOTHING;--> statement-breakpoint
ALTER TABLE "post_translation" DROP COLUMN "category";