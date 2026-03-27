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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow behind title */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]" />

      <div className="text-center relative z-10">
        {/* Title */}
        <h1 className="text-7xl sm:text-8xl font-black tracking-tighter mb-1">
          <span className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]">MINE</span>
          <span className="text-white"> RUN</span>
        </h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase mb-10">
          Roguelike Minesweeper — Be Bold, Be Rewarded
        </p>

        {/* Play button */}
        <button
          onClick={() => startNewRun()}
          className="group relative px-16 py-4 bg-red-500 text-white font-black rounded-lg text-xl
            hover:bg-red-400 transition-all hover:scale-105 active:scale-95
            cursor-pointer shadow-[0_0_40px_rgba(239,68,68,0.3)]
            hover:shadow-[0_0_60px_rgba(239,68,68,0.5)]"
        >
          PLAY
        </button>

        {/* Leaderboard */}
        <div className="mt-6">
          <button
            onClick={() => setScreen('meta_shop')}
            className="px-6 py-2 text-slate-400 font-medium hover:text-white transition-all cursor-pointer
              border border-slate-700 rounded-lg hover:border-slate-500"
          >
            Leaderboard
          </button>
        </div>

        {/* Stats */}
        {totalRuns > 0 && (
          <div className="mt-8 flex gap-6 justify-center text-xs text-slate-500 tabular-nums">
            <span>{totalRuns} runs</span>
            <span>best {bestScore.toLocaleString()}</span>
            <span>{minerals} minerals</span>
          </div>
        )}

        {/* Controls hint */}
        <p className="mt-8 text-xs text-slate-600 tracking-wide">
          Click to reveal &middot; Right-click to flag &middot; <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-500 font-mono text-[10px]">F</kbd> toggle flag mode
        </p>
      </div>
    </div>
  );
}
