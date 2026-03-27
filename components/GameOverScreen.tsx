'use client';

import { useState } from 'react';
import { useGameStore, CONFIG } from '@/lib/store';
import { startNewRun } from '@/lib/run';
import { addToLeaderboard } from '@/lib/leaderboard';

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

  if (screen !== 'game_over' && screen !== 'victory') return null;

  const isVictory = screen === 'victory';
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
    });
    setRank(newRank);
    setSubmitted(true);
    setSubmitting(false);
  };

  const handlePlayAgain = () => {
    setNickname('');
    setSubmitted(false);
    setRank(null);
    startNewRun();
  };

  const handleGoTitle = () => {
    setNickname('');
    setSubmitted(false);
    setRank(null);
    setScreen('title');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center text-white max-w-sm w-full px-4">
        <h1 className={`text-4xl font-black mb-2 ${isVictory ? 'text-amber-400' : 'text-red-400'}`}>
          {isVictory ? 'VICTORY!' : 'GAME OVER'}
        </h1>

        <div className="bg-slate-800/80 rounded-xl p-6 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-slate-400">Score</div>
            <div className="font-bold text-right tabular-nums">{score.toLocaleString()}</div>

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
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-3 mb-4 text-amber-300 text-sm font-bold">
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
            onClick={() => { setNickname(''); setSubmitted(false); setRank(null); setScreen('title'); }}
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
