'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import {
  handleReveal,
  handleFlag,
  handleChord,
  handleScanner,
  handleAllInClick,
  onGameEvent,
} from '@/lib/tile-interaction';
import { generateFieldOnFirstClick } from '@/lib/run';
import { sfxHeartbeat } from '@/lib/sfx';
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

interface FloatScore {
  id: number;
  row: number;
  col: number;
  points: number;
}

export default function Board() {
  const field = useGameStore((s) => s.run.field);
  const phase = useGameStore((s) => s.run.phase);
  const activeItemId = useGameStore((s) => s.flow.activeItemId);
  const setActiveItem = useGameStore((s) => s.actions.setActiveItem);
  const [flagMode, setFlagMode] = useState(false);

  const [shake, setShake] = useState<'' | 'sm' | 'lg'>('');
  const [revealMap, setRevealMap] = useState<Map<string, number>>(new Map());
  const [floats, setFloats] = useState<FloatScore[]>([]);
  const nextId = useRef(1);

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

  // === Effect events: stagger reveal pops, floating score, screen shake ===
  useEffect(() => {
    const unsubs = [
      onGameEvent('cellsRevealed', ({ cells, origin, points }) => {
        if (cells.length === 0) return;
        const oRow = origin?.row ?? cells[0].row;
        const oCol = origin?.col ?? cells[0].col;
        const m = new Map<string, number>();
        for (const { row, col } of cells) {
          const dist = Math.max(Math.abs(row - oRow), Math.abs(col - oCol));
          m.set(`${row},${col}`, Math.min(220, dist * 22));
        }
        setRevealMap(m);
        setTimeout(() => setRevealMap(new Map()), 650);

        if (origin && points > 0) {
          const id = nextId.current++;
          setFloats((f) => [...f, { id, row: origin.row, col: origin.col, points }]);
          setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 900);
        }
      }),
      onGameEvent('mineHit', () => setShake('lg')),
      onGameEvent('gameOver', () => setShake('lg')),
      onGameEvent('shieldSave', () => setShake('sm')),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

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

  // === Clutch detection: few safe cells left = heightened tension ===
  const hiddenSafe = useMemo(() => {
    if (field.cells.length === 0) return Infinity;
    let n = 0;
    for (const rowCells of field.cells) {
      for (const c of rowCells) {
        if (c.visibility === 'hidden' && c.value !== 'mine') n++;
      }
    }
    return n;
  }, [field.cells]);

  const clutch = phase === 'in_progress' && hiddenSafe > 0 && hiddenSafe <= 3;

  useEffect(() => {
    if (!clutch) return;
    sfxHeartbeat();
    const interval = setInterval(() => sfxHeartbeat(), 900);
    return () => clearInterval(interval);
  }, [clutch]);

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
    // Active item targeting
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
  const shakeClass = shake === 'lg' ? 'mr-shake-lg' : shake === 'sm' ? 'mr-shake-sm' : '';

  return (
    <div className="flex flex-col items-center gap-2 w-full px-2" onContextMenu={(e) => e.preventDefault()}>
      {/* Clutch vignette */}
      {clutch && <div className="fixed inset-0 z-20 pointer-events-none mr-vignette-clutch" />}

      {/* Desktop toggle button above board */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleFlagMode}
          className={`
            px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer
            ${flagMode
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }
          `}
        >
          {flagMode ? '🚩 Flag Mode ON' : '👆 Reveal Mode'}
        </button>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Right-click or press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 font-mono">F</kbd> to toggle
        </span>
      </div>

      <div
        className={`relative inline-grid gap-0 border border-slate-600/50 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)] ${shakeClass}`}
        style={{
          gridTemplateColumns: `repeat(${field.width}, ${cellSize}px)`,
        }}
        onAnimationEnd={() => setShake('')}
      >
        {showEmpty
          ? Array.from({ length: field.height * field.width }, (_, i) => {
              const row = Math.floor(i / field.width);
              const col = i % field.width;
              return (
                <button
                  key={`${row}-${col}`}
                  className="border border-slate-400/50 bg-slate-300 hover:bg-slate-200 cursor-pointer select-none transition-all duration-75 shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.15),inset_2px_2px_0_rgba(255,255,255,0.6)]"
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
                  revealDelay={revealMap.get(`${row},${col}`)}
                />
              ))
            )}

        {/* Floating score numbers */}
        {floats.map((f) => (
          <div
            key={f.id}
            className="mr-score-float absolute z-30 pointer-events-none font-black text-amber-300 text-lg drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
            style={{
              top: f.row * cellSize - 6,
              left: f.col * cellSize + cellSize / 2,
            }}
          >
            +{f.points}
          </div>
        ))}
      </div>

      {/* Floating flag toggle — bottom right (mobile only) */}
      <button
        onClick={toggleFlagMode}
        className={`
          fixed bottom-6 right-6 z-30 sm:hidden
          w-14 h-14 rounded-full flex items-center justify-center
          text-2xl shadow-lg transition-all active:scale-95 cursor-pointer
          ${flagMode
            ? 'bg-red-500 text-white shadow-red-500/40'
            : 'bg-slate-700 text-slate-300 shadow-slate-900/50'
          }
        `}
        aria-label={flagMode ? 'Flag mode on' : 'Reveal mode'}
      >
        {flagMode ? '🚩' : '👆'}
      </button>
    </div>
  );
}
