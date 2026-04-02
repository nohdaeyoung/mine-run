'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import { handleReveal, handleFlag, handleChord, handleScanner, handleAllInClick } from '@/lib/tile-interaction';
import { generateFieldOnFirstClick } from '@/lib/run';
import Cell from './Cell';

function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 800
  );

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return width;
}

export default function Board() {
  const field = useGameStore((s) => s.run.field);
  const phase = useGameStore((s) => s.run.phase);
  const activeItemId = useGameStore((s) => s.flow.activeItemId);
  const setActiveItem = useGameStore((s) => s.actions.setActiveItem);
  const [flagMode, setFlagMode] = useState(false);

  const toggleFlagMode = useCallback(() => setFlagMode((f) => !f), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFlagMode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleFlagMode]);

  const windowWidth = useWindowWidth();

  const cellSize = useMemo(() => {
    if (field.width === 0) return 40;
    const padding = 32;
    const borderSpace = 4;
    const available = windowWidth - padding - borderSpace;
    const size = Math.floor(available / field.width);
    return Math.max(28, Math.min(48, size));
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
    if (activeItemId) {
      if (activeItemId === 'scanner') {
        handleScanner(row, col);
      } else if (activeItemId === 'all-in-click') {
        handleAllInClick(row, col);
      }
      setActiveItem(null);
      return;
    }

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
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleFlagMode}
          className={`
            px-4 py-2 rounded-full font-bold text-sm transition-all cursor-pointer
            ${flagMode
              ? 'bg-rose-400 text-white shadow-lg shadow-rose-300/40'
              : 'bg-white/80 text-pink-400 hover:bg-white border-2 border-pink-200'
            }
          `}
        >
          {flagMode ? '🚩 Flag Mode' : '👆 Reveal Mode'}
        </button>
        <span className="text-xs text-pink-300 hidden sm:inline">
          Right-click or <kbd className="px-1.5 py-0.5 bg-white/70 rounded-full text-pink-400 font-mono">F</kbd> to toggle
        </span>
      </div>

      <div
        className="inline-grid gap-0 border-2 border-pink-200/60 rounded-xl overflow-hidden shadow-lg shadow-pink-200/30 bg-amber-50/50"
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
                  className="border border-pink-300/40 bg-pink-200 hover:bg-pink-100 cursor-pointer select-none transition-all duration-75 rounded-[3px] shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.08),inset_2px_2px_0_rgba(255,255,255,0.7)]"
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
                  isItemTarget={!!activeItemId}
                />
              ))
            )}
      </div>

      {/* Mobile flag toggle */}
      <button
        onClick={toggleFlagMode}
        className={`
          fixed bottom-6 right-6 z-30 sm:hidden
          w-14 h-14 rounded-full flex items-center justify-center
          text-2xl shadow-lg transition-all active:scale-95 cursor-pointer
          ${flagMode
            ? 'bg-rose-400 text-white shadow-rose-300/40'
            : 'bg-white text-pink-400 shadow-pink-200/50 border-2 border-pink-200'
          }
        `}
        aria-label={flagMode ? 'Flag mode on' : 'Reveal mode'}
      >
        {flagMode ? '🚩' : '👆'}
      </button>
    </div>
  );
}
