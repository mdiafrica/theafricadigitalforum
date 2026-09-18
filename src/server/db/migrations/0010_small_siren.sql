ALTER TABLE "event" ADD COLUMN "day" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "track" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_translation" ADD COLUMN "summary" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_translation" ADD COLUMN "expected_outcome" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_translation" ADD COLUMN "beneficiaries" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_translation" ADD COLUMN "speaker" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_translation" ADD COLUMN "day_description" text DEFAULT '' NOT NULL;