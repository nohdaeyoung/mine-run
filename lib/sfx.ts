// === Mine Run SFX — zero-asset Web Audio synthesis ===
// Every sound is generated at runtime (oscillators + noise buffers).
// No audio files shipped. Paired with optional haptics (navigator.vibrate).

import type { ComboGrade } from './types';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let hapticsOn = true;

const SFX_MUTE_KEY = 'mine-run-sfx-muted';
const HAPTIC_KEY = 'mine-run-haptics';

// C minor pentatonic, two octaves — used for the combo pitch ladder & cascades.
const PENTA = [
  261.63, 311.13, 349.23, 392.0, 466.16, // C4 Eb4 F4 G4 Bb4
  523.25, 622.25, 698.46, 783.99, 932.33, // C5 Eb5 F5 G5 Bb5
  1046.5, 1244.5, 1396.9, 1568.0, 1864.7, // C6 Eb6 F6 G6 Bb6
];

function ensureCtx(): boolean {
  if (typeof window === 'undefined') return false;
  if (muted) return false;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    } catch {
      return false;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return true;
}

// Call on first user gesture so mobile/Safari unlocks audio.
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  if (typeof localStorage !== 'undefined') {
    muted = localStorage.getItem(SFX_MUTE_KEY) === '1';
    hapticsOn = localStorage.getItem(HAPTIC_KEY) !== '0';
  }
  ensureCtx();
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): boolean {
  muted = !muted;
  if (typeof localStorage !== 'undefined') localStorage.setItem(SFX_MUTE_KEY, muted ? '1' : '0');
  if (muted && master && ctx) master.gain.setValueAtTime(0.0001, ctx.currentTime);
  if (!muted) { ensureCtx(); if (master && ctx) master.gain.setValueAtTime(0.5, ctx.currentTime); }
  return muted;
}

// === Primitives ===
interface ToneOpts {
  type?: OscillatorType;
  dur?: number;
  attack?: number;
  gain?: number;
  glideTo?: number;     // frequency to ramp toward over the note
  delay?: number;       // seconds from now
  filterFreq?: number;  // lowpass cutoff
  detune?: number;
}

function tone(freq: number, opts: ToneOpts = {}): void {
  if (!ensureCtx() || !ctx || !master) return;
  const {
    type = 'sine', dur = 0.18, attack = 0.005, gain = 0.25,
    glideTo, delay = 0, filterFreq, detune = 0,
  } = opts;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (detune) osc.detune.setValueAtTime(detune, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t + dur);

  let node: AudioNode = osc;
  if (filterFreq) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, t);
    osc.connect(filter);
    node = filter;
  }

  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  node.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

interface NoiseOpts {
  dur?: number;
  gain?: number;
  delay?: number;
  type?: BiquadFilterType;
  filterFreq?: number;
  sweepTo?: number;  // sweep filter cutoff to this value
  q?: number;
}

