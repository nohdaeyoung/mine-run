// === Cell State ===
export type CellValue = 'mine' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type CellVisibility = 'hidden' | 'revealed' | 'flagged' | 'exploded';

export interface Cell {
  value: CellValue;
  visibility: CellVisibility;
  scanned?: 'safe' | 'danger'; // Scanner item overlay
}

// === Item ===
export type ItemRarity = 'common' | 'rare' | 'legendary';
export type ItemType = 'active' | 'passive';

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  type: ItemType;
  charges: number;
  maxCharges: number;
  synergies: string[];
}

// === Combo Grade ===
export type ComboGrade = 'TAP' | 'NICE' | 'GREAT' | 'AMAZING' | 'FEARLESS';

// === Game Events ===
export interface CellsRevealedEvent {
  cells: { row: number; col: number }[];
  count: number;
}

export interface ScoreGainedEvent {
  points: number;
  multiplier: number;
  grade: ComboGrade;
}

// === Intent ===
export type Intent =
  | { type: 'REVEAL'; row: number; col: number }
  | { type: 'FLAG'; row: number; col: number }
  | { type: 'CHORD'; row: number; col: number }
  | { type: 'USE_ITEM'; slotIndex: number };

// === Run Phase ===
export type RunPhase = 'not_started' | 'in_progress' | 'reward_selection' | 'game_over' | 'victory';

// === Screen ===
export type Screen = 'title' | 'run' | 'reward' | 'game_over' | 'victory' | 'meta_shop' | 'settings';
