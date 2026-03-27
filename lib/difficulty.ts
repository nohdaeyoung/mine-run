// === Tuning Knobs ===
const DIFFICULTY = {
  BASE_WIDTH: 8,
  BASE_HEIGHT: 8,
  WIDTH_STEP: 1,
  HEIGHT_STEP: 1,
  MAX_SIZE: 20,
  MIN_SIZE: 5,
  BASE_DENSITY: 0.12,
  DENSITY_STEP: 0.01,
  MIN_DENSITY: 0.08,
  MAX_DENSITY: 0.22,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface FieldParams {
  width: number;
  height: number;
  mineCount: number;
}

export function getFieldParams(roomIndex: number): FieldParams {
  const width = clamp(
    DIFFICULTY.BASE_WIDTH + Math.floor(roomIndex * DIFFICULTY.WIDTH_STEP),
    DIFFICULTY.MIN_SIZE,
    DIFFICULTY.MAX_SIZE
  );
  const height = clamp(
    DIFFICULTY.BASE_HEIGHT + Math.floor(roomIndex * DIFFICULTY.HEIGHT_STEP),
    DIFFICULTY.MIN_SIZE,
    DIFFICULTY.MAX_SIZE
  );
  const density = clamp(
    DIFFICULTY.BASE_DENSITY + roomIndex * DIFFICULTY.DENSITY_STEP,
    DIFFICULTY.MIN_DENSITY,
    DIFFICULTY.MAX_DENSITY
  );
  const mineCount = Math.floor(width * height * density);

  return { width, height, mineCount };
}
