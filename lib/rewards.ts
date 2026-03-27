import type { Item } from './types';
import { createItem, MVP_ITEM_POOL, ITEM_DEFS } from './items';
import { useGameStore } from './store';

export interface RewardOption {
  type: 'item' | 'heal';
  item?: Item;
  healAmount?: number;
  label: string;
  description: string;
  rarity?: string;
}

// === Rarity weights by room progression ===
function getRarityWeights(roomIndex: number): Record<string, number> {
  if (roomIndex <= 2) return { common: 70, rare: 25, legendary: 5 };
  if (roomIndex <= 4) return { common: 55, rare: 35, legendary: 10 };
  return { common: 45, rare: 35, legendary: 20 };
}

function weightedRandom(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (const [key, weight] of Object.entries(weights)) {
    rand -= weight;
    if (rand <= 0) return key;
  }
  return Object.keys(weights)[0];
}

export function generateRewards(): RewardOption[] {
  const store = useGameStore.getState();
  const { items, health } = store.run;
  const roomIndex = store.run.roomIndex;
  const rarityWeights = getRarityWeights(roomIndex);

  const rewards: RewardOption[] = [];
  const usedItemIds = new Set<string>();

  // Exclude already-owned passive items
  const ownedPassiveIds = new Set(
    items.filter((i) => i.type === 'passive').map((i) => i.id)
  );

  const getRandomItem = (): Item | null => {
    const pool = MVP_ITEM_POOL.filter(
      (id) => !usedItemIds.has(id) && !ownedPassiveIds.has(id)
    );
    if (pool.length === 0) return null;

    // Filter by rarity
    const targetRarity = weightedRandom(rarityWeights);
    const rarityPool = pool.filter((id) => ITEM_DEFS[id].rarity === targetRarity);
    const finalPool = rarityPool.length > 0 ? rarityPool : pool;

    const id = finalPool[Math.floor(Math.random() * finalPool.length)];
    usedItemIds.add(id);
    return createItem(id);
  };

  // Slot 1: New item
  const item1 = getRandomItem();
  if (item1) {
    rewards.push({
      type: 'item',
      item: item1,
      label: item1.name,
      description: item1.description,
      rarity: item1.rarity,
    });
  }

  // Slot 2: New item or charges refill
  const item2 = getRandomItem();
  if (item2) {
    rewards.push({
      type: 'item',
      item: item2,
      label: item2.name,
      description: item2.description,
      rarity: item2.rarity,
    });
  }

  // Slot 3: Heal (if damaged) or item
  if (health.current < health.max) {
    rewards.push({
      type: 'heal',
      healAmount: 1,
      label: 'Heal +1',
      description: `체력을 1 회복합니다 (${health.current}/${health.max})`,
      rarity: 'common',
    });
  } else {
    const item3 = getRandomItem();
    if (item3) {
      rewards.push({
        type: 'item',
        item: item3,
        label: item3.name,
        description: item3.description,
        rarity: item3.rarity,
      });
    }
  }

  // Ensure at least 1 reward
  if (rewards.length === 0) {
    rewards.push({
      type: 'heal',
      healAmount: 1,
      label: 'Score Bonus',
      description: '보너스 점수 100점',
    });
  }

  return rewards;
}

export function applyReward(reward: RewardOption): void {
  const { actions, run } = useGameStore.getState();

  if (reward.type === 'heal') {
    actions.heal(reward.healAmount ?? 1);
  } else if (reward.type === 'item' && reward.item) {
    if (run.items.length < 3) {
      actions.addItem(reward.item);
    }
    // If slots full, replacement is handled by UI
  }
}
