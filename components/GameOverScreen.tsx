'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore, CONFIG } from '@/lib/store';
import { startNewRun } from '@/lib/run';
import { addToLeaderboard } from '@/lib/leaderboard';
import { onGameEvent } from '@/lib/tile-interaction';
import { sfxVictory, sfxNewRecord } from '@/lib/sfx';

export default function GameOverScreen() {
  const screen = useGameStore((s) => s.flow.screen);
  const score = useGameStore((s) => s.run.score);
  const bestCombo = useGameStore((s) => s.run.combo.best);
  const roomIndex = useGameStore((s) => s.run.roomIndex);
  const totalRooms = useGameStore((s) => s.run.totalRooms);
  const setScreen = useGameStore((s) => s.actions.setScreen);

  const [nickname, setNickname] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rank, setRank] = useState<number | null>(null);

  const [recap, setRecap] = useState<{ safeRemaining: number; total: number } | null>(null);
  const [isRecord, setIsRecord] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const recordCaptured = useRef(false);

  // Capture how close the run ended + whether it beat the personal best (death path).
  useEffect(() => {
    const unsub = onGameEvent('gameOver', ({ safeRemaining, totalSafeCells }) => {
      setRecap({ safeRemaining, total: totalSafeCells });
      const best = useGameStore.getState().meta.stats.bestScore;
      const sc = useGameStore.getState().run.score;
      setIsRecord(sc > best && sc > 0);
      recordCaptured.current = true;
    });
    return unsub;
  }, []);

  const isOver = screen === 'game_over' || screen === 'victory';
  const isVictory = screen === 'victory';

  // Score count-up + stingers on entry.
  useEffect(() => {
    if (!isOver) {
      setDisplayScore(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setDisplayScore(Math.floor(score * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isOver, score]);

  useEffect(() => {
    if (isVictory) sfxVictory();
  }, [isVictory]);

  useEffect(() => {
    if (screen === 'game_over' && isRecord) {
      const t = setTimeout(() => sfxNewRecord(), 550);
      return () => clearTimeout(t);
    }
  }, [screen, isRecord]);

  if (!isOver) return null;

  const minerals = Math.max(
    CONFIG.MIN_MINERALS,
    Math.floor(score * CONFIG.MINERAL_RATE * (isVictory ? CONFIG.VICTORY_BONUS_MULT : 1))
  );

  const handleSubmitScore = async () => {
    if (!nickname.trim() || submitting) return;
    setSubmitting(true);
    const newRank = await addToLeaderboard({
      nickname: nickname.trim(),
      score,
      bestCombo,
      roomReached: roomIndex + 1,
      version: 'v1',
    });
    setRank(newRank);
    setSubmitted(true);
    setSubmitting(false);
  };

  const reset = () => {
    setNickname('');
    setSubmitted(false);
    setRank(null);
    setRecap(null);
    setIsRecord(false);
    recordCaptured.current = false;
  };

  const handlePlayAgain = () => {
    reset();
    startNewRun();
  };

  const handleGoTitle = () => {
    reset();
    setScreen('title');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center text-white max-w-sm w-full px-4">
        {isRecord && !isVictory && (
          <div className="mb-2 mr-banner-in">
            <span className="inline-block text-amber-300 font-black text-lg tracking-widest uppercase mr-record-glow">
              ★ New Record ★
            </span>
          </div>
        )}

        <h1 className={`text-4xl font-black mb-2 mr-banner-in ${isVictory ? 'text-amber-400' : 'text-red-400'}`}>
          {isVictory ? 'VICTORY!' : 'GAME OVER'}
        </h1>

        {/* Loss-aversion recap: how close was it? */}
        {!isVictory && recap && recap.total > 0 && (
          <p className="text-sm text-slate-300 mb-4">
            {recap.safeRemaining <= 3 ? (
              <span className="text-amber-300 font-bold">
                단 {recap.safeRemaining}칸 남기고 쓰러졌다… 아까워!
              </span>
            ) : (
              <>안전칸 <span className="font-bold text-white">{recap.safeRemaining}</span>개 남기고 종료</>
            )}
          </p>
        )}

        <div className="bg-slate-800/80 rounded-xl p-6 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-slate-400">Score</div>
            <div className={`font-bold text-right tabular-nums ${isRecord ? 'text-amber-300 mr-record-glow' : ''}`}>
              {displayScore.toLocaleString()}
            </div>

            <div className="text-slate-400">Best Combo</div>
            <div className="font-bold text-right tabular-nums">{bestCombo} cells</div>

            <div className="text-slate-400">Rooms</div>
            <div className="font-bold text-right">{roomIndex + 1}/{totalRooms}</div>

            <div className="text-slate-400">Minerals</div>
            <div className="font-bold text-right text-cyan-400">+{minerals} 💎</div>
          </div>
        </div>

        {/* Nickname input */}
        {!submitted ? (
          <div className="bg-slate-800/80 rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-400 mb-2">Enter your name for the leaderboard</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 12))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
                placeholder="Nickname"
                maxLength={12}
                className="flex-1 px-3 py-2 bg-slate-700 rounded-lg text-white text-center text-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-500"
                autoFocus
              />
              <button
                onClick={handleSubmitScore}
                disabled={!nickname.trim() || submitting}
                className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? '...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          rank !== null && rank > 0 && (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-3 mb-4 text-amber-300 text-sm font-bold mr-banner-in">
              #{rank} on the leaderboard!
            </div>
          )
        )}

        <button
          onClick={handlePlayAgain}
          className="w-full px-8 py-3 bg-red-500 text-white font-black rounded-lg text-lg
            hover:bg-red-400 transition-all hover:scale-105 active:scale-95 cursor-pointer
            shadow-[0_0_30px_rgba(239,68,68,0.3)]"
        >
          PLAY AGAIN
        </button>

        <div className="flex gap-4 justify-center mt-3">
          <button
            onClick={handleGoTitle}
            className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Title
          </button>
          <button
            onClick={() => { reset(); setScreen('meta_shop'); }}
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
