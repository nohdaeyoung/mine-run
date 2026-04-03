'use client';

import { useGameStore } from '@/lib/store';
import TitleScreen from '@/components/v4/TitleScreen';
import Board from '@/components/v4/Board';
import HUD from '@/components/v4/HUD';
import ComboPopup from '@/components/v4/ComboPopup';
import RewardScreen from '@/components/v4/RewardScreen';
import GameOverScreen from '@/components/v4/GameOverScreen';
import Leaderboard from '@/components/v4/Leaderboard';
import NoContextMenu from '@/components/NoContextMenu';
import BGMToggle from '@/components/v4/BGMToggle';

export default function HomeV4() {
  const screen = useGameStore((s) => s.flow.screen);

  return (
    <div className="min-h-screen wc-paper relative overflow-hidden">
      {/* Watercolor wash background splashes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="wc-splash absolute top-[-10%] left-[-5%] w-[50vw] h-[40vh] bg-[#a8d5a0]" style={{ animation: 'wc-breathe 12s ease-in-out infinite' }} />
        <div className="wc-splash absolute top-[20%] right-[-10%] w-[40vw] h-[35vh] bg-[#87ceeb]" style={{ animation: 'wc-breathe 15s ease-in-out infinite', animationDelay: '3s' }} />
        <div className="wc-splash absolute bottom-[-5%] left-[20%] w-[45vw] h-[30vh] bg-[#d4886b]" style={{ animation: 'wc-breathe 18s ease-in-out infinite', animationDelay: '6s' }} />
        <div className="wc-splash absolute bottom-[30%] right-[10%] w-[30vw] h-[25vh] bg-[#c4a882]" style={{ animation: 'wc-breathe 14s ease-in-out infinite', animationDelay: '9s' }} />
      </div>

      <div className="relative z-10">
        <NoContextMenu />
        <BGMToggle />
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
    </div>
  );
}
