import { db } from './firebase';
import { ref, get, push, query, orderByChild, limitToLast } from 'firebase/database';

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  bestCombo: number;
  roomReached: number;
  date: string;
}

const LEADERBOARD_REF = 'mine-run/leaderboard';
const MAX_ENTRIES = 50;

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const q = query(ref(db, LEADERBOARD_REF), orderByChild('score'), limitToLast(MAX_ENTRIES));
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];

    const entries: LeaderboardEntry[] = [];
    snapshot.forEach((child) => {
      entries.push(child.val() as LeaderboardEntry);
    });

    // Firebase limitToLast returns ascending, we want descending
    return entries.reverse();
  } catch {
    return [];
  }
}

export async function addToLeaderboard(entry: Omit<LeaderboardEntry, 'date'>): Promise<number> {
  try {
    const newEntry: LeaderboardEntry = {
      ...entry,
      nickname: entry.nickname.slice(0, 12),
      date: new Date().toISOString(),
    };

    await push(ref(db, LEADERBOARD_REF), newEntry);

    // Get rank
    const board = await getLeaderboard();
    const rank = board.findIndex(
      (e) => e.score === newEntry.score && e.nickname === newEntry.nickname && e.date === newEntry.date
    );
    return rank === -1 ? -1 : rank + 1;
  } catch {
    return -1;
  }
}
