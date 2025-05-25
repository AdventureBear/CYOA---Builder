import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { Action } from '@/app/types'

export async function POST(request: Request) {
    const { action, game } = await request.json();
    if (!game || !action || !action.id) {
        return NextResponse.json({ error: 'Missing game or action data' }, { status: 400 });
    }
    try {
        await persistActionToGame(action, game);
        return NextResponse.json({ message: 'Action persisted successfully' });
    } catch (error) {
        console.error('Error persisting action:', error);
        return NextResponse.json({ error: 'Failed to persist action' }, { status: 500 });
    }
}

async function persistActionToGame(action: Action, game: string) {
    const filePath = path.join(process.cwd(), 'data', 'games', game, 'actions.json');
    let actionsObj: Record<string, Action> = {};
    try {
        const content = await fs.readFile(filePath, 'utf8');
        actionsObj = JSON.parse(content);
    } catch (err) {
        // File may not exist yet, that's fine
    }
    actionsObj[action.id] = action;
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(actionsObj, null, 2), 'utf8');
} 