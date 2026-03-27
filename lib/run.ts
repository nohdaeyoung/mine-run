import { useGameStore, CONFIG } from './store';
import { getFieldParams } from './difficulty';
import { generateMinefield } from './minefield';

export function startNewRun(): void {
  const { actions } = useGameStore.getState();
  actions.startRun();

  // Generate first field (awaiting first click — done on first reveal)
  setupNextRoom();
}

export function setupNextRoom(): void {
  const store = useGameStore.getState();
  const { roomIndex, seed } = store.run;
  const params = getFieldParams(roomIndex);

  // Set field dimensions but leave cells empty (generated on first click)
  store.actions.setField({
    width: params.width,
    height: params.height,
    mines: params.mineCount,
    cells: [],
    revealedCount: 0,
    totalSafeCells: params.width * params.height - params.mineCount,
  });

  store.actions.setPhase('in_progress');
  store.actions.setScreen('run');
}

export function generateFieldOnFirstClick(row: number, col: number): void {
  const store = useGameStore.getState();
  const { field, seed, roomIndex } = store.run;

  if (field.cells.length > 0) return; // Already generated

  const roomSeed = `${seed}_room${roomIndex}`;
  const cells = generateMinefield(
    field.width,
    field.height,
    field.mines,
    row,
    col,
    roomSeed
  );

  store.actions.setField({
    ...field,
    cells,
  });
}

export function advanceToNextRoom(): void {
  const store = useGameStore.getState();
  const { roomIndex, totalRooms } = store.run;

  if (roomIndex + 1 >= totalRooms) {
    // Victory!
    finishRun(true);
    return;
  }

  store.actions.advanceRoom();
  setupNextRoom();
}

export function finishRun(victory: boolean): void {
  const store = useGameStore.getState();
  const { score, roomIndex } = store.run;

  // Calculate minerals
  let minerals = Math.max(
    CONFIG.MIN_MINERALS,
    Math.floor(score * CONFIG.MINERAL_RATE)
  );
  if (victory) {
    minerals = Math.floor(minerals * CONFIG.VICTORY_BONUS_MULT);
  }

  store.actions.addMinerals(minerals);
  store.actions.updateStats({
    totalRuns: store.meta.stats.totalRuns + 1,
    bestScore: Math.max(store.meta.stats.bestScore, score),
    bestRoom: Math.max(store.meta.stats.bestRoom, roomIndex),
  });

  store.actions.setPhase(victory ? 'victory' : 'game_over');
  store.actions.setScreen(victory ? 'victory' : 'game_over');
}
