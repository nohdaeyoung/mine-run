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
      version: 'v2',
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-pink-900/30 backdrop-blur-sm">
      <div className="text-center max-w-sm w-full px-4">
        <div className="text-4xl mb-2">{isVictory ? '🎉' : '💫'}</div>
        <h1 className={`text-4xl font-black mb-2 ${isVictory ? 'text-amber-500' : 'text-rose-400'}`}>
          {isVictory ? 'Victory!' : 'Oh no!'}
        </h1>
        <p className="text-sm text-pink-400 mb-4">
          {isVictory ? 'You cleared all rooms!' : 'Better luck next time~'}
        </p>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-4 border-2 border-pink-200/60">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-pink-400">Score</div>
            <div className="font-bold text-right tabular-nums text-pink-700">{score.toLocaleString()}</div>

            <div className="text-pink-400">Best Combo</div>
            <div className="font-bold text-right tabular-nums text-pink-700">{bestCombo} cells</div>

            <div className="text-pink-400">Rooms</div>
            <div className="font-bold text-right text-pink-700">{roomIndex + 1}/{totalRooms}</div>

            <div className="text-pink-400">Gems</div>
            <div className="font-bold text-right text-amber-500">+{minerals} 💎</div>
          </div>
        </div>

        {/* Nickname input */}
        {!submitted ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-4 border-2 border-pink-200/60">
            <p className="text-sm text-pink-400 mb-2">Save your score!</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 12))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
                placeholder="Your name"
                maxLength={12}
                className="flex-1 px-3 py-2 bg-pink-50 rounded-xl text-pink-700 text-center text-sm outline-none focus:ring-2 focus:ring-pink-300 placeholder-pink-300 border border-pink-200"
                autoFocus
              />
              <button
                onClick={handleSubmitScore}
                disabled={!nickname.trim() || submitting}
                className="px-4 py-2 bg-gradient-to-r from-pink-400 to-orange-300 text-white font-bold rounded-xl text-sm hover:from-pink-300 hover:to-orange-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? '...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          rank !== null && rank > 0 && (
            <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-3 mb-4 text-amber-600 text-sm font-bold">
              #{rank} on the leaderboard!
            </div>
          )
        )}

        <button
          onClick={handlePlayAgain}
          className="w-full px-8 py-3 bg-gradient-to-r from-pink-400 to-orange-300 text-white font-black rounded-full text-lg
            hover:from-pink-300 hover:to-orange-200 transition-all hover:scale-105 active:scale-95 cursor-pointer
            shadow-lg shadow-pink-300/40"
        >
          Play Again!
        </button>

        <div className="flex gap-4 justify-center mt-3">
          <button
            onClick={handleGoTitle}
            className="text-sm text-pink-400 hover:text-pink-600 transition-colors cursor-pointer"
          >
            Title
          </button>
          <button
            onClick={() => { setNickname(''); setSubmitted(false); setRank(null); setScreen('title'); }}
            className="text-sm text-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
