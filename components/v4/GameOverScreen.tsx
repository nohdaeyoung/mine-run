'use client';

import { useState } from 'react';
import { useGameStore, CONFIG } from '@/lib/store';
import { startNewRun } from '@/lib/run';
import { addToLeaderboard } from '@/lib/leaderboard';
import GhibliCharacter from './GhibliCharacter';

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
      nickname: nickname.trim(), score, bestCombo, roomReached: roomIndex + 1, version: 'v4',
    });
    setRank(newRank);
    setSubmitted(true);
    setSubmitting(false);
  };

  const handlePlayAgain = () => { setNickname(''); setSubmitted(false); setRank(null); startNewRun(); };
  const handleGoTitle = () => { setNickname(''); setSubmitted(false); setRank(null); setScreen('title'); };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#3a3228]/40">
      <div className="text-center max-w-sm w-full px-4 text-[#5b4a3a]">
        <GhibliCharacter
          mood={isVictory ? 'celebrating' : 'sad'}
          size={6}
          message={isVictory ? 'We made it!' : 'It\'s okay...'}
          className="mb-4"
        />

        <h1 className={`text-3xl font-extrabold mb-2 ${isVictory ? 'text-[#5b8a4e]' : 'text-[#d4886b]'}`}>
          {isVictory ? 'Journey Complete!' : 'Rest now...'}
        </h1>

        <div className="wc-panel rounded-xl p-5 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-[#8b7d6b]/70">Score</div>
            <div className="font-bold text-right tabular-nums">{score.toLocaleString()}</div>
            <div className="text-[#8b7d6b]/70">Best Combo</div>
            <div className="font-bold text-right tabular-nums">{bestCombo}</div>
            <div className="text-[#8b7d6b]/70">Rooms</div>
            <div className="font-bold text-right">{roomIndex + 1}/{totalRooms}</div>
            <div className="text-[#8b7d6b]/70">Gems</div>
            <div className="font-bold text-right text-[#5b8a4e]">+{minerals}</div>
          </div>
        </div>

        {!submitted ? (
          <div className="wc-panel rounded-xl p-4 mb-4">
            <p className="text-xs text-[#8b7d6b]/60 mb-2 italic">Leave your name~</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 12))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
                placeholder="Your name"
                maxLength={12}
                className="flex-1 px-3 py-2 bg-[#faf6f0] rounded-lg text-[#5b4a3a] text-center text-sm outline-none
                  focus:ring-2 focus:ring-[#7cb668]/40 placeholder-[#c4a882]/60 border border-[#c4a882]/20"
                autoFocus
              />
              <button
                onClick={handleSubmitScore}
                disabled={!nickname.trim() || submitting}
                className="wc-btn px-4 py-2 text-white font-bold rounded-lg text-sm disabled:opacity-30 cursor-pointer"
              >
                {submitting ? '...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          rank !== null && rank > 0 && (
            <div className="wc-panel rounded-xl p-3 mb-4 text-[#5b8a4e] text-sm font-bold border-[#7cb668]/30">
              #{rank} on the leaderboard!
            </div>
          )
        )}

        <button
          onClick={handlePlayAgain}
          className="wc-btn w-full px-8 py-3 text-white font-bold rounded-full text-lg cursor-pointer"
        >
          {isVictory ? 'New Journey' : 'Try Again'}
        </button>

        <div className="flex gap-4 justify-center mt-3">
          <button onClick={handleGoTitle} className="text-sm text-[#8b7d6b]/60 hover:text-[#5b4a3a] cursor-pointer transition-colors">Title</button>
          <button onClick={() => { setNickname(''); setSubmitted(false); setRank(null); setScreen('title'); }} className="text-sm text-[#5b8a4e]/70 hover:text-[#5b8a4e] cursor-pointer transition-colors">Leaderboard</button>
        </div>
      </div>
    </div>
  );
}
