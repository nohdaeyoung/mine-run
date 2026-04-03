'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { generateRewards, applyReward, type RewardOption } from '@/lib/rewards';
import { advanceToNextRoom } from '@/lib/run';
import GhibliCharacter from './GhibliCharacter';

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#3a3228]/40">
      <div className="text-center">
        <GhibliCharacter mood="happy" size={5} message="Choose wisely~" className="mb-4" />
        <h2 className="text-xl font-extrabold text-[#5b8a4e] mb-6 italic">A Gift from the Forest</h2>
        <div className="flex gap-3">
          {rewards.map((reward, i) => (
            <button
              key={i}
              onClick={() => handleSelect(reward)}
              className="w-40 p-4 wc-panel rounded-xl text-[#5b4a3a]
                hover:scale-105 hover:shadow-lg cursor-pointer transition-all"
            >
              <div className="text-2xl mb-2">
                {reward.type === 'heal' ? '🌿' : reward.rarity === 'legendary' ? '✨' : reward.rarity === 'rare' ? '🍄' : '🌰'}
              </div>
              <div className="font-bold text-xs mb-1">{reward.label}</div>
              <div className="text-[10px] text-[#8b7d6b]/70">{reward.description}</div>
              {reward.rarity && (
                <div className={`text-[10px] mt-2 uppercase tracking-wider italic
                  ${reward.rarity === 'legendary' ? 'text-[#b8901a]' : reward.rarity === 'rare' ? 'text-[#4a7cbc]' : 'text-[#8b7d6b]/60'}`}>
                  {reward.rarity}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
