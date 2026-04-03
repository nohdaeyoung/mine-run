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
  1: '#5b8a4e',
  2: '#c4a882',
  3: '#d4886b',
  4: '#7b6d9a',
  5: '#b8901a',
  6: '#4a8a7a',
  7: '#c47a7a',
  8: '#8b7d6b',
};

export default function Cell({ cell, size, onReveal, onFlag, isItemTarget }: CellProps) {
  const handleClick = (e: React.MouseEvent) => { e.preventDefault(); onReveal(); };
  const handleContextMenu = (e: React.MouseEvent) => { e.preventDefault(); onFlag(); };

  let className = 'flex items-center justify-center font-bold select-none transition-all duration-150 ';
  let extraClass = '';
  let content = '';
  let textColor = '';
  let style: React.CSSProperties = { width: size, height: size };

  if (cell.visibility === 'revealed') {
    const isEmpty = typeof cell.value === 'number' && cell.value === 0;
    extraClass = isEmpty ? 'wc-cell-revealed-empty' : 'wc-cell-revealed';
    if (typeof cell.value === 'number' && cell.value > 0) {
      content = String(cell.value);
      textColor = NUMBER_COLORS[cell.value] || '#8b7d6b';
    }
  } else if (cell.visibility === 'flagged') {
    extraClass = 'wc-cell-hidden';
    content = '🚩';
  } else if (cell.visibility === 'exploded') {
    style.background = 'linear-gradient(135deg, #e8a8a0 0%, #dba090 60%, #f0b8b0 100%)';
    style.borderRadius = 3;
    content = '💥';
    className += 'animate-pulse ';
  } else if (cell.scanned === 'safe') {
    extraClass = 'wc-cell-hidden';
    style.outline = '2px solid rgba(124,182,104,0.6)';
    style.outlineOffset = '-2px';
    content = '♡';
    textColor = '#5b8a4e';
  } else if (cell.scanned === 'danger') {
    extraClass = 'wc-cell-hidden';
    style.outline = '2px solid rgba(212,136,107,0.6)';
    style.outlineOffset = '-2px';
    content = '!';
    textColor = '#d4886b';
  } else {
    extraClass = 'wc-cell-hidden cursor-pointer';
  }

  if (isItemTarget && cell.visibility === 'hidden') {
    style.outline = '2px solid rgba(255,215,0,0.7)';
    style.outlineOffset = '-2px';
  }

  const fontSize = size >= 40 ? 14 : size >= 32 ? 12 : 10;

  return (
    <button
      className={`${className} ${extraClass}`}
      style={{ ...style, fontSize, color: textColor, lineHeight: 1 }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {content}
    </button>
  );
}
