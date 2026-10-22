CREATE TABLE "partner_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO "partner_category" ("slug", "name", "sort_order") VALUES
	('host', 'Host', 0),
	('cohosts', 'Co-hosts', 1),
	('title', 'Title sponsor', 2),
	('platinum', 'Platinum', 3),
	('diamond', 'Diamond', 4),
	('gold', 'Gold', 5),
	('silver', 'Silver', 6);
