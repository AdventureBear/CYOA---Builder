import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";



export async function DELETE(request: Request) {
    const { id, game } = await request.json();
    console.log('deleting scene from API', id, game);
    const filePath = path.join(process.cwd(), 'data', 'games', game, 'scenes.json');
    const scenes = await fs.readFile(filePath, 'utf8');
    const scenesObj = JSON.parse(scenes);
    delete scenesObj[id];
    await fs.writeFile(filePath, JSON.stringify(scenesObj, null, 2), 'utf8');
    return NextResponse.json({ message: 'Scene deleted successfully' });
}

