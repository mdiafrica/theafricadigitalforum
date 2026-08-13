CREATE TABLE "advisor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"photo_media_id" uuid,
	"twitter_url" text,
	"linkedin_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advisor_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advisor_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	CONSTRAINT "advisor_translation_advisor_id_locale_uq" UNIQUE("advisor_id","locale")
);
--> statement-breakpoint
ALTER TABLE "advisor" ADD CONSTRAINT "advisor_photo_media_id_media_id_fk" FOREIGN KEY ("photo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advisor_translation" ADD CONSTRAINT "advisor_translation_advisor_id_advisor_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."advisor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "advisor_sort_order_idx" ON "advisor" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "advisor_translation_advisor_id_idx" ON "advisor_translation" USING btree ("advisor_id");