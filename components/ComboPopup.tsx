'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ComboGrade } from '@/lib/types';
import { setEventCallbacks } from '@/lib/tile-interaction';

const GRADE_STYLES: Record<ComboGrade, { text: string; size: string; color: string }> = {
  TAP: { text: '', size: '', color: '' },
  NICE: { text: 'NICE', size: 'text-lg', color: 'text-green-400' },
  GREAT: { text: 'GREAT!', size: 'text-2xl', color: 'text-blue-400' },
  AMAZING: { text: 'AMAZING!!', size: 'text-3xl', color: 'text-purple-400' },
  FEARLESS: { text: 'FEARLESS!!!', size: 'text-5xl', color: 'text-amber-400' },
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
    setEventCallbacks({
      onCellsRevealed: handleCellsRevealed,
    });
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
        font-black tracking-wider drop-shadow-lg
      `}
    >
      <div>{style.text}</div>
      <div className="text-center text-sm font-mono opacity-80">
        +{popup.points} (x{popup.multiplier})
      </div>
    </div>
  );
}
