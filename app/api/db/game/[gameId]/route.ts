/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';
import { Choice as BaseChoice } from '@/app/types';

// It's better to manage the DB connection in a separate utility file, 
// but for now, we'll instantiate it here.
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

// --- helper types derived from Drizzle schemas ---
type DBChoice   = typeof schema.choices.$inferSelect;
type DBOutcome  = typeof schema.outcomes.$inferSelect;
type DBAction   = typeof schema.actions.$inferSelect;
type DBScene    = typeof schema.scenes.$inferSelect;

export type Choice = Omit<DBChoice, 'nextSceneId' | 'nextActionId'> & {
  nextSceneId: string | null;
  nextActionId: string | null;
  // legacy aliases expected by existing front-end code
  nextNodeId?: string | null;
  nextScene?:  string | null;
  nextAction?: string | null;
} & Pick<BaseChoice, Exclude<keyof BaseChoice, 'nextNodeId' | 'nextScene' | 'nextAction'>>;

export interface Outcome extends DBOutcome {
  choices: Choice[];
}

export interface Action extends DBAction {
  outcomes: Outcome[];
}

export interface Scene extends DBScene {
  actions: string[];
  choices: Choice[];
}

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  console.log('✅ Fetching game data from the DATABASE!');
  const gameId = params.gameId; // We can use this later to support multiple games
  if (!gameId) {
    return NextResponse.json({ error: 'Missing game ID' }, { status: 400 });
  }

  try {
    const allScenes = await db.query.scenes.findMany();
    const allActions = await db.query.actions.findMany();
    const allOutcomes = await db.query.outcomes.findMany();
    const allChoices = await db.query.choices.findMany();
    const allSceneActions = await db.query.sceneActions.findMany();

    // --- organise choices ---
    const sceneChoices: Record<string, Choice[]> = {};
    const outcomeChoices: Record<number, Choice[]> = {};

    const toClientChoice = (row: typeof allChoices[number]): Choice => ({
      ...row,
      nextNodeId: row.nextSceneId ?? null,     // legacy alias for frontend
      nextAction: row.nextActionId ?? null,    // legacy alias for frontend
      nextScene:  row.nextSceneId ?? null,     // another legacy alias
      nextSceneId: row.nextSceneId ?? null,     // keep current name
      nextActionId: row.nextActionId ?? null,
    });

    allChoices.forEach((c) => {
      const cc = toClientChoice(c);
      if (cc.parentSceneId) {
        (sceneChoices[cc.parentSceneId] ||= []).push(cc);
      } else if (cc.parentOutcomeId !== null) {
        (outcomeChoices[cc.parentOutcomeId] ||= []).push(cc);
      }
    });

    // --- outcomes with nested choices ---
    const outcomesById: Record<number, Outcome> = {};
    allOutcomes.forEach((o) => {
      outcomesById[o.id] = { ...o, choices: outcomeChoices[o.id] ?? [] };
    });

    // Convert arrays to the Record<string, Scene> and Record<string, Action> format
    const actionsRecord = allActions.reduce<Record<string, Action>>((acc, action) => {
      const nestedOutcomes = allOutcomes
        .filter((o) => o.actionId === action.id)
        .map((o) => outcomesById[o.id]);
      acc[action.id] = { ...action, outcomes: nestedOutcomes };
      return acc;
    }, {} as Record<string, Action>);
    
    // Create a mutable copy of scenes to add the 'actions' array
    const scenesWithActions: Scene[] = allScenes.map(scene => ({
      ...scene,
      actions: [] as string[],
      choices: sceneChoices[scene.id] ?? [],
    }));

    const scenesRecord = scenesWithActions.reduce((acc, scene) => {
        acc[scene.id] = scene;
        return acc;
    }, {} as Record<string, Scene>);

    // Populate the actions array for each scene
    allSceneActions.forEach(sceneAction => {
        if (scenesRecord[sceneAction.sceneId]) {
            scenesRecord[sceneAction.sceneId].actions.push(sceneAction.actionId);
        }
    });

    if (Object.keys(scenesRecord).length === 0) {
        return NextResponse.json({ error: 'Game not found or no scenes' }, { status: 404 });
    }

    return NextResponse.json({ actions: actionsRecord, scenes: scenesRecord });

  } catch (error) {
    console.error(`Error loading game data from DB for ${gameId}:`, error);
    return NextResponse.json({ error: 'Failed to load game data from database' }, { status: 500 });
  }
} 