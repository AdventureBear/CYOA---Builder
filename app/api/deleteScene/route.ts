import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sceneId, gameId } = await req.json();

    if (!sceneId || !gameId) {
      return NextResponse.json({ error: 'Missing sceneId or gameId' }, { status: 400 });
    }

    const sanitizedGameId = path.basename(gameId);
    const sanitizedSceneId = path.basename(sceneId);

    const filePath = path.join(process.cwd(), 'data', sanitizedGameId, `${sanitizedSceneId}.json`);
    
    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete scene:', error);
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Scene file not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 });
  }
}

