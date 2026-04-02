// === Pixel Character Sprite Data ===

export const CHAR_COLORS: Record<number, string> = {
  0:  'transparent',
  1:  '#8b4513',  // Hair Dark
  2:  '#d2691e',  // Hair Light
  3:  '#ffcc99',  // Skin
  4:  '#e8a86a',  // Skin Shadow
  5:  '#2b1810',  // Eye Black
  6:  '#ffffff',  // Eye White
  7:  '#ff8585',  // Blush
  8:  '#d45555',  // Mouth
  9:  '#4a7cbc',  // Jacket Blue
  10: '#365a8a',  // Jacket Dark
  11: '#f0c040',  // Belt Gold
  12: '#6b3a2a',  // Boots Brown
  13: '#a8926b',  // Pants Khaki
  14: '#7ec8e3',  // Sweat Blue
  15: '#ffe066',  // Star Yellow
  16: '#5ba3d9',  // Tear Blue
};

export type CharMood = 'idle' | 'happy' | 'excited' | 'worried' | 'shocked' | 'sad' | 'celebrating';

const HAIR: number[][] = [
  [0, 0, 1, 2, 2, 1, 0, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 1, 1, 2, 2, 1, 1, 0],
];

const BODY: number[][] = [
  [0, 0, 4, 3, 3, 4, 0, 0],
  [0, 9, 9, 9, 9, 9, 9, 0],
  [0,10, 9,11,11, 9,10, 0],
  [0, 0,13,13,13,13, 0, 0],
  [0, 0,12,13,13,12, 0, 0],
  [0, 0,12, 0, 0,12, 0, 0],
];

const BODY_CELEBRATING: number[][] = [
  [0, 0, 4, 3, 3, 4, 0, 0],
  [9, 9, 9, 9, 9, 9, 9, 9],
  [0, 0, 9,11,11, 9, 0, 0],
  [0, 0,13,13,13,13, 0, 0],
  [0, 0,12,13,13,12, 0, 0],
  [0, 0,12, 0, 0,12, 0, 0],
];

export const MOOD_FACES: Record<CharMood, number[][]> = {
  idle: [
    [0, 3, 5, 3, 3, 5, 3, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 3, 3, 8, 8, 3, 3, 0],
  ],
  happy: [
    [0, 3, 8, 3, 3, 8, 3, 0],
    [0, 3, 7, 3, 3, 7, 3, 0],
    [0, 3, 8, 8, 8, 8, 3, 0],
  ],
  excited: [
    [0, 3,15, 3, 3,15, 3, 0],
    [0, 3, 7, 3, 3, 7, 3, 0],
    [0, 3, 8, 8, 8, 8, 3, 0],
  ],
  worried: [
    [0, 3, 5, 3, 3, 5,14, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 3, 3, 3, 8, 3, 3, 0],
  ],
  shocked: [
    [0, 3, 6, 5, 5, 6, 3, 0],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 3, 3, 8, 8, 3, 3, 0],
  ],
  sad: [
    [0, 3, 5, 3, 3, 5, 3, 0],
    [0,16, 3, 3, 3, 3,16, 0],
    [0, 3, 3, 3, 8, 3, 3, 0],
  ],
  celebrating: [
    [0, 3,15, 3, 3,15, 3, 0],
    [0, 3, 7, 3, 3, 7, 3, 0],
    [0, 3, 8, 8, 8, 8, 3, 0],
  ],
};

export function assembleSprite(mood: CharMood): number[][] {
  const face = MOOD_FACES[mood];
  const body = mood === 'celebrating' ? BODY_CELEBRATING : BODY;
  return [...HAIR, ...face, ...body];
}

// === Mood Messages ===
export const MOOD_MESSAGES: Partial<Record<string, string>> = {
  gameStart: "Let's go!",
  nice: 'Nice~',
  great: 'Great!',
  amazing: 'WOW!!',
  fearless: 'EPIC!!!',
  mineHit: 'Ouch!',
  lowHealth: '...careful',
  roomClear: 'Onward!',
  gameOver: 'Oh no...',
  victory: 'We did it!',
};

// === Animation classes per mood ===
export const MOOD_ANIMATIONS: Record<CharMood, string> = {
  idle:        'animate-[char-idle_3s_ease-in-out_infinite]',
  happy:       'animate-[char-happy_0.8s_ease-in-out_infinite]',
  excited:     'animate-[char-excited_0.6s_ease-in-out_infinite]',
  worried:     'animate-[char-worried_0.5s_ease-in-out_infinite]',
  shocked:     'animate-[char-shocked_0.7s_ease-out_1]',
  sad:         'animate-[char-sad_2s_ease-in-out_infinite]',
  celebrating: 'animate-[char-celebrating_0.5s_ease-in-out_infinite]',
};
