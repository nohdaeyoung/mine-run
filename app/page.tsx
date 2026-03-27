'use client';

import { useGameStore } from '@/lib/store';
import TitleScreen from '@/components/TitleScreen';
import Board from '@/components/Board';
import HUD from '@/components/HUD';
import ComboPopup from '@/components/ComboPopup';
import RewardScreen from '@/components/RewardScreen';
import GameOverScreen from '@/components/GameOverScreen';
import Leaderboard from '@/components/Leaderboard';
import NoContextMenu from '@/components/NoContextMenu';

export default function Home() {
  const screen = useGameStore((s) => s.flow.screen);

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
      <RewardScreen />
      <GameOverScreen />
    </div>
  );
}
