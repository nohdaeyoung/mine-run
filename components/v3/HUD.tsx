'use client';

import { useGameStore } from '@/lib/store';
import PixelCharacter, { useCharacterMood } from './PixelCharacter';

export default function HUD() {
  const score = useGameStore((s) => s.run.score);
  const health = useGameStore((s) => s.run.health);
  const items = useGameStore((s) => s.run.items);
  const roomIndex = useGameStore((s) => s.run.roomIndex);
  const totalRooms = useGameStore((s) => s.run.totalRooms);
  const field = useGameStore((s) => s.run.field);
  const phase = useGameStore((s) => s.run.phase);
  const activeItemId = useGameStore((s) => s.flow.activeItemId);
  const setActiveItem = useGameStore((s) => s.actions.setActiveItem);
  const { mood, message } = useCharacterMood();

  if (phase === 'not_started') return null;

  const flagCount = field.cells.flat().filter((c) => c.visibility === 'flagged').length;
  const minesRemaining = field.mines - flagCount;

  return (
    <div className="w-full max-w-lg mx-auto px-2">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2a1f3d] text-[#f0e6ff] border-2 border-b-0 border-[#4a3a6b] text-xs sm:text-sm">
        {/* Character */}
        <div className="shrink-0">
          <PixelCharacter mood={mood} size={3} message={message} />
        </div>

        <span className="text-[#7a6a9a]">
          RM {roomIndex + 1}/{totalRooms}
        </span>
        <span className="font-bold text-lg sm:text-xl tabular-nums text-[#f0c040]">
          {score.toLocaleString()}
        </span>
        <span className="text-[#ff6b6b]">
          {field.mines > 0 ? `${minesRemaining}` : ''}
        </span>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1a1025] text-[#f0e6ff] border-2 border-t-0 border-[#4a3a6b] text-xs sm:text-sm gap-2">
        {/* Health - pixel hearts */}
        <div className="flex gap-0.5 shrink-0">
          {Array.from({ length: health.max }, (_, i) => (
            <span
              key={i}
              className="inline-block w-4 h-4 sm:w-5 sm:h-5"
              style={{
                backgroundColor: i < health.current ? '#ff6b6b' : '#3d2e56',
                clipPath: 'polygon(50% 85%, 100% 35%, 82% 10%, 50% 25%, 18% 10%, 0% 35%)',
              }}
            />
          ))}
        </div>

        {/* Items */}
        <div className="flex gap-1 overflow-x-auto">
          {items.map((item, i) => {
            const isActive = item.type === 'active' && item.charges > 0;
            const isSelected = activeItemId === item.id;
            return (
              <button
                key={i}
                onClick={() => {
                  if (!isActive) return;
                  setActiveItem(isSelected ? null : item.id);
                }}
                className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold whitespace-nowrap transition-none border-2
                  ${item.rarity === 'legendary' ? 'border-[#f0c040] text-[#f0c040]' : item.rarity === 'rare' ? 'border-[#5ba3d9] text-[#5ba3d9]' : 'border-[#b8a9d4] text-[#b8a9d4]'}
                  ${isActive ? 'cursor-pointer hover:bg-[#3d2e56]' : 'opacity-50'}
                  ${isSelected ? 'bg-[#3d2e56]' : 'bg-[#1a1025]'}
                `}
                title={isActive ? `Use ${item.name}` : item.description}
              >
                {item.name} {item.type === 'active' ? `x${item.charges}` : ''}
              </button>
            );
          })}
        </div>
        {activeItemId && (
          <div className="text-[10px] text-[#f0c040] font-bold animate-pulse">
            SELECT TARGET
          </div>
        )}
      </div>
    </div>
  );
}
