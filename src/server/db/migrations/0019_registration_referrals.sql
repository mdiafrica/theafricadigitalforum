CREATE TABLE "referral_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_option_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "registration" ADD COLUMN "referral" text DEFAULT '' NOT NULL;
--> statement-breakpoint
INSERT INTO "referral_option" ("name","sort_order") VALUES ('Transform Transport Accra',1),('Francis Ametepey',2),('Not Applicable',3);