'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import { GHIBLI_COLORS, assembleGhibliSprite, GHIBLI_ANIMATIONS, GHIBLI_MESSAGES, type GhibliMood } from '@/lib/ghibli-character';
import type { ComboGrade } from '@/lib/types';
import { setEventCallbacks } from '@/lib/tile-interaction';

export function useGhibliMood(): { mood: GhibliMood; message: string | null } {
  const phase = useGameStore((s) => s.run.phase);
  const health = useGameStore((s) => s.run.health);
  const [tempMood, setTempMood] = useState<GhibliMood | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const prevHealth = useRef(health.current);

  const triggerTemp = useCallback((mood: GhibliMood, msg: string | null, duration: number) => {
    setTempMood(mood);
    setMessage(msg);
    const timer = setTimeout(() => { setTempMood(null); setMessage(null); }, duration);
    return () => clearTimeout(timer);
  }, []);

  const handleCellsRevealed = useCallback(
    (_cells: { row: number; col: number }[], grade: ComboGrade) => {
      if (grade === 'NICE') triggerTemp('happy', GHIBLI_MESSAGES.nice, 1500);
      else if (grade === 'GREAT') triggerTemp('happy', GHIBLI_MESSAGES.great, 1800);
      else if (grade === 'AMAZING') triggerTemp('excited', GHIBLI_MESSAGES.amazing, 2000);
      else if (grade === 'FEARLESS') triggerTemp('excited', GHIBLI_MESSAGES.fearless, 2500);
    },
    [triggerTemp]
  );

  useEffect(() => {
    setEventCallbacks({ onCellsRevealed: handleCellsRevealed });
  }, [handleCellsRevealed]);

  useEffect(() => {
    if (health.current < prevHealth.current) triggerTemp('shocked', GHIBLI_MESSAGES.mineHit, 1200);
    prevHealth.current = health.current;
  }, [health.current, triggerTemp]);

  useEffect(() => {
    if (phase === 'in_progress') triggerTemp('happy', GHIBLI_MESSAGES.gameStart, 2000);
  }, [phase, triggerTemp]);

  let derivedMood: GhibliMood = 'idle';
  if (phase === 'game_over') derivedMood = 'sad';
  else if (phase === 'victory') derivedMood = 'celebrating';
  else if (phase === 'reward_selection') derivedMood = 'happy';
  else if (phase === 'in_progress' && health.current <= 1 && health.current < health.max) derivedMood = 'worried';

  const finalMood = tempMood ?? derivedMood;

  let finalMessage = message;
  if (!tempMood) {
    if (phase === 'game_over') finalMessage = GHIBLI_MESSAGES.gameOver;
    else if (phase === 'victory') finalMessage = GHIBLI_MESSAGES.victory;
    else if (phase === 'in_progress' && health.current <= 1 && health.current < health.max) finalMessage = GHIBLI_MESSAGES.lowHealth;
    else finalMessage = null;
  }

  return { mood: finalMood, message: finalMessage };
}

interface GhibliCharacterProps {
  mood: GhibliMood;
  size?: number;
  className?: string;
  message?: string | null;
}

export default function GhibliCharacter({ mood, size = 4, className = '', message }: GhibliCharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 10, h = 12;
    canvas.width = w * size;
    canvas.height = h * size;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sprite = assembleGhibliSprite(mood);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = sprite[y][x];
        if (idx === 0) continue;
        ctx.fillStyle = GHIBLI_COLORS[idx];
        ctx.fillRect(x * size, y * size, size, size);
      }
    }
  }, [mood, size]);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {message && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white border border-[#c4a882]/40 text-[#5b4a3a] text-[11px] whitespace-nowrap z-10 rounded-xl shadow-sm animate-[bubble-fade_0.3s_ease-out_forwards]">
          {message}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/90" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={GHIBLI_ANIMATIONS[mood]}
        style={{
          imageRendering: 'pixelated',
          width: 10 * size,
          height: 12 * size,
        }}
      />
    </div>
  );
}
