import type { Cell, ComboGrade } from './types';
import { getNeighbors } from './minefield';
import { calculateScore, rollFieldClear } from './combo';
import { useGameStore } from './store';
import { getScannerRange } from './items';

// === Event bus (multi-subscriber) ===
// Replaces the old single-callback setter so multiple UI layers (combo popup,
// screen effects, audio, HUD) can each listen without clobbering one another.
export interface GameEventMap {
  cellsRevealed: {
    cells: { row: number; col: number }[];
    grade: ComboGrade;
    points: number;
    multiplier: number;
    origin: { row: number; col: number } | null; // null = whole-field auto reveal
  };
  mineHit: { row: number; col: number; healthRemaining: number };
  shieldSave: { row: number; col: number };
  fieldCleared: { clearBonus: number; totalSafeCells: number; jackpot: boolean };
  gameOver: { safeRemaining: number; totalSafeCells: number };
  flagToggled: { row: number; col: number; isFlagged: boolean };
}

type Listener<K extends keyof GameEventMap> = (payload: GameEventMap[K]) => void;

const listeners: { [K in keyof GameEventMap]: Set<Listener<K>> } = {
  cellsRevealed: new Set(),
  mineHit: new Set(),
  shieldSave: new Set(),
  fieldCleared: new Set(),
  gameOver: new Set(),
  flagToggled: new Set(),
};

export function onGameEvent<K extends keyof GameEventMap>(event: K, fn: Listener<K>): () => void {
  listeners[event].add(fn);
  return () => {
    listeners[event].delete(fn);
  };
}

function emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
  listeners[event].forEach((fn) => fn(payload));
}

// === Legacy adapter (v2–v4 components still call setEventCallbacks) ===
// Maps the old single-callback object onto the new bus. Preserves legacy
// behaviour where onFieldCleared also fired on death.
type LegacyCallbacks = {
  onCellsRevealed?: (cells: { row: number; col: number }[], grade: ComboGrade, points: number, multiplier: number) => void;
  onHitMine?: (row: number, col: number) => void;
  onFieldCleared?: () => void;
  onFlagToggled?: (row: number, col: number, isFlagged: boolean) => void;
};

let legacyUnsubs: (() => void)[] = [];

export function setEventCallbacks(cb: LegacyCallbacks): void {
  legacyUnsubs.forEach((u) => u());
  legacyUnsubs = [];
  if (cb.onCellsRevealed) {
    legacyUnsubs.push(onGameEvent('cellsRevealed', (p) => cb.onCellsRevealed!(p.cells, p.grade, p.points, p.multiplier)));
  }
  if (cb.onHitMine) {
    legacyUnsubs.push(onGameEvent('mineHit', (p) => cb.onHitMine!(p.row, p.col)));
  }
  if (cb.onFieldCleared) {
    legacyUnsubs.push(onGameEvent('fieldCleared', () => cb.onFieldCleared!()));
    legacyUnsubs.push(onGameEvent('gameOver', () => cb.onFieldCleared!()));
  }
  if (cb.onFlagToggled) {
    legacyUnsubs.push(onGameEvent('flagToggled', (p) => cb.onFlagToggled!(p.row, p.col, p.isFlagged)));
  }
}

// === Field clear payout ===
// All three clear paths (manual last cell, auto-clear, auto-reveal) route here
// so the jackpot is rolled exactly once per clear and the score, phase and
// event payload can never disagree about it.
function awardFieldClear(totalSafeCells: number): void {
  const { actions } = useGameStore.getState();
  const { clearBonus, jackpot } = rollFieldClear(totalSafeCells);
  actions.addScore(clearBonus);
  actions.setPhase('reward_selection');
  actions.setScreen('reward');
  emit('fieldCleared', { clearBonus, totalSafeCells, jackpot });
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
      // Blast suit absorbs damage — heroic save, no health lost.
      actions.removeItem(blastSuitIndex);
      emit('shieldSave', { row, col });
    } else {
      // Take damage
      actions.takeDamage(1);
      if (store.run.combo.current > 0) {
        actions.resetCombo();
      }

      // Check death
      const newHealth = Math.max(0, store.run.health.current - 1);
      if (newHealth <= 0) {
        // How close were we? (safe cells still hidden at the moment of death)
        const safeRemaining = Math.max(0, field.totalSafeCells - store.run.field.revealedCount);
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
        emit('gameOver', { safeRemaining, totalSafeCells: field.totalSafeCells });
        return;
      }

      emit('mineHit', { row, col, healthRemaining: newHealth });
    }

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

  emit('cellsRevealed', { cells: revealedCells, grade, points, multiplier, origin: { row, col } });

  // Check field cleared
  const newRevealed = store.run.field.revealedCount + revealedCells.length;
  if (newRevealed >= field.totalSafeCells) {
    awardFieldClear(field.totalSafeCells);
  }
}

