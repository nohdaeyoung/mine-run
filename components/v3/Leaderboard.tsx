'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';

export default function Leaderboard() {
  const screen = useGameStore((s) => s.flow.screen);
  const setScreen = useGameStore((s) => s.actions.setScreen);
  const totalRooms = useGameStore((s) => s.run.totalRooms);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (screen === 'meta_shop') {
      setLoading(true);
      getLeaderboard().then((data) => { setEntries(data); setLoading(false); });
    }
  }, [screen]);

  if (screen !== 'meta_shop') return null;

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
            <div className="grid grid-cols-[2.5rem_1fr_5rem_4rem] gap-2 px-4 py-2 text-[10px] text-[#7a6a9a] border-b border-[#4a3a6b]">
              <div>#</div>
              <div>NAME</div>
              <div className="text-right">SCORE</div>
              <div className="text-right">ROOM</div>
            </div>

            {entries.map((entry, i) => (
              <div
                key={i}
                className={`grid grid-cols-[2.5rem_1fr_5rem_4rem] gap-2 px-4 py-2.5 text-xs
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
                <div className="text-right text-[#7a6a9a]">{entry.roomReached}/{totalRooms || 13}</div>
              </div>
            ))}
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
