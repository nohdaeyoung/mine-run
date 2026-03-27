import type { ComboGrade } from './types';

// === Tuning Knobs ===
const GRADES = {
  FEARLESS_MIN: 30,
  AMAZING_MIN: 15,
  GREAT_MIN: 5,
  NICE_MIN: 2,
} as const;

const MULTIPLIERS: Record<ComboGrade, number> = {
  FEARLESS: 20,
  AMAZING: 8,
  GREAT: 3,
  NICE: 1.5,
  TAP: 1,
};

const CLEAR_MULTIPLIER = 2;

export function getComboGrade(cellsRevealed: number): ComboGrade {
  if (cellsRevealed >= GRADES.FEARLESS_MIN) return 'FEARLESS';
  if (cellsRevealed >= GRADES.AMAZING_MIN) return 'AMAZING';
  if (cellsRevealed >= GRADES.GREAT_MIN) return 'GREAT';
  if (cellsRevealed >= GRADES.NICE_MIN) return 'NICE';
  return 'TAP';
}

export function getMultiplier(grade: ComboGrade): number {
  return MULTIPLIERS[grade];
}

export function calculateScore(cellsRevealed: number): {
  grade: ComboGrade;
  multiplier: number;
  points: number;
} {
  const grade = getComboGrade(cellsRevealed);
  const multiplier = getMultiplier(grade);
  const points = Math.floor(cellsRevealed * multiplier);
  return { grade, multiplier, points };
}

export function calculateClearBonus(totalSafeCells: number): number {
  return totalSafeCells * CLEAR_MULTIPLIER;
}
