const STORAGE_KEY = 'mine-run-leaderboard';
const MAX_ENTRIES = 10;

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  bestCombo: number;
  roomReached: number;
  date: string;
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToLeaderboard(entry: LeaderboardEntry): number {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable
  }

  // Return rank (1-based), or -1 if not in top 10
  const rank = trimmed.findIndex(
    (e) => e.score === entry.score && e.nickname === entry.nickname && e.date === entry.date
  );
  return rank === -1 ? -1 : rank + 1;
}

export function isTopScore(score: number): boolean {
  const board = getLeaderboard();
  if (board.length < MAX_ENTRIES) return true;
  return score > board[board.length - 1].score;
}
