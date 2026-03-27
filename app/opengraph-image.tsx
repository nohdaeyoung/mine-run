import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Mine Run — Roguelike Minesweeper';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.06,
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Red glow */}
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span style={{ fontSize: 120, fontWeight: 900, color: '#ef4444', letterSpacing: -4 }}>
            MINE
          </span>
          <span style={{ fontSize: 120, fontWeight: 900, color: '#ffffff', letterSpacing: -4 }}>
            RUN
          </span>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 28, color: '#94a3b8', letterSpacing: 6, marginTop: 8, textTransform: 'uppercase' }}>
          Roguelike Minesweeper
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 22, color: '#64748b', marginTop: 16 }}>
          Be Bold, Be Rewarded
        </div>

        {/* Bottom domain */}
        <div style={{ position: 'absolute', bottom: 30, fontSize: 18, color: '#475569' }}>
          mine.324.ing
        </div>
      </div>
    ),
    { ...size }
  );
}
