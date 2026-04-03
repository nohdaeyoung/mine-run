// === Ghibli-style Ambient BGM using Web Audio API ===
// Pentatonic scale soft piano-like tones with gentle randomization

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let intervalId: ReturnType<typeof setTimeout> | null = null;

// C major pentatonic across 2 octaves
const NOTES = [
  261.63, 293.66, 329.63, 392.00, 440.00,  // C4, D4, E4, G4, A4
  523.25, 587.33, 659.25, 783.99, 880.00,  // C5, D5, E5, G5, A5
];

// Simple melody patterns (index into NOTES)
const PATTERNS = [
  [0, 2, 4, 2],
  [1, 3, 5, 3],
  [4, 6, 8, 6],
  [2, 4, 7, 5],
  [0, 4, 5, 2],
  [3, 5, 7, 4],
  [5, 7, 9, 7],
  [0, 2, 5, 4],
];

function playNote(freq: number, time: number, duration: number) {
  if (!ctx || !masterGain) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Soft tone: sine + gentle low-pass
  osc.type = 'sine';
  osc.frequency.value = freq;

  filter.type = 'lowpass';
  filter.frequency.value = 2000;
  filter.Q.value = 0.5;

  // Piano-like envelope: soft attack, gentle decay
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.15, time + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.06, time + duration * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  osc.start(time);
  osc.stop(time + duration);
}

function playChord(notes: number[], time: number, duration: number) {
  if (!ctx || !masterGain) return;

  notes.forEach((freq) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.04, time + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(masterGain!);

    osc.start(time);
    osc.stop(time + duration);
  });
}

function schedulePhrase() {
  if (!ctx || !isPlaying) return;

  const now = ctx.currentTime;
  const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  const tempo = 0.6 + Math.random() * 0.3; // seconds per note

  // Background pad chord
  const root = Math.floor(Math.random() * 5);
  playChord(
    [NOTES[root] * 0.5, NOTES[root + 2] * 0.5, NOTES[root + 4] * 0.5],
    now,
    tempo * pattern.length + 1
  );

  // Melody
  pattern.forEach((noteIdx, i) => {
    playNote(NOTES[noteIdx], now + i * tempo, tempo * 1.5);
  });
}

export function startBGM() {
  if (isPlaying) return;

  ctx = new AudioContext();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.4;
  masterGain.connect(ctx.destination);

  isPlaying = true;

  // Play first phrase immediately
  schedulePhrase();

  // Schedule new phrases
  intervalId = setInterval(() => {
    if (isPlaying) schedulePhrase();
  }, 3000 + Math.random() * 2000);
}

export function stopBGM() {
  isPlaying = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (masterGain) {
    masterGain.gain.linearRampToValueAtTime(0, (ctx?.currentTime ?? 0) + 0.5);
  }
  setTimeout(() => {
    ctx?.close();
    ctx = null;
    masterGain = null;
  }, 600);
}

export function setVolume(vol: number) {
  if (masterGain && ctx) {
    masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, vol)), ctx.currentTime + 0.1);
  }
}

export function isBGMPlaying() {
  return isPlaying;
}
