// === Ghibli Forest Spirit Character ===
// A small, round forest spirit (Kodama-inspired) with expressive eyes

export type GhibliMood = 'idle' | 'happy' | 'excited' | 'worried' | 'shocked' | 'sad' | 'celebrating';

export const GHIBLI_COLORS: Record<number, string> = {
  0:  'transparent',
  1:  '#f5f0e8',  // Body cream
  2:  '#e8dfd0',  // Body shadow
  3:  '#2a3a28',  // Eyes dark
  4:  '#ffffff',  // Eye highlight
  5:  '#7cb668',  // Leaf green
  6:  '#5b8a4e',  // Leaf dark
  7:  '#ffb7b7',  // Blush pink
  8:  '#d4886b',  // Mouth/smile
  9:  '#a8d5a0',  // Light green accent
  10: '#87ceeb',  // Tear/sweat blue
  11: '#ffd700',  // Sparkle gold
  12: '#c4a882',  // Ear/horn beige
};

// 10 wide x 12 tall spirit
const HEAD_TOP: number[][] = [
  [0, 0, 0, 5, 6, 5, 0, 0, 0, 0],  // leaf
  [0, 0, 5, 6, 5, 6, 5, 0, 0, 0],  // leaf
  [0, 0, 0, 0, 6, 0, 0, 0, 0, 0],  // stem
  [0, 0,12, 1, 1, 1, 1,12, 0, 0],  // ears + head top
];

const BODY_BOTTOM: number[][] = [
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],  // body
  [0, 0, 2, 1, 1, 1, 1, 2, 0, 0],  // body shadow
  [0, 0, 0, 2, 1, 1, 2, 0, 0, 0],  // body bottom
  [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],  // feet
];

const BODY_CELEBRATING: number[][] = [
  [0, 9, 1, 1, 1, 1, 1, 1, 9, 0],  // arms out (green paws)
  [0, 0, 2, 1, 1, 1, 1, 2, 0, 0],
  [0, 0, 0, 2, 1, 1, 2, 0, 0, 0],
  [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
];

// Face rows (rows 4-7) - 4 rows that change per mood
export const GHIBLI_FACES: Record<GhibliMood, number[][]> = {
  idle: [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // face top
    [0, 1, 3, 4, 1, 1, 3, 4, 1, 0],  // eyes (dot + highlight)
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // cheeks
    [0, 1, 1, 1, 8, 8, 1, 1, 1, 0],  // small smile
  ],
  happy: [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 3, 3, 1, 1, 3, 3, 1, 0],  // closed happy eyes (uu)
    [0, 1, 1, 7, 1, 1, 7, 1, 1, 0],  // blush
    [0, 1, 8, 8, 8, 8, 8, 8, 1, 0],  // wide smile
  ],
  excited: [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1,11, 3, 1, 1,11, 3, 1, 0],  // sparkle eyes
    [0, 1, 1, 7, 1, 1, 7, 1, 1, 0],  // blush
    [0, 1, 8, 8, 8, 8, 8, 8, 1, 0],  // wide smile
  ],
  worried: [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 3, 4, 1, 1, 3, 4,10, 0],  // eyes + sweat
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 8, 1, 1, 1, 0],  // tiny frown
  ],
  shocked: [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 4, 3, 1, 1, 4, 3, 1, 0],  // wide eyes (reversed: white then dark)
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 8, 8, 1, 1, 1, 0],  // O mouth
  ],
  sad: [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 3, 4, 1, 1, 3, 4, 1, 0],  // normal eyes
    [0,10, 1, 1, 1, 1, 1, 1,10, 0],  // tears
    [0, 1, 1, 1, 1, 8, 1, 1, 1, 0],  // frown
  ],
  celebrating: [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1,11, 3, 1, 1,11, 3, 1, 0],  // sparkle eyes
    [0, 1, 1, 7, 1, 1, 7, 1, 1, 0],  // blush
    [0, 1, 8, 8, 8, 8, 8, 8, 1, 0],  // huge smile
  ],
};

export function assembleGhibliSprite(mood: GhibliMood): number[][] {
  const face = GHIBLI_FACES[mood];
  const body = mood === 'celebrating' ? BODY_CELEBRATING : BODY_BOTTOM;
  return [...HEAD_TOP, ...face, ...body];
}

// Mood messages in softer, warmer tone
export const GHIBLI_MESSAGES: Record<string, string> = {
  gameStart: 'Let\'s explore~',
  nice: 'Oh, nice~',
  great: 'Wonderful!',
  amazing: 'Amazing!!',
  fearless: 'Incredible!!!',
  mineHit: 'Ouch...',
  lowHealth: 'Be careful...',
  roomClear: 'Onward~',
  gameOver: 'It\'s okay...',
  victory: 'We made it!',
};

// Gentle animations for Ghibli mood
export const GHIBLI_ANIMATIONS: Record<GhibliMood, string> = {
  idle:        'animate-[ghibli-float_4s_ease-in-out_infinite]',
  happy:       'animate-[ghibli-sway_2s_ease-in-out_infinite]',
  excited:     'animate-[ghibli-bounce_0.8s_ease-in-out_infinite]',
  worried:     'animate-[ghibli-tremble_0.6s_ease-in-out_infinite]',
  shocked:     'animate-[ghibli-jump_0.8s_ease-out_1]',
  sad:         'animate-[ghibli-droop_3s_ease-in-out_infinite]',
  celebrating: 'animate-[ghibli-dance_1s_ease-in-out_infinite]',
};
