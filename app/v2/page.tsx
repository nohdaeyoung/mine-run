'use client';

import Link from 'next/link';
import { useGameStore } from '@/lib/store';
import TitleScreen from '@/components/v2/TitleScreen';
import Board from '@/components/v2/Board';
import HUD from '@/components/v2/HUD';
import ComboPopup from '@/components/v2/ComboPopup';
import RewardScreen from '@/components/v2/RewardScreen';
import GameOverScreen from '@/components/v2/GameOverScreen';
import Leaderboard from '@/components/v2/Leaderboard';
import NoContextMenu from '@/components/NoContextMenu';

export default function HomeV2() {
  const screen = useGameStore((s) => s.flow.screen);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-orange-50 to-yellow-50">
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
