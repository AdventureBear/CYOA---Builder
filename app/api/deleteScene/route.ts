import { NextResponse } from 'next/server'
import { deleteScene } from '@/lib/file-utils'

export async function POST(request: Request) {
    const { sceneId, gameId } = await request.json();
    if (!gameId || !sceneId) {
        return NextResponse.json({ error: 'Missing gameId or sceneId' }, { status: 400 });
    }
    try {
        await deleteScene(gameId, sceneId);
        return NextResponse.json({ message: 'Scene deleted successfully' });
    } catch (error) {
        console.error('Error deleting scene:', error);
        return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 });
    }
}

