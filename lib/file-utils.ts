import { promises as fs } from 'fs';
import path from 'path';
import { Action, Scene } from '@/app/types';

// --- File Path Utilities ---

const getGameDataDir = (gameId: string) => path.join(process.cwd(), 'data', 'games', gameId);
const getActionsFilePath = (gameId: string) => path.join(getGameDataDir(gameId), 'actions.json');
const getScenesFilePath = (gameId: string) => path.join(getGameDataDir(gameId), 'scenes.json');

// --- Generic File Operations ---

async function readFileAsJson<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return defaultValue;
        }
        throw error;
    }
}

async function writeFileAsJson(filePath: string, data: unknown): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// --- Action-Specific File Operations ---

export async function readActions(gameId: string): Promise<Record<string, Action>> {
    const filePath = getActionsFilePath(gameId);
    return await readFileAsJson<Record<string, Action>>(filePath, {});
}

export async function writeActions(gameId: string, actions: Record<string, Action>): Promise<void> {
    const filePath = getActionsFilePath(gameId);
    await writeFileAsJson(filePath, actions);
}

export async function writeAction(gameId: string, action: Action): Promise<void> {
    const actions = await readActions(gameId);
    actions[action.id] = action;
    await writeActions(gameId, actions);
}

export async function deleteAction(gameId: string, actionId: string): Promise<void> {
    const actions = await readActions(gameId);
    if (actions[actionId]) {
        delete actions[actionId];
        await writeActions(gameId, actions);
    }
}

// --- Scene-Specific File Operations ---

export async function readScenes(gameId: string): Promise<Record<string, Scene>> {
    const filePath = getScenesFilePath(gameId);
    return await readFileAsJson<Record<string, Scene>>(filePath, {});
}

export async function writeScenes(gameId: string, scenes: Record<string, Scene>): Promise<void> {
    const filePath = getScenesFilePath(gameId);
    await writeFileAsJson(filePath, scenes);
}

export async function writeScene(gameId: string, scene: Scene): Promise<void> {
    const scenes = await readScenes(gameId);
    scenes[scene.id] = scene;
    await writeScenes(gameId, scenes);
}

export async function deleteScene(gameId: string, sceneId: string): Promise<void> {
    const scenes = await readScenes(gameId);
    if (scenes[sceneId]) {
        delete scenes[sceneId];
        await writeScenes(gameId, scenes);
    }
} 