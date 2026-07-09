CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"cover_media_id" uuid,
	"published_at" timestamp,
	"author_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"category" text,
	"body" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "post_translation_post_id_locale_uq" UNIQUE("post_id","locale")
);
--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_cover_media_id_media_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_translation" ADD CONSTRAINT "post_translation_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_status_published_at_idx" ON "post" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "post_translation_post_id_idx" ON "post_translation" USING btree ("post_id");