CREATE TABLE "registration_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"pass_tier" text,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registration_code_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "registration" ADD COLUMN "access_code" text;--> statement-breakpoint
CREATE INDEX "registration_code_created_at_idx" ON "registration_code" USING btree ("created_at");