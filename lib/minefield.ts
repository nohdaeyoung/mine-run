import type { Cell, CellValue } from './types';

// === Tuning Knobs ===
const MINEFIELD = {
  MIN_OPEN_AREA: 8,
  MAX_RETRIES: 50,
  FIRST_CLICK_SAFE_RADIUS: 1, // 1 = 3x3
} as const;

// === Seeded PRNG (Mulberry32) ===
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash;
}

// === Helpers ===
function getNeighbors(row: number, col: number, width: number, height: number): [number, number][] {
  const neighbors: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
}

function isInSafeZone(
  row: number,
  col: number,
  clickRow: number,
  clickCol: number,
  radius: number
): boolean {
  return (
    Math.abs(row - clickRow) <= radius &&
    Math.abs(col - clickCol) <= radius
  );
}

// === Flood fill to find connected 0-cell areas ===
function findLargestOpenArea(grid: CellValue[][], width: number, height: number): number {
  const visited = Array.from({ length: height }, () => new Array(width).fill(false));
  let largest = 0;

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (visited[r][c] || grid[r][c] !== 0) continue;

      // BFS to find connected 0-cells
      let size = 0;
      const queue: [number, number][] = [[r, c]];
      visited[r][c] = true;

      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        size++;
        for (const [nr, nc] of getNeighbors(cr, cc, width, height)) {
          if (!visited[nr][nc] && grid[nr][nc] === 0) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }

      largest = Math.max(largest, size);
    }
  }

  return largest;
}

// === Main Generator ===
export function generateMinefield(
  width: number,
  height: number,
  mineCount: number,
  clickRow: number,
  clickCol: number,
  seed: string
): Cell[][] {
  const rng = mulberry32(hashSeed(seed + `_${clickRow}_${clickCol}`));
  const radius = MINEFIELD.FIRST_CLICK_SAFE_RADIUS;
  const totalCells = width * height;

  // Clamp mine count
  const safeZoneSize = (2 * radius + 1) ** 2; // max 9 for radius 1
  const maxMines = totalCells - safeZoneSize;
  const actualMines = Math.min(mineCount, maxMines);

  let minOpenArea: number = MINEFIELD.MIN_OPEN_AREA;
  let bestGrid: CellValue[][] | null = null;

  for (let attempt = 0; attempt <= MINEFIELD.MAX_RETRIES; attempt++) {
    // Create empty grid
    const grid: CellValue[][] = Array.from({ length: height }, () =>
      new Array<CellValue>(width).fill(0)
    );

    // Place mines randomly, avoiding safe zone
    const availableCells: [number, number][] = [];
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (!isInSafeZone(r, c, clickRow, clickCol, radius)) {
          availableCells.push([r, c]);
        }
      }
    }

    // Fisher-Yates shuffle using seeded RNG
    for (let i = availableCells.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [availableCells[i], availableCells[j]] = [availableCells[j], availableCells[i]];
    }

    // Place mines
    for (let i = 0; i < actualMines; i++) {
      const [r, c] = availableCells[i];
      grid[r][c] = 'mine';
    }

    // Calculate numbers
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (grid[r][c] === 'mine') continue;
        let count = 0;
        for (const [nr, nc] of getNeighbors(r, c, width, height)) {
          if (grid[nr][nc] === 'mine') count++;
        }
        grid[r][c] = count as CellValue;
      }
    }

    // Check open area constraint
    const largestOpen = findLargestOpenArea(grid, width, height);
    if (largestOpen >= minOpenArea) {
      bestGrid = grid;
      break;
    }

    // Relax constraint after half the retries
    if (attempt === Math.floor(MINEFIELD.MAX_RETRIES / 2)) {
      minOpenArea = Math.floor(minOpenArea / 2);
    }

    bestGrid = grid; // Keep last attempt as fallback
  }

  // Convert to Cell[][] with hidden visibility
  return bestGrid!.map((row) =>
    row.map((value) => ({
      value,
      visibility: 'hidden' as const,
    }))
  );
}

export { getNeighbors };
