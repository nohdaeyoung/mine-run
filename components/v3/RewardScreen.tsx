'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { generateRewards, applyReward, type RewardOption } from '@/lib/rewards';
import { advanceToNextRoom } from '@/lib/run';
import PixelCharacter from './PixelCharacter';

const RARITY_BORDERS: Record<string, string> = {
  common: 'border-[#b8a9d4]',
  rare: 'border-[#5ba3d9]',
  legendary: 'border-[#f0c040]',
};

export default function RewardScreen() {
  const screen = useGameStore((s) => s.flow.screen);
  const [rewards, setRewards] = useState<RewardOption[]>([]);

  useEffect(() => {
    if (screen === 'reward') setRewards(generateRewards());
  }, [screen]);

  if (screen !== 'reward') return null;

  const handleSelect = (reward: RewardOption) => {
    applyReward(reward);
    advanceToNextRoom();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#1a1025]/80 backdrop-blur-sm">
      <div className="text-center">
        <PixelCharacter mood="happy" size={5} message="Pick one!" className="mb-4" />
        <h2 className="text-xl font-bold text-[#f0c040] mb-6">CHOOSE REWARD</h2>
        <div className="flex gap-3">
          {rewards.map((reward, i) => (
            <button
              key={i}
              onClick={() => handleSelect(reward)}
              className={`w-40 p-4 bg-[#2a1f3d] text-[#f0e6ff] border-2
                hover:bg-[#3d2e56] cursor-pointer transition-none
                ${RARITY_BORDERS[reward.rarity ?? 'common']}
              `}
            >
              <div className="text-2xl mb-2">
                {reward.type === 'heal' ? '💖' : reward.rarity === 'legendary' ? '⭐' : reward.rarity === 'rare' ? '💎' : '📦'}
              </div>
              <div className="font-bold text-xs mb-1">{reward.label}</div>
              <div className="text-[10px] text-[#7a6a9a] font-kr">{reward.description}</div>
              {reward.rarity && (
                <div className={`text-[10px] mt-2 uppercase tracking-wider
                  ${reward.rarity === 'legendary' ? 'text-[#f0c040]' : reward.rarity === 'rare' ? 'text-[#5ba3d9]' : 'text-[#b8a9d4]'}
                `}>
                  [{reward.rarity}]
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
