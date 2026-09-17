'use client';

import { useState, useEffect, useRef } from 'react';
import type { ComboGrade } from '@/lib/types';
import { onGameEvent } from '@/lib/tile-interaction';

const GRADE_STYLES: Record<ComboGrade, { text: string; size: string; color: string; aura: string }> = {
  TAP: { text: '', size: '', color: '', aura: '' },
  NICE: { text: 'NICE', size: 'text-2xl', color: 'text-green-400', aura: '' },
  GREAT: { text: 'GREAT!', size: 'text-4xl', color: 'text-blue-400', aura: '' },
  AMAZING: { text: 'AMAZING!!', size: 'text-5xl', color: 'text-purple-400', aura: 'drop-shadow-[0_0_24px_rgba(168,85,247,0.6)]' },
  FEARLESS: { text: 'FEARLESS!!!', size: 'text-6xl sm:text-7xl', color: 'text-amber-400', aura: 'drop-shadow-[0_0_40px_rgba(251,191,36,0.8)]' },
};

interface PopupState {
  grade: ComboGrade;
  points: number;
  multiplier: number;
  count: number;
  key: number;
}

export default function ComboPopup() {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let keyCounter = 0;
    const unsub = onGameEvent('cellsRevealed', ({ grade, points, multiplier, cells }) => {
      if (grade === 'TAP') return;
      keyCounter += 1;
      setPopup({ grade, points, multiplier, count: cells.length, key: keyCounter });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setPopup(null), 1300);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!popup) return null;

  const style = GRADE_STYLES[popup.grade];
  const isBig = popup.grade === 'AMAZING' || popup.grade === 'FEARLESS';

  return (
    <div
      key={popup.key}
      className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 mr-combo-punch text-center"
    >
      {isBig && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-current opacity-10 blur-3xl" />
      )}
      <div className={`relative font-black tracking-wider ${style.size} ${style.color} ${style.aura}`}>
        {style.text}
      </div>
      <div className="relative mt-1 font-mono text-lg text-white/90 font-bold">
        +{popup.points.toLocaleString()} <span className="text-amber-300">×{popup.multiplier}</span>
      </div>
      <div className="relative text-xs text-white/50 tracking-widest uppercase">
        {popup.count} cells
      </div>
    </div>
  );
}
