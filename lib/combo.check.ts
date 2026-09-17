// Runnable check for the field-clear payout. Run: node lib/combo.check.ts
import assert from 'node:assert/strict';
import { rollFieldClear, JACKPOT_MULTIPLIER } from './combo.ts';

const SAFE = 100; // 100 safe cells → base clear bonus 200
const BASE = 200;

assert.deepEqual(rollFieldClear(SAFE, 0), { clearBonus: BASE * JACKPOT_MULTIPLIER, jackpot: true });
assert.deepEqual(rollFieldClear(SAFE, 0.099), { clearBonus: BASE * JACKPOT_MULTIPLIER, jackpot: true });
// Boundary: a roll of exactly 0.1 pays base, not jackpot.
assert.deepEqual(rollFieldClear(SAFE, 0.1), { clearBonus: BASE, jackpot: false });
assert.deepEqual(rollFieldClear(SAFE, 0.999), { clearBonus: BASE, jackpot: false });

// Long-run rate must sit near 10% with the real RNG.
let hits = 0;
const N = 100_000;
for (let i = 0; i < N; i++) if (rollFieldClear(SAFE).jackpot) hits++;
const rate = hits / N;
assert.ok(rate > 0.09 && rate < 0.11, `jackpot rate off: ${rate}`);

console.log(`combo: jackpot payout ok (rate ${(rate * 100).toFixed(2)}%)`);
