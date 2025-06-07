import { NextResponse } from 'next/server'
import { writeAction } from '@/lib/file-utils'

export async function POST(request: Request) {
    const { action, game } = await request.json();
    if (!game || !action || !action.id) {
        return NextResponse.json({ error: 'Missing game or action data' }, { status: 400 });
    }
    try {
        await writeAction(game, action);
        return NextResponse.json({ message: 'Action persisted successfully' });
    } catch (error) {
        console.error('Error persisting action:', error);
        return NextResponse.json({ error: 'Failed to persist action' }, { status: 500 });
    }
} 