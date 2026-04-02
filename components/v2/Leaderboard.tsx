'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';

const RANK_ICONS = ['👑', '🥈', '🥉'];

export default function Leaderboard() {
  const screen = useGameStore((s) => s.flow.screen);
  const setScreen = useGameStore((s) => s.actions.setScreen);
  const totalRooms = useGameStore((s) => s.run.totalRooms);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (screen === 'meta_shop') {
      setLoading(true);
      getLeaderboard().then((data) => {
        setEntries(data);
        setLoading(false);
      });
    }
  }, [screen]);

  if (screen !== 'meta_shop') return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 via-orange-50 to-yellow-50 text-pink-800 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🏆</div>
          <h1 className="text-3xl font-black text-pink-600">Leaderboard</h1>
        </div>

        {loading ? (
          <div className="text-center text-pink-300 py-12">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-pink-300 py-12 bg-white/60 rounded-2xl">
            <div className="text-3xl mb-2">🌸</div>
            No records yet. Play a game!
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-pink-200/60 shadow-lg shadow-pink-100/50">
            {/* Header */}
            <div className="grid grid-cols-[2.5rem_1fr_5rem_4rem] gap-2 px-4 py-2 text-xs text-pink-400 border-b border-pink-100">
              <div>#</div>
              <div>Name</div>
              <div className="text-right">Score</div>
              <div className="text-right">Room</div>
            </div>

            {/* Entries */}
            {entries.map((entry, i) => (
              <div
                key={i}
                className={`
                  grid grid-cols-[2.5rem_1fr_5rem_4rem] gap-2 px-4 py-3 text-sm
                  ${i % 2 === 0 ? 'bg-pink-50/50' : ''}
                  ${i < 3 ? 'font-bold' : ''}
                `}
              >
                <div className={i < 3 ? 'text-lg' : 'text-pink-400'}>
                  {i < 3 ? RANK_ICONS[i] : i + 1}
                </div>
                <div className="truncate text-pink-700">{entry.nickname}</div>
                <div className="text-right tabular-nums text-pink-700">{entry.score.toLocaleString()}</div>
                <div className="text-right text-pink-400">{entry.roomReached}/{totalRooms || 13}</div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setScreen('title')}
          className="w-full mt-6 px-8 py-3 bg-white/80 text-pink-500 font-bold rounded-full hover:bg-white transition-all cursor-pointer border-2 border-pink-200"
        >
          Back to Title
        </button>
      </div>
    </div>
  );
}
