import {
  pgTable,
  text,
  boolean,
  serial,
  timestamp,
  jsonb,
  pgEnum,
  primaryKey,
  check,
  integer,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/* =============================================================
   ENUMS
   =============================================================*/
export const sceneStatus   = pgEnum('scene_status',   ['draft', 'published']);
export const actionStatus  = pgEnum('action_status',  ['draft', 'published']);
export const actionTrigger = pgEnum('action_trigger', ['onEnter', 'onChoice']);

/* =============================================================
   SCENES
   =============================================================*/
export const scenes = pgTable('scenes', {
  id:            text('id').primaryKey(),         // ex: 'oak_tree'
  location:      text('location').notNull(),
  description:   text('description').notNull(),
  parentSceneId: text('parent_scene_id'),         // self-reference (optional)
  season:        text('season'),
  isRequired:    boolean('is_required').default(false),
  locationImage: text('location_image'),
  status:        sceneStatus('status').default('draft').notNull(),
  createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

/* =============================================================
   ACTIONS
   =============================================================*/
export const actions = pgTable('actions', {
  id:          text('id').primaryKey(),           // ex: 'help_bird'
  trigger:     actionTrigger('trigger').notNull(),
  failMessage: text('fail_message'),
  conditions:  jsonb('conditions').default([]).notNull(),
  status:      actionStatus('status').default('draft').notNull(),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

/* =============================================================
   SCENE ↔ ACTION (junction)
   =============================================================*/
export const sceneActions = pgTable(
  'scene_actions',
  {
    sceneId: text('scene_id')
      .references(() => scenes.id, { onDelete: 'cascade' })
      .notNull(),
    actionId: text('action_id')
      .references(() => actions.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.sceneId, t.actionId] }),
  }),
);

/* =============================================================
   OUTCOMES (child of ACTION)
   =============================================================*/
export const outcomes = pgTable('outcomes', {
  id:           serial('id').primaryKey(),
  actionId:     text('action_id').references(() => actions.id, { onDelete: 'cascade' }).notNull(),
  description:  text('description').notNull(),
  conditions:   jsonb('conditions').default([]).notNull(),
  stateChanges: jsonb('state_changes').default([]).notNull(),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

/* =============================================================
   CHOICES (polymorphic parent & destination)
   =============================================================*/
export const choices = pgTable(
  'choices',
  {
    id: serial('id').primaryKey(),
    text: text('text').notNull(),

    // Result UI (optional)
    resultMsg: text('result_msg'),
    resultBtn: text('result_btn'),

    // Destination (one of – no FK so drafts are allowed)
    nextSceneId: text('next_scene_id'),
    nextActionId: text('next_action_id'),

    // Parent (one of)
    parentSceneId: text('parent_scene_id').references(() => scenes.id, { onDelete: 'cascade' }),
    parentOutcomeId: integer('parent_outcome_id').references(() => outcomes.id, { onDelete: 'cascade' }),

    // Extras
    stateChanges: jsonb('state_changes').default([]).notNull(),
  },
  () => ({
    oneParent: check(
      'one_parent',
      sql`(parent_scene_id IS NOT NULL) <> (parent_outcome_id IS NOT NULL)`,
    ),
    oneDest: check(
      'one_dest',
      sql`NOT (next_scene_id IS NOT NULL AND next_action_id IS NOT NULL)`,
    ),
  }),
);

/* =============================================================
   OPTIONAL reference tables
   =============================================================*/
export const items = pgTable('items', {
  id:   text('id').primaryKey(),
  name: text('name').notNull(),
});

export const flags = pgTable('flags', {
  id:   text('id').primaryKey(),
  name: text('name').notNull(),
});

