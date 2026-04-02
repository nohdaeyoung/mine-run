import { Silkscreen } from 'next/font/google';

const silkscreen = Silkscreen({ weight: ['400', '700'], subsets: ['latin'] });

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={silkscreen.className} style={{ fontFamily: `${silkscreen.style.fontFamily}, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif, monospace` }}>
      <style>{`
        .font-kr { font-family: "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; }
        @keyframes char-idle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes char-happy {
          0%, 100% { transform: translateY(0px) scaleY(1); }
          30% { transform: translateY(-6px) scaleY(1.05); }
          60% { transform: translateY(0px) scaleY(0.96); }
        }
        @keyframes char-excited {
          0% { transform: translateY(0px) rotate(0deg); }
          20% { transform: translateY(-8px) rotate(-5deg); }
          40% { transform: translateY(0px) rotate(5deg); }
          60% { transform: translateY(-6px) rotate(-3deg); }
          80% { transform: translateY(0px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes char-worried {
          0%, 100% { transform: translateX(0px); }
          15% { transform: translateX(-2px); }
          30% { transform: translateX(2px); }
          45% { transform: translateX(-2px); }
          60% { transform: translateX(1px); }
        }
        @keyframes char-shocked {
          0% { transform: translateY(0px) scale(1); }
          15% { transform: translateY(-12px) scale(1.1); }
          35% { transform: translateY(-14px) scale(1.15); }
          55% { transform: translateY(-4px) scale(0.97); }
          70% { transform: translateY(2px) scale(0.95); }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes char-sad {
          0%, 100% { transform: translateY(0px) scaleY(1); }
          50% { transform: translateY(4px) scaleY(0.94); }
        }
        @keyframes char-celebrating {
          0% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(-8deg); }
          50% { transform: translateY(0px) rotate(0deg); }
          75% { transform: translateY(-10px) rotate(8deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes bubble-in {
          0% { opacity: 0; transform: translateY(4px) translateX(-50%) scale(0.92); }
          100% { opacity: 1; transform: translateY(0px) translateX(-50%) scale(1); }
        }
        .font-pixel { font-family: ${silkscreen.style.fontFamily}, monospace; }
      `}</style>
      {children}
    </div>
  );
}
