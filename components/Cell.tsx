'use client';

import type { Cell as CellType } from '@/lib/types';

interface CellProps {
  cell: CellType;
  row: number;
  col: number;
  size: number;
  onReveal: () => void;
  onFlag: () => void;
  onChord: () => void;
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-400',
  2: 'text-green-400',
  3: 'text-red-400',
  4: 'text-purple-400',
  5: 'text-amber-500',
  6: 'text-teal-400',
  7: 'text-slate-300',
  8: 'text-slate-500',
};

export default function Cell({ cell, size, onReveal, onFlag, onChord }: CellProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onReveal();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onFlag();
  };

  let content = '';
  let bgClass = '';
  let textClass = '';
  let extraClass = '';

  if (cell.visibility === 'revealed') {
    bgClass = 'bg-slate-800/60';
    if (typeof cell.value === 'number' && cell.value > 0) {
      content = String(cell.value);
      textClass = NUMBER_COLORS[cell.value] || 'text-slate-300';
    }
  } else if (cell.visibility === 'flagged') {
    bgClass = 'bg-slate-600/80 hover:bg-slate-500/80 cursor-pointer';
    content = '🚩';
    extraClass = 'border-red-500/30';
  } else if (cell.visibility === 'exploded') {
    bgClass = 'bg-red-600/80';
    content = '💥';
  } else if (cell.scanned === 'safe') {
    bgClass = 'bg-green-900/40 hover:bg-green-800/40 cursor-pointer';
    extraClass = 'border-green-500/30';
  } else if (cell.scanned === 'danger') {
    bgClass = 'bg-red-900/40 hover:bg-red-800/40 cursor-pointer';
    extraClass = 'border-red-500/30';
  } else {
    // Hidden cell
    bgClass = 'bg-slate-600/50 hover:bg-slate-500/60 cursor-pointer active:bg-slate-500/80';
    extraClass = 'border-slate-500/20 hover:border-slate-400/30';
  }

  const fontSize = size >= 40 ? 'text-base' : size >= 32 ? 'text-sm' : 'text-xs';

  return (
    <button
      className={`
        border flex items-center justify-center
        font-bold select-none transition-all duration-75
        ${bgClass} ${textClass} ${fontSize} ${extraClass}
      `}
      style={{ width: size, height: size }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {content}
    </button>
  );
}
