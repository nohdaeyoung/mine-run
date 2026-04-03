'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';

function formatDate(date: string) {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${mm}.${dd} ${hh}:${min}`;
}

const RANK_ICONS = ['🌟', '🌿', '🍃'];

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
      getLeaderboard().then((data) => { setEntries(data); setLoading(false); });
    }
  }, [screen]);

  if (screen !== 'meta_shop') return null;

  const displayed = showAll ? entries : entries.slice(0, 10);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-[#5b4a3a] px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🏵️</div>
          <h1 className="text-2xl font-extrabold text-[#5b8a4e]">Leaderboard</h1>
        </div>

        {loading ? (
          <div className="text-center text-[#8b7d6b]/60 py-12 italic">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-[#8b7d6b]/60 py-12 wc-panel rounded-2xl">
            <div className="text-3xl mb-2">🌱</div>
            No records yet. Start a journey!
          </div>
        ) : (
          <div className="wc-panel rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2rem_1fr_4.5rem_5rem_2.5rem] gap-1 px-3 py-2 text-[10px] text-[#8b7d6b]/60 border-b border-[#c4a882]/10">
              <div>#</div>
              <div>Name</div>
              <div className="text-right">Score</div>
              <div className="text-right">Time</div>
              <div className="text-right">Ver</div>
            </div>

            {displayed.map((entry, i) => (
              <div
                key={i}
                className={`grid grid-cols-[2rem_1fr_4.5rem_5rem_2.5rem] gap-1 px-3 py-2.5 text-sm
                  ${i % 2 === 0 ? 'bg-[#f5ede3]/30' : ''}
                  ${i < 3 ? 'font-bold' : ''}`}
              >
                <div className={i < 3 ? 'text-base' : 'text-[#8b7d6b]/60'}>
                  {i < 3 ? RANK_ICONS[i] : i + 1}
                </div>
                <div className="truncate">{entry.nickname}</div>
                <div className="text-right tabular-nums">{entry.score.toLocaleString()}</div>
                <div className="text-right text-[#8b7d6b]/40 text-[10px] tabular-nums">{formatDate(entry.date)}</div>
                <div className="text-right text-[#8b7d6b]/40 text-[10px]">{entry.version || '-'}</div>
              </div>
            ))}

            {entries.length > 10 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2 text-xs text-[#8b7d6b]/60 hover:text-[#5b4a3a] hover:bg-[#f0ead6]/30 transition-colors cursor-pointer border-t border-[#c4a882]/10 italic"
              >
                {showAll ? '- Collapse' : `+ ${entries.length - 10} more`}
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => setScreen('title')}
          className="w-full mt-6 px-8 py-3 wc-panel text-[#8b7d6b] font-bold rounded-full hover:text-[#5b4a3a] cursor-pointer transition-colors"
        >
          Back to Forest
        </button>
      </div>
    </div>
  );
}
