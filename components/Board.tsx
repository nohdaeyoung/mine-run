'use client';

import { useGameStore } from '@/lib/store';
import { handleReveal, handleFlag, handleChord } from '@/lib/tile-interaction';
import { generateFieldOnFirstClick } from '@/lib/run';
import Cell from './Cell';

export default function Board() {
  const field = useGameStore((s) => s.run.field);
  const phase = useGameStore((s) => s.run.phase);

  const onReveal = (row: number, col: number) => {
    // Generate field on first click
    if (field.cells.length === 0) {
      generateFieldOnFirstClick(row, col);
      // After generation, re-read state and reveal
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

  if (phase === 'not_started') return null;

  // Before first click: show empty grid
  const showEmpty = field.cells.length === 0;

  return (
    <div className="flex flex-col items-center gap-1" onContextMenu={(e) => e.preventDefault()}>
      <div
        className="inline-grid gap-0 border-2 border-slate-500 rounded"
        style={{
          gridTemplateColumns: `repeat(${field.width}, 2rem)`,
        }}
      >
        {showEmpty
          ? Array.from({ length: field.height * field.width }, (_, i) => {
              const row = Math.floor(i / field.width);
              const col = i % field.width;
              return (
                <button
                  key={`${row}-${col}`}
                  className="w-8 h-8 border border-slate-400/50 bg-slate-300 hover:bg-slate-200 cursor-pointer select-none transition-all duration-75"
                  onClick={() => onReveal(row, col)}
                  onContextMenu={(e) => e.preventDefault()}
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
                  onReveal={onReveal}
                  onFlag={onFlag}
                  onChord={onChord}
                />
              ))
            )}
      </div>
    </div>
  );
}
