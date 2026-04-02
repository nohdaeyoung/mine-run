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
  1: '#5ba3d9',
  2: '#4ade80',
  3: '#ff6b6b',
  4: '#a78bfa',
  5: '#f0c040',
  6: '#38d9a9',
  7: '#ff8585',
  8: '#94a3b8',
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

  let style: React.CSSProperties = { width: size, height: size, imageRendering: 'pixelated' as const };
  let className = 'flex items-center justify-center font-bold select-none transition-none ';
  let content = '';
  let textColor = '';

  if (cell.visibility === 'revealed') {
    const isEmpty = typeof cell.value === 'number' && cell.value === 0;
    style.backgroundColor = isEmpty ? '#221a35' : '#2a2040';
    style.boxShadow = 'inset 1px 1px 0 #1a1025';
    if (typeof cell.value === 'number' && cell.value > 0) {
      content = String(cell.value);
      textColor = NUMBER_COLORS[cell.value] || '#b8a9d4';
    }
  } else if (cell.visibility === 'flagged') {
    style.backgroundColor = '#5c4a8a';
    style.boxShadow = 'inset 2px 2px 0 #7b6aaa, inset -2px -2px 0 #3d2e56';
    content = '🚩';
  } else if (cell.visibility === 'exploded') {
    style.backgroundColor = '#ff2d2d';
    style.boxShadow = 'inset 1px 1px 0 #cc0000';
    content = '💥';
    className += 'animate-pulse ';
  } else if (cell.scanned === 'safe') {
    style.backgroundColor = '#5c4a8a';
    style.boxShadow = 'inset 2px 2px 0 #7b6aaa, inset -2px -2px 0 #3d2e56';
    style.outline = '2px solid #4ade80';
    style.outlineOffset = '-2px';
    content = '✓';
    textColor = '#4ade80';
  } else if (cell.scanned === 'danger') {
    style.backgroundColor = '#5c4a8a';
    style.boxShadow = 'inset 2px 2px 0 #7b6aaa, inset -2px -2px 0 #3d2e56';
    style.outline = '2px solid #ff6b6b';
    style.outlineOffset = '-2px';
    content = '!';
    textColor = '#ff6b6b';
  } else {
    // Hidden cell — pixel 3D button
    style.backgroundColor = '#5c4a8a';
    style.boxShadow = 'inset 2px 2px 0 #7b6aaa, inset -2px -2px 0 #3d2e56';
    className += 'hover:bg-[#6b5a9a] active:shadow-[inset_2px_2px_0_#3d2e56,inset_-2px_-2px_0_#7b6aaa] active:bg-[#4a3a6b] cursor-pointer ';
  }

  if (isItemTarget && cell.visibility === 'hidden') {
    style.outline = '2px solid #f0c040';
    style.outlineOffset = '-2px';
  }

  const fontSize = size >= 40 ? 14 : size >= 32 ? 12 : 10;

  return (
    <button
      className={className}
      style={{ ...style, fontSize, color: textColor, lineHeight: 1 }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {content}
    </button>
  );
}
