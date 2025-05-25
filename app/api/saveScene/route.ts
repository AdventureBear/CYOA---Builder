import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { Scene } from '@/app/types'

export async function POST(request: Request) {
    const { scene, game } = await request.json();
    if (!game || !scene || !scene.id) {
        return NextResponse.json({ error: 'Missing game or scene data' }, { status: 400 });
    }
    try {
        await persistSceneToGame(scene, game);
        return NextResponse.json({ message: 'Scene persisted successfully' });
    } catch (error) {
        console.error('Error persisting scene:', error);
        return NextResponse.json({ error: 'Failed to persist scene' }, { status: 500 });
    }
}

async function persistSceneToGame(scene: Scene, game: string) {
    const filePath = path.join(process.cwd(), 'data', 'games', game, 'scenes.json');
    let scenesObj: Record<string, Scene> = {};
    try {
        const content = await fs.readFile(filePath, 'utf8');
        scenesObj = JSON.parse(content);
    } catch (err) {
        // File may not exist yet, that's fine
    }
    scenesObj[scene.id] = scene;
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(scenesObj, null, 2), 'utf8');
}