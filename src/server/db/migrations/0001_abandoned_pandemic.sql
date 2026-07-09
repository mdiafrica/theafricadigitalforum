CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"blurhash" text,
	"variants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"alt" text,
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");