// app/api/games/[game]/scenes/route.ts
import {NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';


export async function GET(_: NextRequest, { params }: { params: { game: string } }) {
  const { game } = params;
  const scenesFilePath = path.join(process.cwd(), 'data', 'games', game, 'scenes.json');
  const actionsFilePath = path.join(process.cwd(), 'data', 'games', game, 'actions.json');
  console.log('scenesFilePath', scenesFilePath);
  console.log('actionsFilePath', actionsFilePath);
  try {
    const scenesData = fs.readFileSync(scenesFilePath, 'utf-8');
    const actionsData = fs.readFileSync(actionsFilePath, 'utf-8');
    return NextResponse.json({ scenes: JSON.parse(scenesData), actions: JSON.parse(actionsData) });
  } catch (e) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}