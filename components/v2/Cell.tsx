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
  1: 'text-blue-500',
  2: 'text-green-500',
  3: 'text-rose-500',
  4: 'text-purple-500',
  5: 'text-orange-500',
  6: 'text-teal-500',
  7: 'text-pink-400',
  8: 'text-gray-400',
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
    bgClass = 'bg-amber-50/80';
    extraClass = 'border-amber-200/40';
    if (typeof cell.value === 'number' && cell.value > 0) {
      content = String(cell.value);
      textClass = NUMBER_COLORS[cell.value] || 'text-pink-300';
    }
  } else if (cell.visibility === 'flagged') {
    bgClass = 'bg-pink-200 hover:bg-pink-150 cursor-pointer shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.08),inset_1px_1px_0_rgba(255,255,255,0.7)]';
    content = '🚩';
    extraClass = 'border-pink-300/60';
  } else if (cell.visibility === 'exploded') {
    bgClass = 'bg-red-300 animate-pulse';
    content = '💥';
    extraClass = 'border-red-400 rounded-lg';
  } else if (cell.scanned === 'safe') {
    bgClass = 'bg-green-200/80 hover:bg-green-100 cursor-pointer shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.06),inset_1px_1px_0_rgba(255,255,255,0.6)]';
    content = '♡';
    textClass = 'text-green-600 text-xs';
    extraClass = 'border-green-300/60';
  } else if (cell.scanned === 'danger') {
    bgClass = 'bg-red-200/80 hover:bg-red-100 cursor-pointer shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.06),inset_1px_1px_0_rgba(255,255,255,0.6)]';
    content = '!';
    textClass = 'text-red-500 text-xs font-black';
    extraClass = 'border-red-300/60';
  } else {
    // Hidden cell — cute raised button
    bgClass = 'bg-pink-200 hover:bg-pink-100 cursor-pointer active:bg-pink-300 shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.08),inset_2px_2px_0_rgba(255,255,255,0.7)]';
    extraClass = 'border-pink-300/50 hover:border-pink-200/60';
  }

  // Item targeting highlight
  if (isItemTarget && cell.visibility === 'hidden') {
    extraClass += ' ring-2 ring-yellow-400/70 animate-pulse';
  }

  const fontSize = size >= 40 ? 'text-base' : size >= 32 ? 'text-sm' : 'text-xs';

  return (
    <button
      className={`
        border flex items-center justify-center
        font-bold select-none transition-all duration-100 rounded-[3px]
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
