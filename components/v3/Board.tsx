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
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFlagMode(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleFlagMode]);

  const windowWidth = useWindowWidth();
  const cellSize = useMemo(() => {
    if (field.width === 0) return 36;
    const available = windowWidth - 32;
    const size = Math.floor(available / field.width);
    return Math.max(28, Math.min(44, size));
  }, [windowWidth, field.width]);

  const onReveal = (row: number, col: number) => {
    if (field.cells.length === 0) {
      generateFieldOnFirstClick(row, col);
      const newField = useGameStore.getState().run.field;
      if (newField.cells.length > 0) handleReveal(row, col);
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
      if (activeItemId === 'scanner') handleScanner(row, col);
      else if (activeItemId === 'all-in-click') handleAllInClick(row, col);
      setActiveItem(null);
      return;
    }
    const cell = field.cells[row]?.[col];
    if (cell?.visibility === 'revealed') onChord(row, col);
    else if (flagMode) onFlag(row, col);
    else onReveal(row, col);
  };

  if (phase === 'not_started') return null;
  const showEmpty = field.cells.length === 0;

  return (
    <div className="flex flex-col items-center gap-2 w-full px-2" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleFlagMode}
          className={`px-4 py-2 font-bold text-xs transition-none cursor-pointer border-2
            ${flagMode
              ? 'bg-[#ff6b6b] text-[#1a1025] border-t-[#ff8585] border-l-[#ff8585] border-b-[#cc4444] border-r-[#cc4444]'
              : 'bg-[#2a1f3d] text-[#b8a9d4] border-t-[#4a3a6b] border-l-[#4a3a6b] border-b-[#1a1025] border-r-[#1a1025] hover:text-[#f0e6ff]'
            }`}
        >
          {flagMode ? '!! FLAG MODE' : '>> REVEAL MODE'}
        </button>
        <span className="text-[10px] text-[#4a3a6b] hidden sm:inline">
          Right-click or [F] to toggle
        </span>
      </div>

      <div
        className="inline-grid gap-0 border-2 border-[#4a3a6b] overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${field.width}, ${cellSize}px)`, imageRendering: 'pixelated' }}
      >
        {showEmpty
          ? Array.from({ length: field.height * field.width }, (_, i) => {
              const row = Math.floor(i / field.width);
              const col = i % field.width;
              return (
                <button
                  key={`${row}-${col}`}
                  className="cursor-pointer select-none transition-none hover:bg-[#6b5a9a] active:bg-[#4a3a6b]"
                  style={{
                    width: cellSize, height: cellSize,
                    backgroundColor: '#5c4a8a',
                    boxShadow: 'inset 2px 2px 0 #7b6aaa, inset -2px -2px 0 #3d2e56',
                    imageRendering: 'pixelated',
                  }}
                  onClick={() => onReveal(row, col)}
                />
              );
            })
          : field.cells.flatMap((rowCells, row) =>
              rowCells.map((cell, col) => (
                <Cell
                  key={`${row}-${col}`}
                  cell={cell} row={row} col={col} size={cellSize}
                  onReveal={() => handleCellClick(row, col)}
                  onFlag={() => onFlag(row, col)}
                  onChord={() => onChord(row, col)}
                  isItemTarget={!!activeItemId}
                />
              ))
            )}
      </div>

      <button
        onClick={toggleFlagMode}
        className={`fixed bottom-6 right-6 z-30 sm:hidden w-14 h-14 flex items-center justify-center text-2xl cursor-pointer transition-none border-2
          ${flagMode
            ? 'bg-[#ff6b6b] text-[#1a1025] border-[#cc4444]'
            : 'bg-[#2a1f3d] text-[#b8a9d4] border-[#4a3a6b]'
          }`}
      >
        {flagMode ? '🚩' : '👆'}
      </button>
    </div>
  );
}
