import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

export async function GET(
  // _request: Request,
  // _params: { params: { game: string } }
) {
  try {
    // Fetch all tables
    const [
      scenes,
      actions,
      outcomes,
      choices,
      sceneActions,
      actionOutcomes,
      sceneChoices,
      outcomeChoices,
    ] = await Promise.all([
      db.query.scenes.findMany(),
      db.query.actions.findMany(),
      db.query.outcomes.findMany(),
      db.query.choices.findMany(),
      db.query.sceneActions.findMany(),
      db.query.actionOutcomes.findMany(),
      db.query.sceneChoices.findMany(),
      db.query.outcomeChoices.findMany(),
    ]);

    // Build lookup maps for fast access
    const scenesById = Object.fromEntries(
      scenes.map(s => [s.id, { ...s, actions: [] as string[], choices: [] as typeof choices }] )
    );
    const actionsById = Object.fromEntries(
      actions.map(a => [a.id, { ...a, outcomes: [] as typeof outcomes }] )
    );
    const outcomesById = Object.fromEntries(
      outcomes.map(o => [o.id, { ...o, choices: [] as typeof choices }] )
    );
    const choicesById = Object.fromEntries(choices.map(c => [c.id, c]));

    // Link actions to scenes
    sceneActions.forEach(link => {
      if (scenesById[link.sceneId]) {
        scenesById[link.sceneId].actions.push(link.actionId);
      }
    });

    // Link choices to scenes
    sceneChoices.forEach(link => {
      if (scenesById[link.sceneId] && choicesById[link.choiceId]) {
        scenesById[link.sceneId].choices.push(choicesById[link.choiceId]);
      }
    });

    // Link outcomes to actions
    actionOutcomes.forEach(link => {
      if (actionsById[link.actionId] && outcomesById[link.outcomeId]) {
        actionsById[link.actionId].outcomes.push(outcomesById[link.outcomeId]);
      }
    });

    // Link choices to outcomes
    outcomeChoices.forEach(link => {
      if (outcomesById[link.outcomeId] && choicesById[link.choiceId]) {
        outcomesById[link.outcomeId].choices.push(choicesById[link.choiceId]);
      }
    });

    // Return as records (object maps) for fast lookup in the client
    return NextResponse.json({
      scenes: scenesById,
      actions: actionsById,
    });
  } catch (error) {
    console.error('Error assembling game data:', error);
    return NextResponse.json({ error: 'Failed to load game data' }, { status: 500 });
  }
}