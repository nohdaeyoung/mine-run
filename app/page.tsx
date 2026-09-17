'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import TitleScreen from '@/components/TitleScreen';
import Board from '@/components/Board';
import HUD from '@/components/HUD';
import ComboPopup from '@/components/ComboPopup';
import GameEffects from '@/components/GameEffects';
import RewardScreen from '@/components/RewardScreen';
import GameOverScreen from '@/components/GameOverScreen';
import Leaderboard from '@/components/Leaderboard';
import NoContextMenu from '@/components/NoContextMenu';
import { unlockAudio, toggleMute, isMuted } from '@/lib/sfx';

export default function Home() {
  const screen = useGameStore((s) => s.flow.screen);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    setMuted(isMuted());
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <NoContextMenu />
      <TitleScreen />

      {screen === 'run' && (
        <div className="flex flex-col items-center gap-4 pt-4 pb-8">
          <HUD />
          <Board />
        </div>
      )}

      <Leaderboard />
      <ComboPopup />
      <GameEffects />
      <RewardScreen />
      <GameOverScreen />

      {screen !== 'title' && (
        <button
          onClick={() => setMuted(toggleMute())}
          className="fixed top-3 right-3 z-[55] w-9 h-9 rounded-full bg-slate-800/80 text-slate-200 text-sm flex items-center justify-center hover:bg-slate-700 transition-all cursor-pointer backdrop-blur-sm"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      )}
    </div>
  );
}
