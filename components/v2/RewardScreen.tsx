'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { generateRewards, applyReward, type RewardOption } from '@/lib/rewards';
import { advanceToNextRoom } from '@/lib/run';

const RARITY_STYLES: Record<string, string> = {
  common: 'border-pink-300 bg-white/90',
  rare: 'border-blue-300 bg-blue-50/90',
  legendary: 'border-amber-300 bg-amber-50/90',
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-pink-900/30 backdrop-blur-sm">
      <div className="text-center">
        <h2 className="text-2xl font-black text-pink-600 mb-1">Pick a Reward!</h2>
        <p className="text-sm text-pink-400 mb-6">Choose wisely~</p>
        <div className="flex gap-4">
          {rewards.map((reward, i) => (
            <button
              key={i}
              onClick={() => handleSelect(reward)}
              className={`
                w-44 p-4 rounded-2xl border-2 text-pink-800
                transition-all hover:scale-105 hover:shadow-xl cursor-pointer
                shadow-md
                ${RARITY_STYLES[reward.rarity ?? 'common']}
              `}
            >
              <div className="text-3xl mb-2">
                {reward.type === 'heal' ? '💖' : reward.rarity === 'legendary' ? '🌟' : reward.rarity === 'rare' ? '💎' : '🎁'}
              </div>
              <div className="font-bold text-sm mb-1">{reward.label}</div>
              <div className="text-xs opacity-70">{reward.description}</div>
              {reward.rarity && (
                <div className={`text-[10px] mt-2 uppercase tracking-wide px-2 py-0.5 rounded-full inline-block
                  ${reward.rarity === 'legendary' ? 'bg-amber-200 text-amber-700' : reward.rarity === 'rare' ? 'bg-blue-200 text-blue-600' : 'bg-pink-100 text-pink-500'}
                `}>
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
