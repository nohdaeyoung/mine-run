'use client';

import { useState } from 'react';
import { useGameStore, CONFIG } from '@/lib/store';
import { startNewRun } from '@/lib/run';
import { addToLeaderboard } from '@/lib/leaderboard';
import PixelCharacter from './PixelCharacter';

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
      nickname: nickname.trim(), score, bestCombo, roomReached: roomIndex + 1, version: 'v3',
    });
    setRank(newRank);
    setSubmitted(true);
    setSubmitting(false);
  };

  const handlePlayAgain = () => {
    setNickname(''); setSubmitted(false); setRank(null);
    startNewRun();
  };

  const handleGoTitle = () => {
    setNickname(''); setSubmitted(false); setRank(null);
    setScreen('title');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#1a1025]/80 backdrop-blur-sm">
      <div className="text-center max-w-sm w-full px-4 text-[#f0e6ff]">
        <PixelCharacter
          mood={isVictory ? 'celebrating' : 'sad'}
          size={6}
          message={isVictory ? 'We did it!' : 'Oh no...'}
          className="mb-4"
        />

        <h1 className={`text-3xl font-bold mb-4 ${isVictory ? 'text-[#f0c040]' : 'text-[#ff6b6b]'}`}>
          {isVictory ? 'VICTORY!' : 'GAME OVER'}
        </h1>

        <div className="bg-[#2a1f3d] border-2 border-[#4a3a6b] p-4 mb-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-[#7a6a9a]">Score</div>
            <div className="font-bold text-right tabular-nums">{score.toLocaleString()}</div>
            <div className="text-[#7a6a9a]">Best Combo</div>
            <div className="font-bold text-right tabular-nums">{bestCombo}</div>
            <div className="text-[#7a6a9a]">Rooms</div>
            <div className="font-bold text-right">{roomIndex + 1}/{totalRooms}</div>
            <div className="text-[#7a6a9a]">Gems</div>
            <div className="font-bold text-right text-[#f0c040]">+{minerals}</div>
          </div>
        </div>

        {!submitted ? (
          <div className="bg-[#2a1f3d] border-2 border-[#4a3a6b] p-3 mb-4">
            <p className="text-[10px] text-[#7a6a9a] mb-2">ENTER NAME</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 12))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
                placeholder="..."
                maxLength={12}
                className="flex-1 px-3 py-2 bg-[#1a1025] border-2 border-[#4a3a6b] text-[#f0e6ff] text-center text-xs outline-none focus:border-[#f0c040] placeholder-[#4a3a6b]"
                autoFocus
              />
              <button
                onClick={handleSubmitScore}
                disabled={!nickname.trim() || submitting}
                className="px-4 py-2 bg-[#f0c040] text-[#1a1025] font-bold text-xs border-2 border-t-[#ffe066] border-l-[#ffe066] border-b-[#b8901a] border-r-[#b8901a] disabled:opacity-30 cursor-pointer transition-none"
              >
                {submitting ? '...' : 'SAVE'}
              </button>
            </div>
          </div>
        ) : (
          rank !== null && rank > 0 && (
            <div className="bg-[#2a1f3d] border-2 border-[#f0c040] p-3 mb-4 text-[#f0c040] text-xs font-bold">
              #{rank} ON LEADERBOARD!
            </div>
          )
        )}

        <button
          onClick={handlePlayAgain}
          className="w-full px-8 py-3 bg-[#f0c040] text-[#1a1025] font-bold text-sm
            border-2 border-t-[#ffe066] border-l-[#ffe066] border-b-[#b8901a] border-r-[#b8901a]
            hover:bg-[#ffe066] cursor-pointer transition-none"
        >
          RETRY
        </button>

        <div className="flex gap-4 justify-center mt-3">
          <button onClick={handleGoTitle} className="text-xs text-[#7a6a9a] hover:text-[#f0e6ff] cursor-pointer transition-colors">
            TITLE
          </button>
          <button onClick={() => { setNickname(''); setSubmitted(false); setRank(null); setScreen('title'); }} className="text-xs text-[#f0c040] hover:text-[#ffe066] cursor-pointer transition-colors">
            RANKING
          </button>
        </div>
      </div>
    </div>
  );
}
