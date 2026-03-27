'use client';

import { useGameStore } from '@/lib/store';

export default function HUD() {
  const score = useGameStore((s) => s.run.score);
  const combo = useGameStore((s) => s.run.combo);
  const health = useGameStore((s) => s.run.health);
  const items = useGameStore((s) => s.run.items);
  const roomIndex = useGameStore((s) => s.run.roomIndex);
  const totalRooms = useGameStore((s) => s.run.totalRooms);
  const field = useGameStore((s) => s.run.field);
  const phase = useGameStore((s) => s.run.phase);

  if (phase === 'not_started') return null;

  const flagCount = field.cells.flat().filter((c) => c.visibility === 'flagged').length;
  const minesRemaining = field.mines - flagCount;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 text-white rounded-t-lg text-sm">
        <span className="font-mono">
          Room {roomIndex + 1}/{totalRooms}
        </span>
        <span className="font-bold text-lg tabular-nums">
          {score.toLocaleString()}
        </span>
        <span className="font-mono">
          {field.mines > 0 ? `💣 ${minesRemaining}` : ''}
        </span>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-700 text-white rounded-b-lg text-sm mt-0">
        {/* Health */}
        <div className="flex gap-0.5">
          {Array.from({ length: health.max }, (_, i) => (
            <span key={i} className={`text-lg ${i < health.current ? '' : 'opacity-30'}`}>
              {i < health.current ? '❤️' : '🖤'}
            </span>
          ))}
        </div>

        {/* Items */}
        <div className="flex gap-1">
          {items.map((item, i) => (
            <div
              key={i}
              className={`
                px-2 py-0.5 rounded text-xs font-medium
                ${item.rarity === 'legendary' ? 'bg-amber-500' : item.rarity === 'rare' ? 'bg-blue-500' : 'bg-slate-500'}
              `}
              title={item.description}
            >
              {item.name} {item.type === 'active' ? `×${item.charges}` : ''}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - items.length) }, (_, i) => (
            <div key={`empty-${i}`} className="px-2 py-0.5 rounded text-xs bg-slate-600 opacity-30">
              empty
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
