import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const getGameDataPath = (gameId: string) => path.join(process.cwd(), 'game-data', `${gameId}.json`);

export async function DELETE(
  request: Request,
  { params }: { params: { game: string; actionId: string } }
) {
  const { game, actionId } = params;

  if (!game || !actionId) {
    return NextResponse.json({ message: 'Missing game ID or action ID' }, { status: 400 });
  }

  const filePath = getGameDataPath(game);

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const gameData = JSON.parse(fileContents);

    if (!gameData.actions || !gameData.actions[actionId]) {
      return NextResponse.json({ message: 'Action not found' }, { status: 404 });
    }

    delete gameData.actions[actionId];

    await fs.writeFile(filePath, JSON.stringify(gameData, null, 2));

    return NextResponse.json({ message: 'Action deleted successfully' });
  } catch (error) {
    console.error('Error deleting action:', error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ message: 'Game data file not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 