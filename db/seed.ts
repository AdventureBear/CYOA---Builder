/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema';
import { promises as fs } from 'fs';
import path from 'path';
type RawScene = Record<string, any>;
type RawAction = Record<string, any>;

// De-structure for easier access
const { scenes, actions, outcomes, choices } = schema;

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
    console.log('🌱 Seeding database (new schema)…');

    /* 1 ─ Wipe tables (order: children → parents) */
    await db.delete(choices);
    await db.delete(outcomes);
    await db.delete(actions);
    await db.delete(scenes);
    console.log('🗑️  Cleared previous data.');

    /* 2 ─ Load JSON */
    const root = path.join(process.cwd(), 'data', 'games', 'cute-animals');
    const actionsData = JSON.parse(
        await fs.readFile(path.join(root, 'actions.json'), 'utf-8'),
      ) as Record<string, RawAction>;
      
      const scenesData = JSON.parse(
        await fs.readFile(path.join(root, 'scenes.json'), 'utf-8'),
      ) as Record<string, RawScene>;    console.log('📂 JSON loaded.');

    /* 3 ─ Ensure placeholder actions for undefined refs */
    const referencedIds = new Set<string>();
    Object.values(scenesData).forEach(s => (s.actions ?? []).forEach((id:string)=>referencedIds.add(id)));
    referencedIds.forEach(id => { if (!actionsData[id]) actionsData[id] = { id, trigger:'onEnter', outcomes:[] }; });

    /* 4 ─ Prepare insert arrays */
    const sceneRows: typeof scenes.$inferInsert[] = [];
    const actionRows: typeof actions.$inferInsert[] = [];
    const outcomeRows: Omit<typeof outcomes.$inferInsert, 'id'>[] = [];
    const outcomeChoiceBuffer: { actionId: string; idx:number; choices:any[] }[] = [];
    const choiceRows: Omit<typeof choices.$inferInsert, 'id'>[] = [];
    const sceneActionRows: typeof schema.sceneActions.$inferInsert[] = [];

    const toNull = (v: any) => (v === undefined || v === null || v === '' ? null : v);

    // scenes
    for (const s of Object.values(scenesData) as any[]) {
        sceneRows.push({
            id: s.id,
            location: s.location ?? s.name ?? 'Unknown',
            description: s.description ?? '',
            parentSceneId: s.parentSceneId ?? null,
            season: s.season ?? null,
            isRequired: s.isRequired ?? false,
            locationImage: s.locationImage ?? null,
        });

        // scene→action junctions
        (s.actions ?? []).forEach((aid:string)=>{
            sceneActionRows.push({ sceneId: s.id, actionId: aid });
        });

        // choices belonging to scene
        (s.choices ?? []).forEach((c:any) => {
            choiceRows.push({
                text: c.text,
                resultMsg: c.resultMessage ?? null,
                resultBtn: c.resultButtonText ?? null,
                nextSceneId: toNull(c.nextNodeId),
                nextActionId: toNull(c.nextAction),
                parentSceneId: s.id,
                stateChanges: c.stateChanges ?? [],
            });
        });
    }

    // collect referenced scene IDs from choices to ensure placeholder scenes
    const referencedSceneIds = new Set<string>();
    const referencedActionIds = new Set<string>();

    // actions & outcomes
    for (const a of Object.values(actionsData) as any[]) {
        actionRows.push({
            id: a.id,
            trigger: a.trigger ?? 'onEnter',
            failMessage: a.failMessage ?? null,
            conditions: a.conditions ?? [],
        });

        (a.outcomes ?? []).forEach((o:any, idx:number) => {
            outcomeRows.push({
                actionId: a.id,
                description: o.description ?? '',
                conditions: o.conditions ?? [],
                stateChanges: o.stateChanges ?? [],
            });

            outcomeChoiceBuffer.push({
                actionId: a.id,
                idx,
                choices: o.choices ?? [],
            });
        });
    }

    choiceRows.forEach((ch) => {
        if (ch.nextSceneId) referencedSceneIds.add(ch.nextSceneId);
        if (ch.nextActionId) referencedActionIds.add(ch.nextActionId);
    });

    referencedSceneIds.forEach((id) => {
        if (!scenesData[id]) {
            sceneRows.push({
                id,
                location: id,
                description: id,
                parentSceneId: null,
                season: null,
                isRequired: false,
                locationImage: null,
            });
        }
    });

    /* 5 ─ Placeholder actions (draft) */
    const placeholderActions = Array.from(referencedActionIds)
        .filter(id => !actionsData[id]) // ensure not already in main actionRows
        .map(id => ({
            id,
            trigger: 'onChoice' as const,
            status: 'draft' as const,
            conditions: [] as unknown,
        }));

    // merge placeholder actions into actionRows so all actions are inserted together
    if (placeholderActions.length) {
        actionRows.push(...placeholderActions as any);
        console.log(`➕ ${placeholderActions.length} placeholder actions prepared.`);
    }

    /* 6 ─ Insert (parents before children) */
    if (sceneRows.length)   await db.insert(scenes).values(sceneRows);
    if (actionRows.length)  await db.insert(actions).values(actionRows);
    if (outcomeRows.length) await db.insert(outcomes).values(outcomeRows as any);
    if (sceneActionRows.length) await db.insert(schema.sceneActions).values(sceneActionRows);

    /* 6b ─ outcome-level choices now that we have outcome IDs */
    if (outcomeChoiceBuffer.length) {
        // fetch outcomes to map id by actionId & description
        const dbOutcomes = await db.select().from(outcomes);
        const grouped: Record<string, typeof dbOutcomes[number][]> = {};
        dbOutcomes.forEach(o=>{ (grouped[o.actionId] ||= []).push(o);});

        outcomeChoiceBuffer.forEach(({actionId,idx,choices:ocs})=>{
            const list = grouped[actionId] || [];
            const target = list[idx];
            const oid = target?.id as number | undefined;
            if(!oid) return;
            ocs.forEach((c:any)=>{
                choiceRows.push({
                    text: c.text,
                    resultMsg: c.resultMessage ?? null,
                    resultBtn: c.resultButtonText ?? null,
                    nextSceneId: toNull(c.nextNodeId),
                    nextActionId: toNull(c.nextAction),
                    parentOutcomeId: oid,
                    parentSceneId: null,
                    stateChanges: c.stateChanges ?? [],
                });
            });
        });
    }

    if (choiceRows.length)  await db.insert(choices).values(choiceRows as any);

    console.log(`✅ Inserted ${sceneRows.length} scenes, ${actionRows.length} actions (incl. placeholders), ${outcomeRows.length} outcomes, ${sceneActionRows.length} links, ${choiceRows.length} choices.`);

    await client.end();
}

seed().catch(err => { console.error(err); process.exit(1); }); 