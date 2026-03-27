export interface LeaderboardEntry {
  nickname: string;
  score: number;
  bestCombo: number;
  roomReached: number;
  date: string;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function addToLeaderboard(entry: Omit<LeaderboardEntry, 'date'>): Promise<number> {
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) return -1;
    const data = await res.json();
    return data.rank ?? -1;
  } catch {
    return -1;
  }
}
