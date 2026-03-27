'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';

const RANK_COLORS = ['text-amber-400', 'text-slate-300', 'text-amber-700'];

export default function Leaderboard() {
  const screen = useGameStore((s) => s.flow.screen);
  const setScreen = useGameStore((s) => s.actions.setScreen);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (screen === 'meta_shop') {
      setEntries(getLeaderboard());
    }
  }, [screen]);

  // Using meta_shop screen for leaderboard (reusing existing screen type)
  if (screen !== 'meta_shop') return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white px-4">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-black text-center mb-6">Leaderboard</h1>

        {entries.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            No records yet. Play a game!
          </div>
        ) : (
          <div className="bg-slate-800/80 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2.5rem_1fr_5rem_4rem] gap-2 px-4 py-2 text-xs text-slate-500 border-b border-slate-700">
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
                  ${i % 2 === 0 ? 'bg-slate-800/50' : ''}
                  ${i < 3 ? 'font-bold' : ''}
                `}
              >
                <div className={i < 3 ? RANK_COLORS[i] : 'text-slate-500'}>
                  {i + 1}
                </div>
                <div className="truncate">{entry.nickname}</div>
                <div className="text-right tabular-nums">{entry.score.toLocaleString()}</div>
                <div className="text-right text-slate-400">{entry.roomReached}/5</div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setScreen('title')}
          className="w-full mt-6 px-8 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-all cursor-pointer"
        >
          Back to Title
        </button>
      </div>
    </div>
  );
}
