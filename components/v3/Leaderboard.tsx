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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1025] text-[#f0e6ff] px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-[#f0c040] mb-6">LEADERBOARD</h1>

        {loading ? (
          <div className="text-center text-[#7a6a9a] py-12">LOADING...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-[#7a6a9a] py-12 bg-[#2a1f3d] border-2 border-[#4a3a6b]">
            NO RECORDS YET
          </div>
        ) : (
          <div className="bg-[#2a1f3d] border-2 border-[#4a3a6b] overflow-hidden">
            <div className="grid grid-cols-[2rem_1fr_4.5rem_5rem_2.5rem] gap-1 px-3 py-2 text-[10px] text-[#7a6a9a] border-b border-[#4a3a6b]">
              <div>#</div>
              <div>NAME</div>
              <div className="text-right">SCORE</div>
              <div className="text-right">TIME</div>
              <div className="text-right">VER</div>
            </div>

            {displayed.map((entry, i) => (
              <div
                key={i}
                className={`grid grid-cols-[2rem_1fr_4.5rem_5rem_2.5rem] gap-1 px-3 py-2.5 text-xs
                  ${i % 2 === 0 ? 'bg-[#2a1f3d]' : 'bg-[#1a1025]'}
                  ${i < 3 ? 'font-bold' : ''}
                `}
              >
                <div className={
                  i === 0 ? 'text-[#f0c040]' :
                  i === 1 ? 'text-[#b8a9d4]' :
                  i === 2 ? 'text-[#d2691e]' : 'text-[#7a6a9a]'
                }>
                  {i + 1}
                </div>
                <div className="truncate">{entry.nickname}</div>
                <div className="text-right tabular-nums">{entry.score.toLocaleString()}</div>
                <div className="text-right text-[#4a3a6b] text-[10px] tabular-nums font-kr">{formatDate(entry.date)}</div>
                <div className="text-right text-[#4a3a6b] text-[10px]">{entry.version || '-'}</div>
              </div>
            ))}

            {entries.length > 10 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2 text-[10px] text-[#7a6a9a] hover:text-[#f0e6ff] hover:bg-[#3d2e56] cursor-pointer transition-none border-t border-[#4a3a6b]"
              >
                {showAll ? '- COLLAPSE' : `+ ${entries.length - 10} MORE`}
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => setScreen('title')}
          className="w-full mt-6 px-8 py-3 bg-[#2a1f3d] text-[#b8a9d4] font-bold text-sm
            border-2 border-t-[#4a3a6b] border-l-[#4a3a6b] border-b-[#1a1025] border-r-[#1a1025]
            hover:text-[#f0e6ff] cursor-pointer transition-none"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
