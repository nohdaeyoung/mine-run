'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { generateRewards, applyReward, type RewardOption } from '@/lib/rewards';
import { advanceToNextRoom } from '@/lib/run';

const RARITY_COLORS: Record<string, string> = {
  common: 'border-slate-400 bg-slate-800',
  rare: 'border-blue-400 bg-blue-900',
  legendary: 'border-amber-400 bg-amber-900',
};

export default function RewardScreen() {
  const screen = useGameStore((s) => s.flow.screen);
  const [rewards, setRewards] = useState<RewardOption[]>([]);

  useEffect(() => {
    if (screen === 'reward') {
      setRewards(generateRewards());
    }
  }, [screen]);

  if (screen !== 'reward') return null;

  const handleSelect = (reward: RewardOption) => {
    applyReward(reward);
    advanceToNextRoom();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-6">Choose Your Reward</h2>
        <div className="flex gap-4">
          {rewards.map((reward, i) => (
            <button
              key={i}
              onClick={() => handleSelect(reward)}
              className={`
                w-44 p-4 rounded-xl border-2 text-white
                transition-all hover:scale-105 hover:shadow-xl cursor-pointer
                ${RARITY_COLORS[reward.rarity ?? 'common']}
              `}
            >
              <div className="text-3xl mb-2">
                {reward.type === 'heal' ? '💚' : reward.rarity === 'legendary' ? '⭐' : reward.rarity === 'rare' ? '💎' : '📦'}
              </div>
              <div className="font-bold text-sm mb-1">{reward.label}</div>
              <div className="text-xs opacity-70">{reward.description}</div>
              {reward.rarity && (
                <div className={`text-xs mt-2 uppercase tracking-wide opacity-50`}>
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
