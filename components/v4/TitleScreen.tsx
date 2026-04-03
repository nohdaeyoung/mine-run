'use client';

import Link from 'next/link';
import { useGameStore } from '@/lib/store';
import { startNewRun } from '@/lib/run';
import GhibliCharacter from './GhibliCharacter';

export default function TitleScreen() {
  const screen = useGameStore((s) => s.flow.screen);
  const bestScore = useGameStore((s) => s.meta.stats.bestScore);
  const totalRuns = useGameStore((s) => s.meta.stats.totalRuns);
  const minerals = useGameStore((s) => s.meta.minerals);
  const setScreen = useGameStore((s) => s.actions.setScreen);

  if (screen !== 'title') return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-[#3a3228] relative overflow-hidden">
      {/* Floating leaves - watercolor style */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${12 + i * 20}%`,
            animation: `leaf-fall ${10 + i * 3}s linear infinite`,
            animationDelay: `${i * 2}s`,
            fontSize: 16 + i * 2,
            opacity: 0.4,
          }}
        >
          🍃
        </div>
      ))}

      {/* Watercolor clouds */}
      <div className="absolute top-16 w-32 h-10 bg-white/15 rounded-[50%] blur-md" style={{ animation: 'cloud-drift 30s linear infinite' }} />
      <div className="absolute top-28 w-20 h-7 bg-white/10 rounded-[50%] blur-md" style={{ animation: 'cloud-drift 40s linear infinite', animationDelay: '12s' }} />

      <div className="text-center relative z-10">
        {/* Character */}
        <div className="mb-6">
          <GhibliCharacter mood="idle" size={6} />
        </div>

        {/* Title with watercolor feel */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-1">
          <span className="text-[#5b8a4e] drop-shadow-[0_1px_8px_rgba(91,138,78,0.2)]">Mine</span>
          <span className="text-[#c4a882] drop-shadow-[0_1px_8px_rgba(196,168,130,0.2)]"> Run</span>
        </h1>
        <p className="text-[#8b7d6b]/70 text-sm tracking-wide mb-8 italic">
          ~ a gentle journey through the fields ~
        </p>

        {/* Watercolor button */}
        <button
          onClick={() => startNewRun()}
          className="wc-btn px-14 py-3.5 text-white font-bold text-lg rounded-full cursor-pointer"
        >
          Start Journey
        </button>

        {/* Version switcher */}
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/" className="px-3 py-1 text-xs text-[#8b7d6b]/50 hover:text-[#5b4a3a] hover:bg-white/40 rounded-full transition-all">v1</Link>
          <Link href="/v2" className="px-3 py-1 text-xs text-[#8b7d6b]/50 hover:text-[#5b4a3a] hover:bg-white/40 rounded-full transition-all">v2</Link>
          <Link href="/v3" className="px-3 py-1 text-xs text-[#8b7d6b]/50 hover:text-[#5b4a3a] hover:bg-white/40 rounded-full transition-all">v3</Link>
          <span className="px-3 py-1 text-xs font-bold text-[#5b8a4e] bg-white/50 rounded-full">v4</span>
        </div>

        {/* Leaderboard */}
        <div className="mt-4">
          <button
            onClick={() => setScreen('meta_shop')}
            className="px-6 py-2 text-[#8b7d6b]/70 text-sm hover:text-[#5b4a3a] transition-colors cursor-pointer
              border border-[#c4a882]/25 rounded-full hover:border-[#c4a882]/50 hover:bg-white/30"
          >
            Leaderboard
          </button>
        </div>

        {/* Stats */}
        {totalRuns > 0 && (
          <div className="mt-6 flex gap-3 justify-center text-xs text-[#8b7d6b]/60 tabular-nums">
            <span className="bg-white/30 px-3 py-1 rounded-full">{totalRuns} journeys</span>
            <span className="bg-white/30 px-3 py-1 rounded-full">best {bestScore.toLocaleString()}</span>
            <span className="bg-white/30 px-3 py-1 rounded-full">{minerals} gems</span>
          </div>
        )}

        {/* Controls */}
        <p className="mt-6 text-[10px] text-[#8b7d6b]/40 tracking-wide italic">
          Click to reveal · Right-click to flag · F toggle
        </p>
      </div>
    </div>
  );
}
