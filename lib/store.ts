import { create } from 'zustand';
import type { Cell, Item, RunPhase, Screen } from './types';

// === Tuning Knobs ===
export const CONFIG = {
  BASE_HEALTH: 3,
  BASE_ROOMS: 5,
  BASE_ITEM_SLOTS: 3,
  COMBO_RESET_ON_DAMAGE: true,
  TRANSITION_DURATION_MS: 300,
  MINERAL_RATE: 0.1,
  VICTORY_BONUS_MULT: 2.0,
  MIN_MINERALS: 1,
} as const;

// === Store Interface ===
interface RunState {
  phase: RunPhase;
  roomIndex: number;
  totalRooms: number;
  score: number;
  combo: {
    current: number;
    multiplier: number;
    best: number;
  };
  health: {
    current: number;
    max: number;
  };
  items: Item[];
  field: {
    width: number;
    height: number;
    mines: number;
    cells: Cell[][];
    revealedCount: number;
    totalSafeCells: number;
  };
  feverMode: boolean;
  seed: string;
}

interface MetaState {
  minerals: number;
  upgrades: Record<string, number>;
  unlockedItems: string[];
  stats: {
    totalRuns: number;
    bestScore: number;
    bestRoom: number;
    totalRevealed: number;
  };
}

interface FlowState {
  screen: Screen;
  previousScreen: Screen;
  isTransitioning: boolean;
}

interface GameActions {
  // Run actions
  startRun: () => void;
  setField: (field: RunState['field']) => void;
  updateCells: (cells: Cell[][]) => void;
  incrementRevealed: (count: number) => void;
  setPhase: (phase: RunPhase) => void;
  addScore: (points: number) => void;
  setCombo: (current: number, multiplier: number) => void;
  resetCombo: () => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  addItem: (item: Item) => void;
  removeItem: (index: number) => void;
  updateItemCharges: (index: number, charges: number) => void;
  advanceRoom: () => void;

  // Meta actions
  addMinerals: (amount: number) => void;
  updateStats: (stats: Partial<MetaState['stats']>) => void;

  // Flow actions
  setScreen: (screen: Screen) => void;
  setTransitioning: (value: boolean) => void;
}

export interface GameStore {
  run: RunState;
  meta: MetaState;
  flow: FlowState;
  actions: GameActions;
}

const initialRun: RunState = {
  phase: 'not_started',
  roomIndex: 0,
  totalRooms: CONFIG.BASE_ROOMS,
  score: 0,
  combo: { current: 0, multiplier: 1, best: 0 },
  health: { current: CONFIG.BASE_HEALTH, max: CONFIG.BASE_HEALTH },
  items: [],
  field: {
    width: 0,
    height: 0,
    mines: 0,
    cells: [],
    revealedCount: 0,
    totalSafeCells: 0,
  },
  feverMode: false,
  seed: '',
};

const initialMeta: MetaState = {
  minerals: 0,
  upgrades: {},
  unlockedItems: [],
  stats: {
    totalRuns: 0,
    bestScore: 0,
    bestRoom: 0,
    totalRevealed: 0,
  },
};

const initialFlow: FlowState = {
  screen: 'title',
  previousScreen: 'title',
  isTransitioning: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  run: { ...initialRun },
  meta: { ...initialMeta },
  flow: { ...initialFlow },

  actions: {
    startRun: () => {
      const { meta } = get();
      const healthBonus = meta.upgrades['health_bonus'] ?? 0;
      const roomBonus = meta.upgrades['room_bonus'] ?? 0;

      set({
        run: {
          ...initialRun,
          health: {
            current: CONFIG.BASE_HEALTH + healthBonus,
            max: CONFIG.BASE_HEALTH + healthBonus,
          },
          totalRooms: CONFIG.BASE_ROOMS + roomBonus,
          seed: Math.random().toString(36).slice(2),
        },
        flow: { screen: 'run', previousScreen: 'title', isTransitioning: false },
      });
    },

    setField: (field) =>
      set((s) => ({ run: { ...s.run, field } })),

    updateCells: (cells) =>
      set((s) => ({ run: { ...s.run, field: { ...s.run.field, cells } } })),

    incrementRevealed: (count) =>
      set((s) => ({
        run: {
          ...s.run,
          field: {
            ...s.run.field,
            revealedCount: s.run.field.revealedCount + count,
          },
        },
      })),

    setPhase: (phase) =>
      set((s) => ({ run: { ...s.run, phase } })),

    addScore: (points) =>
      set((s) => ({ run: { ...s.run, score: s.run.score + points } })),

    setCombo: (current, multiplier) =>
      set((s) => ({
        run: {
          ...s.run,
          combo: {
            current,
            multiplier,
            best: Math.max(s.run.combo.best, current),
          },
        },
      })),

    resetCombo: () =>
      set((s) => ({
        run: {
          ...s.run,
          combo: { ...s.run.combo, current: 0, multiplier: 1 },
        },
      })),

    takeDamage: (amount) =>
      set((s) => ({
        run: {
          ...s.run,
          health: {
            ...s.run.health,
            current: Math.max(0, s.run.health.current - amount),
          },
        },
      })),

    heal: (amount) =>
      set((s) => ({
        run: {
          ...s.run,
          health: {
            ...s.run.health,
            current: Math.min(s.run.health.max, s.run.health.current + amount),
          },
        },
      })),

    addItem: (item) =>
      set((s) => ({
        run: { ...s.run, items: [...s.run.items, item] },
      })),

    removeItem: (index) =>
      set((s) => ({
        run: {
          ...s.run,
          items: s.run.items.filter((_, i) => i !== index),
        },
      })),

    updateItemCharges: (index, charges) =>
      set((s) => ({
        run: {
          ...s.run,
          items: s.run.items.map((item, i) =>
            i === index ? { ...item, charges } : item
          ),
        },
      })),

    advanceRoom: () =>
      set((s) => ({
        run: { ...s.run, roomIndex: s.run.roomIndex + 1 },
      })),

    addMinerals: (amount) =>
      set((s) => ({
        meta: { ...s.meta, minerals: s.meta.minerals + amount },
      })),

    updateStats: (stats) =>
      set((s) => ({
        meta: {
          ...s.meta,
          stats: { ...s.meta.stats, ...stats },
        },
      })),

    setScreen: (screen) =>
      set((s) => ({
        flow: { ...s.flow, screen, previousScreen: s.flow.screen },
      })),

    setTransitioning: (value) =>
      set((s) => ({
        flow: { ...s.flow, isTransitioning: value },
      })),
  },
}));
