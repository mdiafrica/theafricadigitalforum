CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	CONSTRAINT "event_translation_event_id_locale_uq" UNIQUE("event_id","locale")
);
--> statement-breakpoint
CREATE TABLE "page_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page" text NOT NULL,
	"section" text NOT NULL,
	"locale" text NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_content_page_section_locale_uq" UNIQUE("page","section","locale")
);
--> statement-breakpoint
CREATE TABLE "speaker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"photo_media_id" uuid,
	"twitter_url" text,
	"linkedin_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speaker_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"speaker_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	CONSTRAINT "speaker_translation_speaker_id_locale_uq" UNIQUE("speaker_id","locale")
);
--> statement-breakpoint
CREATE TABLE "sponsor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo_media_id" uuid,
	"website_url" text,
	"tier" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_translation" ADD CONSTRAINT "event_translation_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaker" ADD CONSTRAINT "speaker_photo_media_id_media_id_fk" FOREIGN KEY ("photo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaker_translation" ADD CONSTRAINT "speaker_translation_speaker_id_speaker_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."speaker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsor" ADD CONSTRAINT "sponsor_logo_media_id_media_id_fk" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_sort_order_idx" ON "event" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "event_translation_event_id_idx" ON "event_translation" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "speaker_sort_order_idx" ON "speaker" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "speaker_translation_speaker_id_idx" ON "speaker_translation" USING btree ("speaker_id");--> statement-breakpoint
CREATE INDEX "sponsor_sort_order_idx" ON "sponsor" USING btree ("sort_order");