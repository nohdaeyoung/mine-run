'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { onGameEvent } from '@/lib/tile-interaction';
import { useGameStore } from '@/lib/store';
import { JACKPOT_MULTIPLIER } from '@/lib/combo';
import {
  sfxSafeReveal,
  sfxFloodCascade,
  sfxCombo,
  sfxMineHit,
  sfxShieldSave,
  sfxClear,
  sfxJackpot,
  sfxGameOver,
  sfxMineBlip,
} from '@/lib/sfx';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

interface Flash {
  id: number;
  color: string;
  quick?: boolean;
}

interface Banner {
  id: number;
  text: string;
  sub?: string;
  className: string;
}

const CONFETTI_COLORS = ['#fbbf24', '#ef4444', '#22d3ee', '#a3e635', '#f472b6', '#ffffff'];

export default function GameEffects() {
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [shield, setShield] = useState<number | null>(null);
  const nextId = useRef(1);

  const addFlash = useCallback((color: string, quick = false) => {
    const id = nextId.current++;
    setFlashes((f) => [...f, { id, color, quick }]);
    setTimeout(() => setFlashes((f) => f.filter((x) => x.id !== id)), 520);
  }, []);

  const burstConfetti = useCallback((count: number) => {
    const pieces: ConfettiPiece[] = Array.from({ length: count }, () => ({
      id: nextId.current++,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 1.4 + Math.random() * 1.2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
    }));
    setConfetti((c) => [...c, ...pieces]);
    setTimeout(() => {
      const ids = new Set(pieces.map((p) => p.id));
      setConfetti((c) => c.filter((p) => !ids.has(p.id)));
    }, 3200);
  }, []);

  const showBanner = useCallback((text: string, className: string, sub?: string, ms = 1600) => {
    const id = nextId.current++;
    setBanner({ id, text, sub, className });
    setTimeout(() => setBanner((b) => (b && b.id === id ? null : b)), ms);
  }, []);

  useEffect(() => {
    const unsubs = [
      onGameEvent('cellsRevealed', ({ cells, grade }) => {
        if (cells.length > 1) sfxFloodCascade(cells.length);
        else sfxSafeReveal(cells.length);
        if (grade !== 'TAP') {
          const combo = useGameStore.getState().run.combo.current;
          sfxCombo(grade, combo);
        }
      }),

      onGameEvent('mineHit', () => {
        sfxMineHit();
        addFlash('rgba(239,68,68,1)');
      }),

      onGameEvent('shieldSave', () => {
        sfxShieldSave();
        addFlash('rgba(34,211,238,0.9)', true);
        const id = nextId.current++;
        setShield(id);
        setTimeout(() => setShield((s) => (s === id ? null : s)), 650);
      }),

      onGameEvent('fieldCleared', ({ jackpot, clearBonus }) => {
        if (jackpot) {
          sfxJackpot();
          burstConfetti(120);
          showBanner(
            'JACKPOT!',
            'text-amber-300 mr-jackpot',
            `보너스 x${JACKPOT_MULTIPLIER} → +${clearBonus.toLocaleString()}`,
            2000
          );
        } else {
          sfxClear();
          burstConfetti(70);
        }
      }),

      onGameEvent('gameOver', () => {
        sfxGameOver();
        addFlash('rgba(239,68,68,1)');
        // Stagger detonation blips across the mines still on the board.
        const cells = useGameStore.getState().run.field.cells;
        let mineCount = 0;
        for (const rowCells of cells) {
          for (const c of rowCells) {
            if (c.value === 'mine') {
              sfxMineBlip(0.1 + mineCount * 0.06);
              mineCount++;
              if (mineCount > 12) break;
            }
          }
          if (mineCount > 12) break;
        }
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, [addFlash, burstConfetti, showBanner]);

  return (
    <>
      {/* Colour flashes */}
      {flashes.map((f) => (
        <div
          key={f.id}
          className={`fixed inset-0 z-[60] pointer-events-none ${f.quick ? 'mr-flash-quick' : 'mr-flash'}`}
          style={{ backgroundColor: f.color }}
        />
      ))}

      {/* Shield save burst */}
      {shield !== null && (
        <div className="fixed inset-0 z-[61] pointer-events-none flex items-center justify-center">
          <div className="mr-shield-pop text-cyan-300 font-black text-5xl drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">
            🛡 SAVED!
          </div>
        </div>
      )}

      {/* Confetti */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 z-[59] pointer-events-none overflow-hidden">
          {confetti.map((p) => (
            <div
              key={p.id}
              className="mr-confetti absolute top-0"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size * 0.45,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Center banner (jackpot etc.) */}
      {banner && (
        <div className="fixed inset-0 z-[62] pointer-events-none flex items-center justify-center">
          <div className={`text-center font-black ${banner.className}`}>
            <div className="text-6xl sm:text-7xl tracking-tight drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">
              {banner.text}
            </div>
            {banner.sub && <div className="text-xl mt-2 text-white/90">{banner.sub}</div>}
          </div>
        </div>
      )}
    </>
  );
}
