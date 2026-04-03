'use client';

import Link from 'next/link';
import { useGameStore } from '@/lib/store';
import { startNewRun } from '@/lib/run';
import PixelCharacter from './PixelCharacter';

export default function TitleScreen() {
  const screen = useGameStore((s) => s.flow.screen);
  const bestScore = useGameStore((s) => s.meta.stats.bestScore);
  const totalRuns = useGameStore((s) => s.meta.stats.totalRuns);
  const minerals = useGameStore((s) => s.meta.minerals);
  const setScreen = useGameStore((s) => s.actions.setScreen);

  if (screen !== 'title') return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1025] text-[#f0e6ff] relative overflow-hidden">
      {/* Pixel star decorations */}
      <div className="absolute top-16 left-12 w-2 h-2 bg-[#ffe066] animate-pulse" />
      <div className="absolute top-32 right-20 w-1 h-1 bg-[#f0c040]" />
      <div className="absolute bottom-40 left-24 w-1.5 h-1.5 bg-[#ffe066] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-[#5ba3d9]" />
      <div className="absolute bottom-32 right-16 w-2 h-2 bg-[#f0c040] animate-pulse" style={{ animationDelay: '0.5s' }} />

      <div className="text-center relative z-10">
        {/* Character */}
        <div className="mb-4">
          <PixelCharacter mood="idle" size={6} />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-wider mb-1">
          <span className="text-[#ff6b6b]">MINE</span>
          <span className="text-[#f0c040]"> RUN</span>
        </h1>
        <p className="text-[#7a6a9a] text-xs tracking-widest uppercase mb-8">
          Pixel Roguelike Minesweeper
        </p>

        {/* Play button */}
        <button
          onClick={() => startNewRun()}
          className="px-12 py-3 bg-[#f0c040] text-[#1a1025] font-bold text-lg tracking-wide
            border-2 border-t-[#ffe066] border-l-[#ffe066] border-b-[#b8901a] border-r-[#b8901a]
            hover:bg-[#ffe066] active:border-t-[#b8901a] active:border-l-[#b8901a]
            active:border-b-[#ffe066] active:border-r-[#ffe066]
            cursor-pointer transition-none"
        >
          PLAY
        </button>

        {/* Version switcher */}
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/" className="px-3 py-1 text-[10px] text-[#7a6a9a] hover:text-[#f0e6ff] bg-[#2a1f3d] hover:bg-[#3d2e56] transition-colors">v1</Link>
          <Link href="/v2" className="px-3 py-1 text-[10px] text-[#7a6a9a] hover:text-[#f0e6ff] bg-[#2a1f3d] hover:bg-[#3d2e56] transition-colors">v2</Link>
          <span className="px-3 py-1 text-[10px] font-bold text-[#f0c040] bg-[#3d2e56]">v3</span>
          <Link href="/v4" className="px-3 py-1 text-[10px] text-[#7a6a9a] hover:text-[#f0e6ff] bg-[#2a1f3d] hover:bg-[#3d2e56] transition-colors">v4</Link>
        </div>

        {/* Leaderboard */}
        <div className="mt-4">
          <button
            onClick={() => setScreen('meta_shop')}
            className="px-6 py-2 text-[#b8a9d4] text-sm hover:text-[#f0e6ff] transition-colors cursor-pointer
              border-2 border-[#4a3a6b] hover:border-[#f0c040]"
          >
            LEADERBOARD
          </button>
        </div>

        {/* Stats */}
        {totalRuns > 0 && (
          <div className="mt-6 flex gap-4 justify-center text-[10px] text-[#7a6a9a] tabular-nums">
            <span>{totalRuns} runs</span>
            <span>best {bestScore.toLocaleString()}</span>
            <span>{minerals} gems</span>
          </div>
        )}

        {/* Controls */}
        <p className="mt-6 text-[10px] text-[#4a3a6b] tracking-wide">
          CLICK reveal &middot; RIGHT-CLICK flag &middot; F toggle
        </p>
      </div>
    </div>
  );
}