function noise(opts: NoiseOpts = {}): void {
  if (!ensureCtx() || !ctx || !master) return;
  const { dur = 0.2, gain = 0.3, delay = 0, type = 'lowpass', filterFreq = 1200, sweepTo, q = 1 } = opts;
  const t = ctx.currentTime + delay;
  const frames = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(filterFreq, t);
  filter.Q.value = q;
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(Math.max(20, sweepTo), t + dur);

  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(filter);
  filter.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

function buzz(pattern: number | number[]): void {
  if (!hapticsOn || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch { /* unsupported */ }
}

// === Game SFX ===

// Single safe cell — soft wooden pluck. Pitch lifts slightly with reveal size.
export function sfxSafeReveal(count: number): void {
  const idx = Math.min(PENTA.length - 1, Math.floor(Math.log2(count + 1) * 1.5));
  tone(PENTA[idx], { type: 'triangle', dur: 0.12, gain: 0.16, filterFreq: 2600 });
  buzz(8);
}

// Flood fill — ascending pentatonic glissando, length scales with cells opened.
export function sfxFloodCascade(count: number): void {
  const steps = Math.min(12, Math.max(3, Math.floor(count / 2)));
  const stepDur = Math.min(0.045, 0.4 / steps);
  for (let i = 0; i < steps; i++) {
    const idx = Math.min(PENTA.length - 1, 2 + i);
    tone(PENTA[idx], {
      type: 'triangle',
      dur: 0.1,
      gain: 0.12,
      delay: i * stepDur,
      filterFreq: 3000,
    });
  }
  buzz(Math.min(40, count * 2));
}

// Combo grade ceremony — the higher the grade, the bigger the chord + pitch ladder.
const GRADE_TIER: Record<ComboGrade, number> = { TAP: 0, NICE: 1, GREAT: 2, AMAZING: 3, FEARLESS: 4 };

export function sfxCombo(grade: ComboGrade, comboLevel: number): void {
  const tier = GRADE_TIER[grade];
  if (tier === 0) return;
  // Pitch ladder: each accumulated combo nudges the root up the pentatonic scale.
  const base = Math.min(PENTA.length - 4, tier + Math.floor(comboLevel / 4));
  const chordSize = 1 + tier; // bigger grades = fuller chord
  for (let i = 0; i < chordSize; i++) {
    const idx = Math.min(PENTA.length - 1, base + i * 2);
    tone(PENTA[idx], {
      type: i === 0 ? 'sawtooth' : 'triangle',
      dur: 0.22 + tier * 0.06,
      gain: 0.13,
      delay: i * 0.04,
      filterFreq: 3200,
    });
  }
  // Sparkle on the big ones.
  if (tier >= 3) {
    tone(PENTA[PENTA.length - 1], { type: 'sine', dur: 0.5, gain: 0.08, delay: 0.05 });
    tone(PENTA[PENTA.length - 2], { type: 'sine', dur: 0.5, gain: 0.08, delay: 0.12 });
  }
  buzz(tier >= 3 ? [0, 30, 40, 30] : 18);
}

// Hit a mine and survived — painful noise boom + downward stinger.
export function sfxMineHit(): void {
  noise({ dur: 0.35, gain: 0.5, type: 'lowpass', filterFreq: 1400, sweepTo: 120, q: 2 });
  tone(180, { type: 'sawtooth', dur: 0.4, gain: 0.3, glideTo: 45, filterFreq: 900 });
  tone(90, { type: 'square', dur: 0.5, gain: 0.18, glideTo: 30 });
  buzz([0, 60, 30, 90]);
}

// Blast suit absorbed the hit — metallic shield clang (heroic save).
export function sfxShieldSave(): void {
  noise({ dur: 0.18, gain: 0.25, type: 'bandpass', filterFreq: 3200, q: 6 });
  tone(880, { type: 'square', dur: 0.25, gain: 0.18, glideTo: 1320, filterFreq: 4000 });
  tone(1320, { type: 'sine', dur: 0.4, gain: 0.12, delay: 0.04 });
  buzz([0, 25, 20, 25]);
}

// Flag stamp — short percussive tick.
export function sfxFlag(): void {
  tone(660, { type: 'square', dur: 0.05, gain: 0.12, filterFreq: 2400 });
  noise({ dur: 0.04, gain: 0.1, filterFreq: 1800 });
  buzz(6);
}

// Field cleared — triumphant ascending arpeggio + chime tail.
export function sfxClear(): void {
  const arp = [0, 2, 4, 5, 7, 9];
  arp.forEach((step, i) => {
    tone(PENTA[step], { type: 'triangle', dur: 0.3, gain: 0.16, delay: i * 0.07, filterFreq: 3400 });
  });
  tone(PENTA[9], { type: 'sine', dur: 0.9, gain: 0.1, delay: arp.length * 0.07 });
  tone(PENTA[12], { type: 'sine', dur: 0.9, gain: 0.08, delay: arp.length * 0.07 + 0.06 });
  buzz([0, 20, 30, 20, 30, 40]);
}

// Rare jackpot — over-the-top bell cascade.
export function sfxJackpot(): void {
  const bells = [4, 7, 9, 11, 12, 14];
  bells.forEach((step, i) => {
    tone(PENTA[step], { type: 'sine', dur: 0.7, gain: 0.14, delay: i * 0.06 });
    tone(PENTA[step] * 2, { type: 'sine', dur: 0.5, gain: 0.05, delay: i * 0.06 });
  });
  noise({ dur: 0.5, gain: 0.08, type: 'highpass', filterFreq: 6000, delay: 0.1 });
  buzz([0, 40, 30, 40, 30, 60]);
}

// New personal record — short fanfare.
export function sfxNewRecord(): void {
  const fanfare = [4, 4, 7, 9];
  fanfare.forEach((step, i) => {
    tone(PENTA[step], { type: 'sawtooth', dur: 0.25, gain: 0.13, delay: i * 0.12, filterFreq: 3000 });
    tone(PENTA[step + 2], { type: 'triangle', dur: 0.25, gain: 0.08, delay: i * 0.12 });
  });
  tone(PENTA[11], { type: 'triangle', dur: 0.8, gain: 0.14, delay: fanfare.length * 0.12 });
  buzz([0, 50, 40, 50, 40, 80]);
}

// Game over — descending stinger with a low-pass collapse.
export function sfxGameOver(): void {
  tone(330, { type: 'sawtooth', dur: 1.1, gain: 0.22, glideTo: 70, filterFreq: 1400 });
  tone(247, { type: 'square', dur: 1.1, gain: 0.12, glideTo: 55 });
  noise({ dur: 1.0, gain: 0.18, type: 'lowpass', filterFreq: 1200, sweepTo: 90 });
  buzz([0, 120, 60, 200]);
}

// Each mine detonation during the death reveal — staggered thuds.
export function sfxMineBlip(delay: number): void {
  tone(140, { type: 'square', dur: 0.12, gain: 0.12, glideTo: 50, delay });
  noise({ dur: 0.1, gain: 0.12, filterFreq: 900, delay });
}

// Victory — full run cleared.
export function sfxVictory(): void {
  const melody = [0, 4, 7, 9, 12, 9, 12, 14];
  melody.forEach((step, i) => {
    tone(PENTA[step], { type: 'triangle', dur: 0.35, gain: 0.16, delay: i * 0.13, filterFreq: 3600 });
    tone(PENTA[Math.max(0, step - 4)], { type: 'sine', dur: 0.5, gain: 0.06, delay: i * 0.13 });
  });
  buzz([0, 30, 30, 30, 30, 30, 30, 60]);
}

// Reward picked.
export function sfxReward(): void {
  tone(PENTA[5], { type: 'triangle', dur: 0.18, gain: 0.16, filterFreq: 3200 });
  tone(PENTA[9], { type: 'triangle', dur: 0.3, gain: 0.12, delay: 0.08 });
  buzz(15);
}

// Clutch heartbeat — single low thump (called on a loop by the UI when few cells remain).
export function sfxHeartbeat(): void {
  tone(70, { type: 'sine', dur: 0.16, gain: 0.22, glideTo: 45 });
  buzz(20);
}