// === Auto-clear check ===
// Triggers when no hidden safe cells remain (all safe cells are revealed or flagged).
// Also triggers when all mines are accounted for (flagged + exploded = total mines).
function checkAutoFieldClear(): void {
  const store = useGameStore.getState();
  const { field, phase } = store.run;
  const { actions } = store;

  if (phase !== 'in_progress') return;
  if (field.cells.length === 0) return;

  // Scan the board
  const hiddenSafeCells: { row: number; col: number }[] = [];
  let hiddenMines = 0;

  for (let r = 0; r < field.height; r++) {
    for (let c = 0; c < field.width; c++) {
      const cell = field.cells[r][c];
      if (cell.visibility === 'hidden') {
        if (cell.value === 'mine') {
          hiddenMines++;
        } else {
          hiddenSafeCells.push({ row: r, col: c });
        }
      }
    }
  }

  // No hidden safe cells left → clear the field
  if (hiddenSafeCells.length === 0) {
    // Auto-flag remaining hidden mines
    if (hiddenMines > 0) {
      const newCells = field.cells.map((r) => r.map((c) => ({ ...c })));
      for (let r = 0; r < field.height; r++) {
        for (let c = 0; c < field.width; c++) {
          if (newCells[r][c].value === 'mine' && newCells[r][c].visibility === 'hidden') {
            newCells[r][c] = { ...newCells[r][c], visibility: 'flagged' };
          }
        }
      }
      actions.updateCells(newCells);
    }

    awardFieldClear(field.totalSafeCells);
    return;
  }

  // All mines accounted for (none hidden) → auto-reveal remaining safe cells
  if (hiddenMines === 0 && hiddenSafeCells.length > 0) {
    const newCells = field.cells.map((r) => r.map((c) => ({ ...c })));
    for (const { row, col } of hiddenSafeCells) {
      newCells[row][col] = { ...newCells[row][col], visibility: 'revealed' };
    }
    actions.updateCells(newCells);
    actions.incrementRevealed(hiddenSafeCells.length);

    const { grade, multiplier, points } = calculateScore(hiddenSafeCells.length);
    actions.addScore(points);
    actions.setCombo(hiddenSafeCells.length, multiplier);
    emit('cellsRevealed', { cells: hiddenSafeCells, grade, points, multiplier, origin: null });

    awardFieldClear(field.totalSafeCells);
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
  emit('flagToggled', { row, col, isFlagged: !isFlagged });

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

// === SCANNER ===
export function handleScanner(row: number, col: number): void {
  const store = useGameStore.getState();
  const { field, phase, items } = store.run;
  const { actions } = store;

  if (phase !== 'in_progress') return;
  if (field.cells.length === 0) return;

  const scannerIndex = items.findIndex((i) => i.id === 'scanner' && i.charges > 0);
  if (scannerIndex === -1) return;

  const range = getScannerRange(items);
  const radius = Math.floor(range / 2);

  const newCells = field.cells.map((r) => r.map((c) => ({ ...c })));

  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= field.height || nc < 0 || nc >= field.width) continue;
      const cell = newCells[nr][nc];
      if (cell.visibility !== 'hidden') continue;
      cell.scanned = cell.value === 'mine' ? 'danger' : 'safe';
    }
  }

  actions.updateCells(newCells);
  actions.updateItemCharges(scannerIndex, items[scannerIndex].charges - 1);
  if (items[scannerIndex].charges - 1 <= 0) {
    actions.removeItem(scannerIndex);
  }
}

// === ALL-IN CLICK ===
export function handleAllInClick(row: number, col: number): void {
  const store = useGameStore.getState();
  const { field, phase, items } = store.run;
  const { actions } = store;

  if (phase !== 'in_progress') return;
  if (field.cells.length === 0) return;

  const allInIndex = items.findIndex((i) => i.id === 'all-in-click' && i.charges > 0);
  if (allInIndex === -1) return;

  const radius = 2; // 5x5

  // Reveal everything in the area, mines included
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= field.height || nc < 0 || nc >= field.width) continue;
      const cell = field.cells[nr][nc];
      if (cell.visibility === 'hidden') {
        handleReveal(nr, nc);
      }
    }
  }

  actions.removeItem(allInIndex);
}
