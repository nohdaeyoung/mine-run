// GitHub JSON-based leaderboard storage
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const REPO = 'nohdaeyoung/mine-run';
const FILE_PATH = 'data/leaderboard.json';
const BRANCH = 'main';

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  bestCombo: number;
  roomReached: number;
  date: string;
}

interface GitHubFileResponse {
  content: string;
  sha: string;
}

async function getFile(): Promise<{ data: LeaderboardEntry[]; sha: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    }
  );

  if (res.status === 404) {
    return { data: [], sha: '' };
  }

  const file: GitHubFileResponse = await res.json();
  const decoded = Buffer.from(file.content, 'base64').toString('utf-8');
  return { data: JSON.parse(decoded), sha: file.sha };
}

async function putFile(data: LeaderboardEntry[], sha: string): Promise<{ ok: boolean; error?: string }> {
  const json = JSON.stringify(data, null, 2);
  const content = Buffer.from(json, 'utf-8').toString('base64');

  const body: Record<string, string> = {
    message: `update leaderboard [${new Date().toISOString()}]`,
    content,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error('GitHub PUT failed:', res.status, text);
    return { ok: false, error: `${res.status}: ${text}` };
  }
  return { ok: true };
}

const MAX_ENTRIES = 50;

export async function getServerLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await getFile();
  return data;
}

export async function addToServerLeaderboard(entry: LeaderboardEntry): Promise<{ rank: number; error?: string }> {
  const { data: board, sha } = await getFile();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, MAX_ENTRIES);
  const result = await putFile(trimmed, sha);

  if (!result.ok) {
    return { rank: -1, error: result.error };
  }

  const rank = trimmed.findIndex(
    (e) => e.score === entry.score && e.nickname === entry.nickname && e.date === entry.date
  );
  return { rank: rank === -1 ? -1 : rank + 1 };
}
