'use client';

import { useGameStore } from '@/lib/store';
import { startNewRun } from '@/lib/run';

export default function TitleScreen() {
  const screen = useGameStore((s) => s.flow.screen);
  const bestScore = useGameStore((s) => s.meta.stats.bestScore);
  const totalRuns = useGameStore((s) => s.meta.stats.totalRuns);
  const minerals = useGameStore((s) => s.meta.minerals);
  const setScreen = useGameStore((s) => s.actions.setScreen);

  if (screen !== 'title') return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-black tracking-tight mb-2">
          <span className="text-red-500">MINE</span>
          <span className="text-white"> RUN</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Roguelike Minesweeper — Be Bold, Be Rewarded
        </p>

        <button
          onClick={() => startNewRun()}
          className="px-12 py-4 bg-white text-black font-bold rounded-xl text-xl hover:bg-slate-200 transition-all hover:scale-105 cursor-pointer shadow-lg"
        >
          PLAY
        </button>

        {totalRuns > 0 && (
          <div className="mt-8 bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
            <div className="flex gap-6 justify-center">
              <span>Runs: {totalRuns}</span>
              <span>Best: {bestScore.toLocaleString()}</span>
              <span>💎 {minerals}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setScreen('meta_shop')}
          className="mt-4 px-8 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-all cursor-pointer"
        >
          Leaderboard
        </button>

        <p className="mt-6 text-xs text-slate-600">
          Left click to reveal / Right click to flag
        </p>
      </div>
    </div>
  );
}
