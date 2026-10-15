CREATE TABLE "registration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"job_title" text NOT NULL,
	"organization" text NOT NULL,
	"country" text NOT NULL,
	"linkedin_url" text,
	"pass_tier" text NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"interest_areas" text[] DEFAULT '{}' NOT NULL,
	"participation_type" text NOT NULL,
	"primary_goal" text NOT NULL,
	"partnership_interest" text NOT NULL,
	"communications_consent" boolean NOT NULL,
	"terms_accepted" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registration_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE INDEX "registration_created_at_idx" ON "registration" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "registration_email_idx" ON "registration" USING btree ("email");