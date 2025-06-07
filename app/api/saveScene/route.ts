import { NextResponse } from 'next/server'
import { writeScene } from '@/lib/file-utils'

export async function POST(request: Request) {
    const { scene, game } = await request.json();
    if (!game || !scene || !scene.id) {
        return NextResponse.json({ error: 'Missing game or scene data' }, { status: 400 });
    }
    try {
        await writeScene(game, scene);
        return NextResponse.json({ message: 'Scene persisted successfully' });
    } catch (error) {
        console.error('Error persisting scene:', error);
        return NextResponse.json({ error: 'Failed to persist scene' }, { status: 500 });
    }
}