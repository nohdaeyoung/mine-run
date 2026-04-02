'use client';

import Link from 'next/link';
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 via-orange-50 to-yellow-50 text-pink-900 relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute top-20 left-10 text-4xl animate-bounce opacity-60" style={{ animationDelay: '0s' }}>🌸</div>
      <div className="absolute top-32 right-16 text-3xl animate-bounce opacity-50" style={{ animationDelay: '0.5s' }}>🍡</div>
      <div className="absolute bottom-40 left-20 text-3xl animate-bounce opacity-40" style={{ animationDelay: '1s' }}>🌷</div>
      <div className="absolute bottom-28 right-12 text-4xl animate-bounce opacity-50" style={{ animationDelay: '1.5s' }}>🎀</div>
      <div className="absolute top-1/4 right-1/4 text-2xl animate-bounce opacity-30" style={{ animationDelay: '0.7s' }}>✨</div>

      {/* Soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-300/20 rounded-full blur-[100px]" />

      <div className="text-center relative z-10">
        {/* Title */}
        <div className="text-5xl mb-2">💣</div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-1">
          <span className="text-pink-400 drop-shadow-[0_2px_10px_rgba(244,114,182,0.4)]">MINE</span>
          <span className="text-orange-400"> RUN</span>
        </h1>
        <p className="text-pink-300 text-sm tracking-widest mb-10">
          ~ tap tap, find the safe path ~
        </p>

        {/* Play button */}
        <button
          onClick={() => startNewRun()}
          className="group relative px-16 py-4 bg-gradient-to-r from-pink-400 to-orange-300 text-white font-black rounded-full text-xl
            hover:from-pink-300 hover:to-orange-200 transition-all hover:scale-105 active:scale-95
            cursor-pointer shadow-lg shadow-pink-300/40
            hover:shadow-xl hover:shadow-pink-300/50"
        >
          PLAY!
        </button>

        {/* Version switcher */}
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/" className="px-3 py-1 text-xs font-medium text-pink-300 hover:text-pink-500 bg-white/40 hover:bg-white/60 rounded-full transition-all">v1</Link>
          <span className="px-3 py-1 text-xs font-bold text-pink-600 bg-white/60 rounded-full">v2</span>
          <Link href="/v3" className="px-3 py-1 text-xs font-medium text-pink-300 hover:text-pink-500 bg-white/40 hover:bg-white/60 rounded-full transition-all">v3</Link>
        </div>

        {/* Leaderboard */}
        <div className="mt-4">
          <button
            onClick={() => setScreen('meta_shop')}
            className="px-6 py-2 text-pink-400 font-medium hover:text-pink-600 transition-all cursor-pointer
              border-2 border-pink-200 rounded-full hover:border-pink-300 hover:bg-pink-50"
          >
            Leaderboard
          </button>
        </div>

        {/* Stats */}
        {totalRuns > 0 && (
          <div className="mt-8 flex gap-4 justify-center text-xs text-pink-300 tabular-nums">
            <span className="bg-white/60 px-3 py-1 rounded-full">{totalRuns} runs</span>
            <span className="bg-white/60 px-3 py-1 rounded-full">best {bestScore.toLocaleString()}</span>
            <span className="bg-white/60 px-3 py-1 rounded-full">{minerals} gems</span>
          </div>
        )}

        {/* Controls hint */}
        <p className="mt-8 text-xs text-pink-300/80 tracking-wide">
          Tap to reveal · Right-click to flag · <kbd className="px-1.5 py-0.5 bg-white/50 rounded-full text-pink-400 font-mono text-[10px]">F</kbd> toggle flag mode
        </p>
      </div>
    </div>
  );
}
