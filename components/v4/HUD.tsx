'use client';

import { useGameStore } from '@/lib/store';
import GhibliCharacter, { useGhibliMood } from './GhibliCharacter';

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
  const { mood, message } = useGhibliMood();

  if (phase === 'not_started') return null;

  const flagCount = field.cells.flat().filter((c) => c.visibility === 'flagged').length;
  const minesRemaining = field.mines - flagCount;

  return (
    <div className="w-full max-w-lg mx-auto px-2">
      <div className="wc-panel rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 text-[#5b4a3a] text-xs sm:text-sm">
          <div className="shrink-0">
            <GhibliCharacter mood={mood} size={3} message={message} />
          </div>
          <span className="text-[#8b7d6b]/70 bg-[#f0ead6]/60 px-2 py-0.5 rounded-full text-xs">
            {roomIndex + 1}/{totalRooms}
          </span>
          <span className="font-extrabold text-lg sm:text-xl tabular-nums text-[#5b8a4e]">
            {score.toLocaleString()}
          </span>
          <span className="text-[#d4886b] text-xs">
            {field.mines > 0 ? `💣 ${minesRemaining}` : ''}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-[#c4a882]/10 text-xs gap-2">
          <div className="flex gap-0.5 shrink-0">
            {Array.from({ length: health.max }, (_, i) => (
              <span key={i} className={`text-sm sm:text-lg transition-all ${i < health.current ? '' : 'opacity-20 grayscale'}`}>
                {i < health.current ? '🌿' : '🍂'}
              </span>
            ))}
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {items.map((item, i) => {
              const isActive = item.type === 'active' && item.charges > 0;
              const isSelected = activeItemId === item.id;
              return (
                <button
                  key={i}
                  onClick={() => { if (!isActive) return; setActiveItem(isSelected ? null : item.id); }}
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all
                    ${item.rarity === 'legendary' ? 'bg-[#f0ead6]/80 text-[#b8901a] border border-[#f0c040]/30' : item.rarity === 'rare' ? 'bg-[#e8f0f8]/80 text-[#4a7cbc] border border-[#87ceeb]/30' : 'bg-[#f0ead6]/60 text-[#8b7d6b] border border-[#c4a882]/20'}
                    ${isActive ? 'cursor-pointer hover:brightness-105' : 'opacity-50'}
                    ${isSelected ? 'ring-2 ring-[#ffd700]/60 scale-105' : ''}
                  `}
                  title={isActive ? `Use ${item.name}` : item.description}
                >
                  {item.name} {item.type === 'active' ? `x${item.charges}` : ''}
                </button>
              );
            })}
          </div>
          {activeItemId && (
            <div className="text-[10px] text-[#d4886b]/80 font-semibold animate-pulse italic">
              Pick a cell~
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
