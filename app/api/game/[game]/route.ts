import { NextResponse } from 'next/server';
import { readActions, readScenes } from '@/lib/file-utils';

export async function GET(
  request: Request,
  { params }: { params: { game: string } }
) {
  const gameId = params.game;
  if (!gameId) {
    return NextResponse.json({ error: 'Missing game ID' }, { status: 400 });
  }

  try {
    const [actions, scenes] = await Promise.all([
      readActions(gameId),
      readScenes(gameId),
    ]);

    if (Object.keys(scenes).length === 0) {
        return NextResponse.json({ error: 'Game not found or no scenes' }, { status: 404 });
    }

    return NextResponse.json({ actions, scenes });

  } catch (error) {
    console.error(`Error loading game data for ${gameId}:`, error);
    return NextResponse.json({ error: 'Failed to load game data' }, { status: 500 });
  }
} 