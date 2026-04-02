'use client';

import { useGameStore } from '@/lib/store';

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

  if (phase === 'not_started') return null;

  const flagCount = field.cells.flat().filter((c) => c.visibility === 'flagged').length;
  const minesRemaining = field.mines - flagCount;

  return (
    <div className="w-full max-w-lg mx-auto px-2">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/80 backdrop-blur-sm text-pink-800 rounded-t-2xl text-xs sm:text-sm border-2 border-b-0 border-pink-200/60">
        <span className="font-mono bg-pink-100 px-2 py-0.5 rounded-full text-pink-500">
          Room {roomIndex + 1}/{totalRooms}
        </span>
        <span className="font-black text-lg sm:text-xl tabular-nums text-orange-500">
          {score.toLocaleString()}
        </span>
        <span className="font-mono bg-rose-100 px-2 py-0.5 rounded-full text-rose-500">
          {field.mines > 0 ? `💣 ${minesRemaining}` : ''}
        </span>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/60 backdrop-blur-sm text-pink-700 rounded-b-2xl text-xs sm:text-sm gap-2 border-2 border-t-0 border-pink-200/60">
        {/* Health */}
        <div className="flex gap-0.5 shrink-0">
          {Array.from({ length: health.max }, (_, i) => (
            <span key={i} className={`text-sm sm:text-lg transition-all ${i < health.current ? 'scale-100' : 'scale-75 opacity-30 grayscale'}`}>
              {i < health.current ? '💖' : '🤍'}
            </span>
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
                className={`
                  px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all
                  ${item.rarity === 'legendary' ? 'bg-amber-300 text-amber-800' : item.rarity === 'rare' ? 'bg-blue-200 text-blue-700' : 'bg-pink-200 text-pink-600'}
                  ${isActive ? 'cursor-pointer hover:brightness-110' : 'opacity-60'}
                  ${isSelected ? 'ring-2 ring-yellow-400 scale-110' : ''}
                `}
                title={isActive ? `Click to use ${item.name}` : item.description}
              >
                {item.name} {item.type === 'active' ? `x${item.charges}` : ''}
              </button>
            );
          })}
        </div>
        {activeItemId && (
          <div className="text-[10px] text-orange-400 font-medium animate-pulse">
            Pick a cell!
          </div>
        )}
      </div>
    </div>
  );
}
