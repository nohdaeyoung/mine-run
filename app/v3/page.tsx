'use client';

import Link from 'next/link';
import { useGameStore } from '@/lib/store';
import TitleScreen from '@/components/v3/TitleScreen';
import Board from '@/components/v3/Board';
import HUD from '@/components/v3/HUD';
import ComboPopup from '@/components/v3/ComboPopup';
import RewardScreen from '@/components/v3/RewardScreen';
import GameOverScreen from '@/components/v3/GameOverScreen';
import Leaderboard from '@/components/v3/Leaderboard';
import NoContextMenu from '@/components/NoContextMenu';

export default function HomeV3() {
  const screen = useGameStore((s) => s.flow.screen);

  return (
    <div className="min-h-screen bg-[#1a1025]" style={{ imageRendering: 'pixelated' }}>
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
