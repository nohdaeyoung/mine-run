'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import { CHAR_COLORS, assembleSprite, MOOD_ANIMATIONS, MOOD_MESSAGES, type CharMood } from '@/lib/character';
import type { ComboGrade } from '@/lib/types';
import { setEventCallbacks } from '@/lib/tile-interaction';

// === Mood derivation hook ===
export function useCharacterMood(): { mood: CharMood; message: string | null } {
  const phase = useGameStore((s) => s.run.phase);
  const health = useGameStore((s) => s.run.health);
  const combo = useGameStore((s) => s.run.combo);
  const [tempMood, setTempMood] = useState<CharMood | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const prevHealth = useRef(health.current);
  const prevCombo = useRef(combo.current);

  const triggerTemp = useCallback((mood: CharMood, msg: string | null, duration: number) => {
    setTempMood(mood);
    setMessage(msg);
    const timer = setTimeout(() => {
      setTempMood(null);
      setMessage(null);
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  // React to combo events
  const handleCellsRevealed = useCallback(
    (_cells: { row: number; col: number }[], grade: ComboGrade, _points: number, _multiplier: number) => {
      if (grade === 'NICE') triggerTemp('happy', MOOD_MESSAGES.nice!, 1500);
      else if (grade === 'GREAT') triggerTemp('happy', MOOD_MESSAGES.great!, 1800);
      else if (grade === 'AMAZING') triggerTemp('excited', MOOD_MESSAGES.amazing!, 2000);
      else if (grade === 'FEARLESS') triggerTemp('excited', MOOD_MESSAGES.fearless!, 2500);
    },
    [triggerTemp]
  );

  useEffect(() => {
    setEventCallbacks({ onCellsRevealed: handleCellsRevealed });
  }, [handleCellsRevealed]);

  // React to health decrease
  useEffect(() => {
    if (health.current < prevHealth.current) {
      triggerTemp('shocked', MOOD_MESSAGES.mineHit!, 1200);
    }
    prevHealth.current = health.current;
  }, [health.current, triggerTemp]);

  // React to combo increase for game start
  useEffect(() => {
    if (phase === 'in_progress' && prevCombo.current === 0 && combo.current === 0) {
      triggerTemp('happy', MOOD_MESSAGES.gameStart!, 2000);
    }
  }, [phase, triggerTemp]);

  // Derived mood
  let derivedMood: CharMood = 'idle';
  if (phase === 'game_over') derivedMood = 'sad';
  else if (phase === 'victory') derivedMood = 'celebrating';
  else if (phase === 'reward_selection') derivedMood = 'happy';
  else if (phase === 'in_progress' && health.current <= 1 && health.current < health.max) derivedMood = 'worried';
  else if (phase === 'in_progress') derivedMood = 'idle';

  const finalMood = tempMood ?? derivedMood;

  // Derived messages for persistent states
  let finalMessage = message;
  if (!tempMood) {
    if (phase === 'game_over') finalMessage = MOOD_MESSAGES.gameOver!;
    else if (phase === 'victory') finalMessage = MOOD_MESSAGES.victory!;
    else if (phase === 'in_progress' && health.current <= 1 && health.current < health.max) finalMessage = MOOD_MESSAGES.lowHealth!;
    else finalMessage = null;
  }

  return { mood: finalMood, message: finalMessage };
}

// === Pixel Character Canvas ===
interface PixelCharacterProps {
  mood: CharMood;
  size?: number;
  className?: string;
  message?: string | null;
}

export default function PixelCharacter({ mood, size = 4, className = '', message }: PixelCharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 8, h = 12;
    canvas.width = w * size;
    canvas.height = h * size;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sprite = assembleSprite(mood);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = sprite[y][x];
        if (idx === 0) continue;
        ctx.fillStyle = CHAR_COLORS[idx];
        ctx.fillRect(x * size, y * size, size, size);
      }
    }
  }, [mood, size]);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Speech bubble */}
      {message && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white border-2 border-[#1a1025] text-[#1a1025] font-pixel text-[10px] whitespace-nowrap z-10 animate-[bubble-in_0.2s_ease-out_forwards]"
          style={{ imageRendering: 'pixelated' }}
        >
          {message}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1a1025]" />
        </div>
      )}
      {/* Character sprite */}
      <canvas
        ref={canvasRef}
        className={MOOD_ANIMATIONS[mood]}
        style={{
          imageRendering: 'pixelated',
          width: 8 * size,
          height: 12 * size,
        }}
      />
    </div>
  );
}
