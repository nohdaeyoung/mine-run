'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import { handleReveal, handleFlag, handleChord, handleScanner, handleAllInClick } from '@/lib/tile-interaction';
import { generateFieldOnFirstClick } from '@/lib/run';
import Cell from './Cell';

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);
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
    if (field.width === 0) return 40;
    const available = windowWidth - 32;
    const size = Math.floor(available / field.width);
    return Math.max(28, Math.min(48, size));
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
  const onFlag = (row: number, col: number) => { if (field.cells.length === 0) return; handleFlag(row, col); };
  const onChord = (row: number, col: number) => { if (field.cells.length === 0) return; handleChord(row, col); };

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
    <div className="flex flex-col items-center gap-3 w-full px-2" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleFlagMode}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition-all cursor-pointer
            ${flagMode
              ? 'bg-gradient-to-r from-[#d4886b] to-[#c47a5b] text-white shadow-md shadow-[#d4886b]/20'
              : 'wc-panel text-[#8b7d6b] hover:text-[#5b4a3a]'
            }`}
        >
          {flagMode ? '🚩 Flag Mode' : '👆 Reveal Mode'}
        </button>
        <span className="text-[10px] text-[#8b7d6b]/40 hidden sm:inline italic">
          Right-click or [F] to toggle
        </span>
      </div>

      <div
        className="inline-grid gap-[2px] p-2 wc-panel rounded-xl"
        style={{ gridTemplateColumns: `repeat(${field.width}, ${cellSize}px)` }}
      >
        {showEmpty
          ? Array.from({ length: field.height * field.width }, (_, i) => {
              const row = Math.floor(i / field.width);
              const col = i % field.width;
              return (
                <button
                  key={`${row}-${col}`}
                  className="wc-cell-hidden cursor-pointer select-none transition-all duration-150"
                  style={{ width: cellSize, height: cellSize }}
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
        className={`fixed bottom-6 right-6 z-30 sm:hidden w-14 h-14 rounded-full flex items-center justify-center
          text-2xl shadow-lg cursor-pointer transition-all
          ${flagMode
            ? 'bg-gradient-to-r from-[#d4886b] to-[#c47a5b] text-white'
            : 'wc-panel text-[#8b7d6b]'
          }`}
      >
        {flagMode ? '🚩' : '👆'}
      </button>
    </div>
  );
}
