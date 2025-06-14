CREATE TYPE "public"."action_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."action_trigger" AS ENUM('onEnter', 'onChoice');--> statement-breakpoint
CREATE TYPE "public"."scene_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "actions" (
	"id" text PRIMARY KEY NOT NULL,
	"trigger" "action_trigger" NOT NULL,
	"fail_message" text,
	"conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "action_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "choices" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"result_msg" text,
	"result_btn" text,
	"next_scene_id" text,
	"next_action_id" text,
	"parent_scene_id" text,
	"parent_outcome_id" integer,
	"state_changes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "one_parent" CHECK ((parent_scene_id IS NOT NULL) <> (parent_outcome_id IS NOT NULL)),
	CONSTRAINT "one_dest" CHECK (NOT (next_scene_id IS NOT NULL AND next_action_id IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "flags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outcomes" (
	"id" serial PRIMARY KEY NOT NULL,
	"action_id" text NOT NULL,
	"description" text NOT NULL,
	"conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"state_changes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scene_actions" (
	"scene_id" text NOT NULL,
	"action_id" text NOT NULL,
	CONSTRAINT "scene_actions_scene_id_action_id_pk" PRIMARY KEY("scene_id","action_id")
);
--> statement-breakpoint
CREATE TABLE "scenes" (
	"id" text PRIMARY KEY NOT NULL,
	"location" text NOT NULL,
	"description" text NOT NULL,
	"parent_scene_id" text,
	"season" text,
	"is_required" boolean DEFAULT false,
	"location_image" text,
	"status" "scene_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_parent_scene_id_scenes_id_fk" FOREIGN KEY ("parent_scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_parent_outcome_id_outcomes_id_fk" FOREIGN KEY ("parent_outcome_id") REFERENCES "public"."outcomes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scene_actions" ADD CONSTRAINT "scene_actions_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scene_actions" ADD CONSTRAINT "scene_actions_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE cascade ON UPDATE no action;