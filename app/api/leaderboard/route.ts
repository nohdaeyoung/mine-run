import { NextRequest, NextResponse } from 'next/server';
import { getServerLeaderboard, addToServerLeaderboard } from '@/lib/redis';

export async function GET() {
  try {
    const board = await getServerLeaderboard();
    return NextResponse.json(board);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nickname, score, bestCombo, roomReached } = body;

    if (!nickname || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const entry = {
      nickname: String(nickname).slice(0, 12),
      score,
      bestCombo: bestCombo ?? 0,
      roomReached: roomReached ?? 0,
      date: new Date().toISOString(),
    };

    const rank = await addToServerLeaderboard(entry);
    return NextResponse.json({ rank });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
