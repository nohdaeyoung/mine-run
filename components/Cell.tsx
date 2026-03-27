'use client';

import type { Cell as CellType } from '@/lib/types';

interface CellProps {
  cell: CellType;
  row: number;
  col: number;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-600',
  2: 'text-green-600',
  3: 'text-red-600',
  4: 'text-purple-700',
  5: 'text-amber-800',
  6: 'text-teal-600',
  7: 'text-gray-800',
  8: 'text-gray-500',
};

export default function Cell({ cell, row, col, onReveal, onFlag, onChord }: CellProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cell.visibility === 'revealed') {
      onChord(row, col);
    } else {
      onReveal(row, col);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onFlag(row, col);
  };

  // Determine cell appearance
  let content = '';
  let bgClass = 'bg-slate-300 hover:bg-slate-200 cursor-pointer';
  let textClass = '';

  if (cell.visibility === 'revealed') {
    bgClass = 'bg-slate-100';
    if (typeof cell.value === 'number' && cell.value > 0) {
      content = String(cell.value);
      textClass = NUMBER_COLORS[cell.value] || 'text-gray-800';
    }
  } else if (cell.visibility === 'flagged') {
    bgClass = 'bg-slate-300 hover:bg-slate-200 cursor-pointer';
    content = '🚩';
  } else if (cell.visibility === 'exploded') {
    bgClass = 'bg-red-500';
    content = '💥';
  } else if (cell.scanned === 'safe') {
    bgClass = 'bg-green-200 hover:bg-green-100 cursor-pointer';
  } else if (cell.scanned === 'danger') {
    bgClass = 'bg-red-200 hover:bg-red-100 cursor-pointer';
  }

  return (
    <button
      className={`
        w-8 h-8 border border-slate-400/50 flex items-center justify-center
        text-sm font-bold select-none transition-all duration-75
        ${bgClass} ${textClass}
      `}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      aria-label={`Cell ${row},${col}`}
    >
      {content}
    </button>
  );
}
