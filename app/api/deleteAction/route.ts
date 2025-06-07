import { NextResponse } from 'next/server'
import { deleteAction } from '@/lib/file-utils';

export async function POST(request: Request) {
    const { actionId, game } = await request.json();
    if (!game || !actionId) {
        return NextResponse.json({ error: 'Missing game or actionId' }, { status: 400 });
    }
    try {
        await deleteAction(game, actionId);
        return NextResponse.json({ message: 'Action deleted successfully' });
    } catch (error) {
        console.error('Error deleting action:', error);
        return NextResponse.json({ error: 'Failed to delete action' }, { status: 500 });
    }
} 