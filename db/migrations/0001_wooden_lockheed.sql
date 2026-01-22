ALTER TABLE "settings" ADD COLUMN "warning_threshold" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "critical_threshold" integer DEFAULT 5 NOT NULL;