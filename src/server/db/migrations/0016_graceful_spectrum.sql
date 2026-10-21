CREATE TABLE "partner" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo_media_id" uuid,
	"website_url" text,
	"tier" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_logo_media_id_media_id_fk" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_sort_order_idx" ON "partner" USING btree ("sort_order");
--> statement-breakpoint
INSERT INTO "partner" ("name", "tier", "sort_order") VALUES
	('Media & Digital Institute', 'host', 0),
	('IMD University', 'cohosts', 0),
	('Media & Digital Institute Africa Foundation Inc', 'cohosts', 1),
	('Bolingo Consult', 'silver', 0);