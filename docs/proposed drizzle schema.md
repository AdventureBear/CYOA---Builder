```ts
/* ------------------------------------------------------------------
   Hazel & Friends — full Drizzle schema (PostgreSQL + TypeScript)
   ------------------------------------------------------------------
   npm i drizzle-orm pg                # ORM + driver
   npm i -D drizzle-kit                # migration generator
------------------------------------------------------------------- */

import {
  pgTable,
  text, boolean, serial, timestamp, jsonb,
  primaryKey,
  pgEnum,
  index,
  check
} from 'drizzle-orm/pg-core';

/*====================================================================
  ENUMS
====================================================================*/
export const sceneStatus   = pgEnum('scene_status',   ['draft', 'published']);
export const actionStatus  = pgEnum('action_status',  ['draft', 'published']);
export const actionTrigger = pgEnum('action_trigger', ['onEnter', 'onChoice']);

/*====================================================================
  SCENES
====================================================================*/
export const scenes = pgTable('scenes', {
  id:             text('id').primaryKey(),               // ex: 'oak_tree'
  location:       text('location').notNull(),
  description:    text('description').notNull(),
  parentSceneId:  text('parent_scene_id')
                    .references(() => scenes.id, { onDelete: 'set null' }),
  season:         text('season'),
  isRequired:     boolean('is_required').default(false),
  locationImage:  text('location_image'),
  status:         sceneStatus('status').default('draft').notNull(),
  createdAt:      timestamp('created_at', { withTimezone: true })
                    .defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true })
                    .defaultNow()
});
export const scenesStatusIdx = index('scenes_status_idx')
  .on(scenes.status);

/*====================================================================
  ACTIONS
====================================================================*/
export const actions = pgTable('actions', {
  id:          text('id').primaryKey(),                  // ex: 'help_bird'
  trigger:     actionTrigger('trigger').notNull(),
  failMessage: text('fail_message'),
  conditions:  jsonb('conditions').default([]).notNull(), // deep array
  status:      actionStatus('status').default('draft').notNull(),
  createdAt:   timestamp('created_at', { withTimezone: true })
                 .defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true })
                 .defaultNow()
});
export const actionsStatusIdx = index('actions_status_idx')
  .on(actions.status);

/*====================================================================
  SCENE  ↔  ACTION  (junction)
====================================================================*/
export const sceneActions = pgTable('scene_actions', {
  sceneId:  text('scene_id')
              .references(() => scenes.id,  { onDelete: 'cascade' }),
  actionId: text('action_id')
              .references(() => actions.id, { onDelete: 'cascade' }),
  ...primaryKey('scene_id', 'action_id')
});

/*====================================================================
  OUTCOMES   (child of ACTION)
====================================================================*/
export const outcomes = pgTable('outcomes', {
  id:           serial('id').primaryKey(),
  actionId:     text('action_id')
                  .references(() => actions.id, { onDelete: 'cascade' })
                  .notNull(),
  description:  text('description').notNull(),
  conditions:   jsonb('conditions').default([]).notNull(),
  stateChanges: jsonb('state_changes').default([]).notNull(),
  createdAt:    timestamp('created_at', { withTimezone: true })
                  .defaultNow()
});

/*====================================================================
  CHOICES   (polymorphic parent & polymorphic destination)
====================================================================*/
export const choices = pgTable('choices', {
  id:            serial('id').primaryKey(),
  text:          text('text').notNull(),

  /* optional result UI */
  resultMsg:     text('result_msg'),
  resultBtn:     text('result_btn'),

  /* destination (exactly one) */
  nextSceneId:   text('next_scene_id')
                   .references(() => scenes.id),
  nextActionId:  text('next_action_id')
                   .references(() => actions.id),

  /* parent (exactly one) */
  parentSceneId:   text('parent_scene_id')
                     .references(() => scenes.id, { onDelete: 'cascade' }),
  parentOutcomeId: serial('parent_outcome_id')
                     .references(() => outcomes.id, { onDelete: 'cascade' }),

  /* extras */
  stateChanges:  jsonb('state_changes').default([]).notNull()
},
table => ({
  /* two sanity-check constraints — Drizzle supports CHECK via .extras */
  oneParent: check(
    `one_parent`,
    `(parent_scene_id IS NOT NULL) <> (parent_outcome_id IS NOT NULL)`
  ),
  oneDest: check(
    `one_dest`,
    `(next_scene_id IS NOT NULL) <> (next_action_id IS NOT NULL)`
  )
}));

/*====================================================================
  OPTIONAL  reference tables  (to keep inventory & flags consistent)
====================================================================*/
export const items = pgTable('items', {
  id:   text('id').primaryKey(),
  name: text('name').notNull()
});

export const flags = pgTable('flags', {
  id:   text('id').primaryKey(),
  name: text('name').notNull()
});


-- Fine-grained types you will use inside JSONB blobs.
CREATE TYPE condition_type  AS ENUM (
  'flagSet','flagNotSet','hasItem','doesNotHaveItem',
  'timeOfDayIs','randomChance'              -- extensible
);

CREATE TYPE state_change_type AS ENUM (
  'setFlag','removeFlag','addItem','removeItem'
);
```

**Key take-aways**

1. **`status` columns** (`draft` / `published`) let you create instant *stub* rows while the graph UI is in free-form mode.
2. **`check` constraints** on **`choices`** ensure exactly one parent and one destination, preserving referential sanity even during rapid prototyping.
3. **JSONB** keeps the deep arrays (`conditions`, `state_changes`) flexible without over-normalising.

Run `drizzle-kit generate` to get your SQL migrations, point your Next.js API routes at these tables, and you have a solid, creator-friendly backbone. Happy coding!
