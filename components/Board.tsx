'use client';

import { useState, useMemo } from 'react';
import { useGameStore } from '@/lib/store';
import { handleReveal, handleFlag, handleChord } from '@/lib/tile-interaction';
import { generateFieldOnFirstClick } from '@/lib/run';
import Cell from './Cell';

function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 800
  );

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => setWidth(window.innerWidth), { once: false });
  }

  return width;
}

export default function Board() {
  const field = useGameStore((s) => s.run.field);
  const phase = useGameStore((s) => s.run.phase);
  const [flagMode, setFlagMode] = useState(false);

  const windowWidth = useWindowWidth();

  // Calculate cell size based on screen width
  const cellSize = useMemo(() => {
    if (field.width === 0) return 40;
    const padding = 32; // 16px each side
    const borderSpace = 4;
    const available = windowWidth - padding - borderSpace;
    const size = Math.floor(available / field.width);
    return Math.max(28, Math.min(48, size)); // min 28px, max 48px
  }, [windowWidth, field.width]);

  const onReveal = (row: number, col: number) => {
    if (field.cells.length === 0) {
      generateFieldOnFirstClick(row, col);
      const newField = useGameStore.getState().run.field;
      if (newField.cells.length > 0) {
        handleReveal(row, col);
      }
      return;
    }
    handleReveal(row, col);
  };

  const onFlag = (row: number, col: number) => {
    if (field.cells.length === 0) return;
    handleFlag(row, col);
  };

  const onChord = (row: number, col: number) => {
    if (field.cells.length === 0) return;
    handleChord(row, col);
  };

  const handleCellClick = (row: number, col: number) => {
    const cell = field.cells[row]?.[col];
    if (cell?.visibility === 'revealed') {
      onChord(row, col);
    } else if (flagMode) {
      onFlag(row, col);
    } else {
      onReveal(row, col);
    }
  };

  if (phase === 'not_started') return null;

  const showEmpty = field.cells.length === 0;

  return (
    <div className="flex flex-col items-center gap-2 w-full px-2" onContextMenu={(e) => e.preventDefault()}>
      {/* Flag mode toggle */}
      <button
        onClick={() => setFlagMode(!flagMode)}
        className={`
          px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer
          ${flagMode
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }
        `}
      >
        {flagMode ? '🚩 Flag Mode ON' : '👆 Tap to Reveal'}
      </button>

      <div
        className="inline-grid gap-0 border-2 border-slate-500 rounded"
        style={{
          gridTemplateColumns: `repeat(${field.width}, ${cellSize}px)`,
        }}
      >
        {showEmpty
          ? Array.from({ length: field.height * field.width }, (_, i) => {
              const row = Math.floor(i / field.width);
              const col = i % field.width;
              return (
                <button
                  key={`${row}-${col}`}
                  className="border border-slate-400/50 bg-slate-300 hover:bg-slate-200 cursor-pointer select-none transition-all duration-75"
                  style={{ width: cellSize, height: cellSize }}
                  onClick={() => onReveal(row, col)}
                  aria-label={`Cell ${row},${col}`}
                />
              );
            })
          : field.cells.flatMap((rowCells, row) =>
              rowCells.map((cell, col) => (
                <Cell
                  key={`${row}-${col}`}
                  cell={cell}
                  row={row}
                  col={col}
                  size={cellSize}
                  onReveal={() => handleCellClick(row, col)}
                  onFlag={() => onFlag(row, col)}
                  onChord={() => onChord(row, col)}
                />
              ))
            )}
      </div>
    </div>
  );
}
