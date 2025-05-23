import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const game = searchParams.get('game') || 'cute-animals';
  const filePath = path.join(process.cwd(), 'data', 'games', game, 'scenes.json');
  let scenes = {};
  try {
    scenes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    // File may not exist yet
  }
  return NextResponse.json(scenes);
} 