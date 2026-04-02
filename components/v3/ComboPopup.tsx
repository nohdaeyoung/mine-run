'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ComboGrade } from '@/lib/types';
import { setEventCallbacks } from '@/lib/tile-interaction';

const GRADE_STYLES: Record<ComboGrade, { text: string; size: string; color: string }> = {
  TAP: { text: '', size: '', color: '' },
  NICE: { text: 'NICE', size: 'text-xl', color: 'text-[#4ade80]' },
  GREAT: { text: 'GREAT!', size: 'text-3xl', color: 'text-[#5ba3d9]' },
  AMAZING: { text: 'AMAZING!!', size: 'text-4xl', color: 'text-[#a78bfa]' },
  FEARLESS: { text: 'FEARLESS!!!', size: 'text-5xl', color: 'text-[#f0c040]' },
};

interface PopupState {
  grade: ComboGrade;
  points: number;
  multiplier: number;
  key: number;
}

export default function ComboPopup() {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [visible, setVisible] = useState(false);

  const handleCellsRevealed = useCallback(
    (_cells: { row: number; col: number }[], grade: ComboGrade, points: number, multiplier: number) => {
      if (grade === 'TAP') return;
      setPopup({ grade, points, multiplier, key: Date.now() });
      setVisible(true);
      setTimeout(() => setVisible(false), 1500);
    },
    []
  );

  useEffect(() => {
    setEventCallbacks({ onCellsRevealed: handleCellsRevealed });
  }, [handleCellsRevealed]);

  if (!popup || !visible) return null;
  const style = GRADE_STYLES[popup.grade];

  return (
    <div
      key={popup.key}
      className={`
        fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
        pointer-events-none z-50
        animate-bounce
        ${style.size} ${style.color}
        font-bold tracking-widest
      `}
      style={{ textShadow: '2px 2px 0 #1a1025' }}
    >
      <div>{style.text}</div>
      <div className="text-center text-xs opacity-80 text-[#b8a9d4]">
        +{popup.points} (x{popup.multiplier})
      </div>
    </div>
  );
}
