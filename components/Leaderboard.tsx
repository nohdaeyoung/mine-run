'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';

const RANK_COLORS = ['text-amber-400', 'text-slate-300', 'text-amber-700'];

function formatDate(date: string) {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${mm}.${dd} ${hh}:${min}`;
}

export default function Leaderboard() {
  const screen = useGameStore((s) => s.flow.screen);
  const setScreen = useGameStore((s) => s.actions.setScreen);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (screen === 'meta_shop') {
      setLoading(true);
      setShowAll(false);
      getLeaderboard().then((data) => {
        setEntries(data);
        setLoading(false);
      });
    }
  }, [screen]);

  if (screen !== 'meta_shop') return null;

  const displayed = showAll ? entries : entries.slice(0, 10);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white px-4">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-black text-center mb-6">Leaderboard</h1>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            No records yet. Play a game!
          </div>
        ) : (
          <div className="bg-slate-800/80 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2rem_1fr_4.5rem_5rem_2.5rem] gap-1 px-3 py-2 text-[10px] text-slate-500 border-b border-slate-700">
              <div>#</div>
              <div>Name</div>
              <div className="text-right">Score</div>
              <div className="text-right">Time</div>
              <div className="text-right">Ver</div>
            </div>

            {displayed.map((entry, i) => (
              <div
                key={i}
                className={`
                  grid grid-cols-[2rem_1fr_4.5rem_5rem_2.5rem] gap-1 px-3 py-2.5 text-sm
                  ${i % 2 === 0 ? 'bg-slate-800/50' : ''}
                  ${i < 3 ? 'font-bold' : ''}
                `}
              >
                <div className={i < 3 ? RANK_COLORS[i] : 'text-slate-500'}>
                  {i + 1}
                </div>
                <div className="truncate">{entry.nickname}</div>
                <div className="text-right tabular-nums">{entry.score.toLocaleString()}</div>
                <div className="text-right text-slate-500 text-[10px] tabular-nums">{formatDate(entry.date)}</div>
                <div className="text-right text-slate-600 text-[10px]">{entry.version || '-'}</div>
              </div>
            ))}

            {!showAll && entries.length > 10 && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer border-t border-slate-700"
              >
                + {entries.length - 10} more
              </button>
            )}
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
