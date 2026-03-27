import type { Item } from './types';

// === Item Definitions ===
export const ITEM_DEFS: Record<string, Omit<Item, 'charges'> & { charges: number }> = {
  scanner: {
    id: 'scanner',
    name: 'Scanner',
    description: '3×3 영역의 지뢰 유무를 스캔합니다',
    rarity: 'common',
    type: 'active',
    charges: 3,
    maxCharges: 3,
    synergies: ['all-in-click'],
  },
  'blast-suit': {
    id: 'blast-suit',
    name: 'Blast Suit',
    description: '지뢰를 1회 막아줍니다',
    rarity: 'rare',
    type: 'passive',
    charges: 1,
    maxCharges: 1,
    synergies: [],
  },
  'all-in-click': {
    id: 'all-in-click',
    name: 'All-In Click',
    description: '5×5 영역을 전부 엽니다 (지뢰 포함!)',
    rarity: 'legendary',
    type: 'active',
    charges: 1,
    maxCharges: 1,
    synergies: ['scanner'],
  },
};

export function createItem(id: string): Item {
  const def = ITEM_DEFS[id];
  if (!def) throw new Error(`Unknown item: ${id}`);
  return { ...def };
}

export function hasSynergy(item: Item, items: Item[]): boolean {
  return item.synergies.some((sid) => items.some((i) => i.id === sid));
}

export function getScannerRange(items: Item[]): number {
  const scanner = items.find((i) => i.id === 'scanner');
  if (!scanner) return 3;
  return hasSynergy(scanner, items) ? 5 : 3;
}

export function getAllInRange(items: Item[]): number {
  return 5; // Fixed for MVP
}

export const MVP_ITEM_POOL = ['scanner', 'blast-suit', 'all-in-click'];
