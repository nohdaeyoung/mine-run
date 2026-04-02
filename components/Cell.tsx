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
  isItemTarget?: boolean;
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

export default function Cell({ cell, size, onReveal, onFlag, isItemTarget }: CellProps) {
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
    bgClass = 'bg-slate-900/80';
    extraClass = 'border-slate-700/30';
    if (typeof cell.value === 'number' && cell.value > 0) {
      content = String(cell.value);
      textClass = NUMBER_COLORS[cell.value] || 'text-slate-300';
    }
  } else if (cell.visibility === 'flagged') {
    bgClass = 'bg-slate-300/90 hover:bg-slate-200 cursor-pointer shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.15),inset_1px_1px_0_rgba(255,255,255,0.6)]';
    content = '🚩';
    extraClass = 'border-slate-400/50';
  } else if (cell.visibility === 'exploded') {
    bgClass = 'bg-red-600 animate-pulse';
    content = '💥';
    extraClass = 'border-red-500';
  } else if (cell.scanned === 'safe') {
    bgClass = 'bg-emerald-300/80 hover:bg-emerald-200 cursor-pointer shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.1),inset_1px_1px_0_rgba(255,255,255,0.5)]';
    content = '✓';
    textClass = 'text-emerald-700 text-xs';
    extraClass = 'border-emerald-400/60';
  } else if (cell.scanned === 'danger') {
    bgClass = 'bg-red-300/80 hover:bg-red-200 cursor-pointer shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.1),inset_1px_1px_0_rgba(255,255,255,0.5)]';
    content = '⚠';
    textClass = 'text-red-700 text-xs';
    extraClass = 'border-red-400/60';
  } else {
    // Hidden cell — raised, clickable look
    bgClass = 'bg-slate-300 hover:bg-slate-200 cursor-pointer active:bg-slate-400 shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.15),inset_2px_2px_0_rgba(255,255,255,0.6)]';
    extraClass = 'border-slate-400/50 hover:border-slate-300/60';
  }

  // Item targeting highlight
  if (isItemTarget && cell.visibility === 'hidden') {
    extraClass += ' ring-2 ring-amber-400/70';
  }

  const fontSize = size >= 40 ? 'text-base' : size >= 32 ? 'text-sm' : 'text-xs';

  return (
    <button
      className={`
        border flex items-center justify-center
        font-bold select-none transition-all duration-100
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
