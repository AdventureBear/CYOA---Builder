// app/api/games/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const gamesDir = path.join(process.cwd(), 'data', 'games');
  const games = fs.readdirSync(gamesDir).filter((f) => fs.statSync(path.join(gamesDir, f)).isDirectory());
  return NextResponse.json(games);
}