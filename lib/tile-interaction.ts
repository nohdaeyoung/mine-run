import type { Cell, ComboGrade } from './types';
import { getNeighbors } from './minefield';
import { calculateScore, calculateClearBonus } from './combo';
import { useGameStore } from './store';

// === Event callbacks ===
type GameEventCallback = {
  onCellsRevealed?: (cells: { row: number; col: number }[], grade: ComboGrade, points: number, multiplier: number) => void;
  onHitMine?: (row: number, col: number) => void;
  onFieldCleared?: () => void;
  onFlagToggled?: (row: number, col: number, isFlagged: boolean) => void;
};

let eventCallbacks: GameEventCallback = {};

export function setEventCallbacks(callbacks: GameEventCallback) {
  eventCallbacks = callbacks;
}

// === Flood Fill (BFS) ===
function floodFill(
  cells: Cell[][],
  startRow: number,
  startCol: number,
  width: number,
  height: number
): { row: number; col: number }[] {
  const revealed: { row: number; col: number }[] = [];
  const queue: [number, number][] = [[startRow, startCol]];
  const visited = new Set<string>();
  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const cell = cells[r][c];

    if (cell.visibility !== 'hidden') continue;

    cell.visibility = 'revealed';
    revealed.push({ row: r, col: c });

    // If 0-cell, expand to neighbors
    if (cell.value === 0) {
      for (const [nr, nc] of getNeighbors(r, c, width, height)) {
        const key = `${nr},${nc}`;
        if (!visited.has(key) && cells[nr][nc].visibility === 'hidden') {
          visited.add(key);
          queue.push([nr, nc]);
        }
      }
    }
  }

  return revealed;
}

// === REVEAL ===
export function handleReveal(row: number, col: number): void {
  const store = useGameStore.getState();
  const { field, phase } = store.run;
  const { actions } = store;

  if (phase !== 'in_progress') return;
  if (store.flow.isTransitioning) return;

  const cell = field.cells[row]?.[col];
  if (!cell || cell.visibility !== 'hidden') return;

  const newCells = field.cells.map((r) => r.map((c) => ({ ...c })));

  if (cell.value === 'mine') {
    // Hit mine
    newCells[row][col] = { ...newCells[row][col], visibility: 'exploded' };
    actions.updateCells(newCells);

    // Check for blast suit
    const blastSuitIndex = store.run.items.findIndex(
      (item) => item.id === 'blast-suit' && item.charges > 0
    );

    if (blastSuitIndex !== -1) {
      // Blast suit absorbs damage
      actions.removeItem(blastSuitIndex);
    } else {
      // Take damage
      actions.takeDamage(1);
      if (store.run.combo.current > 0) {
        actions.resetCombo();
      }

      // Check death
      const newHealth = Math.max(0, store.run.health.current - 1);
      if (newHealth <= 0) {
        // Reveal all mines on death
        for (let r = 0; r < field.height; r++) {
          for (let c = 0; c < field.width; c++) {
            if (newCells[r][c].value === 'mine' && newCells[r][c].visibility === 'hidden') {
              newCells[r][c] = { ...newCells[r][c], visibility: 'revealed' };
            }
          }
        }
        actions.updateCells(newCells);
        actions.setPhase('game_over');
        actions.setScreen('game_over');
        eventCallbacks.onFieldCleared?.();
        return;
      }
    }

    eventCallbacks.onHitMine?.(row, col);

    // After surviving a mine hit, check if all safe cells are already revealed
    checkAutoFieldClear();
    return;
  }

  // Safe cell
  let revealedCells: { row: number; col: number }[];

  if (cell.value === 0) {
    // Flood fill
    revealedCells = floodFill(newCells, row, col, field.width, field.height);
  } else {
    // Single cell reveal
    newCells[row][col] = { ...newCells[row][col], visibility: 'revealed' };
    revealedCells = [{ row, col }];
  }

  actions.updateCells(newCells);
  actions.incrementRevealed(revealedCells.length);

  // Score
  const { grade, multiplier, points } = calculateScore(revealedCells.length);
  actions.addScore(points);
  actions.setCombo(revealedCells.length, multiplier);

  eventCallbacks.onCellsRevealed?.(revealedCells, grade, points, multiplier);

  // Check field cleared
  const newRevealed = store.run.field.revealedCount + revealedCells.length;
  if (newRevealed >= field.totalSafeCells) {
    const clearBonus = calculateClearBonus(field.totalSafeCells);
    actions.addScore(clearBonus);
    actions.setPhase('reward_selection');
    actions.setScreen('reward');
    eventCallbacks.onFieldCleared?.();
  }
}

// === Auto-clear check ===
// When all safe cells are revealed, clear the field (even without explicit click)
function checkAutoFieldClear(): void {
  const store = useGameStore.getState();
  const { field, phase } = store.run;

  if (phase !== 'in_progress') return;
  if (field.cells.length === 0) return;

  if (field.revealedCount >= field.totalSafeCells) {
    const clearBonus = calculateClearBonus(field.totalSafeCells);
    store.actions.addScore(clearBonus);
    store.actions.setPhase('reward_selection');
    store.actions.setScreen('reward');
    eventCallbacks.onFieldCleared?.();
  }
}

// === FLAG ===
export function handleFlag(row: number, col: number): void {
  const store = useGameStore.getState();
  const { field, phase } = store.run;

  if (phase !== 'in_progress') return;
  if (store.flow.isTransitioning) return;

  const cell = field.cells[row]?.[col];
  if (!cell) return;
  if (cell.visibility === 'revealed' || cell.visibility === 'exploded') return;

  const newCells = field.cells.map((r) => r.map((c) => ({ ...c })));
  const isFlagged = cell.visibility === 'flagged';
  newCells[row][col] = {
    ...newCells[row][col],
    visibility: isFlagged ? 'hidden' : 'flagged',
  };

  store.actions.updateCells(newCells);
  eventCallbacks.onFlagToggled?.(row, col, !isFlagged);

  // Check if all safe cells are already revealed
  checkAutoFieldClear();
}

// === CHORD ===
export function handleChord(row: number, col: number): void {
  const store = useGameStore.getState();
  const { field, phase } = store.run;

  if (phase !== 'in_progress') return;
  if (store.flow.isTransitioning) return;

  const cell = field.cells[row]?.[col];
  if (!cell || cell.visibility !== 'revealed') return;
  if (typeof cell.value !== 'number' || cell.value === 0) return;

  const neighbors = getNeighbors(row, col, field.width, field.height);
  const flaggedCount = neighbors.filter(
    ([nr, nc]) => field.cells[nr][nc].visibility === 'flagged'
  ).length;

  if (flaggedCount !== cell.value) return;

  // Reveal all non-flagged hidden neighbors
  const hiddenNeighbors = neighbors.filter(
    ([nr, nc]) => field.cells[nr][nc].visibility === 'hidden'
  );

  for (const [nr, nc] of hiddenNeighbors) {
    handleReveal(nr, nc);
  }
}
