import { Nunito } from 'next/font/google';

const nunito = Nunito({ weight: ['400', '600', '700', '800'], subsets: ['latin'] });

export default function V4Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={nunito.className}>
      <style>{`
        /* Watercolor paper texture */
        .wc-paper {
          background-color: #faf5ee;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(168,213,160,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(135,206,235,0.10) 0%, transparent 40%),
            radial-gradient(ellipse at 60% 80%, rgba(212,136,107,0.08) 0%, transparent 45%),
            radial-gradient(ellipse at 10% 90%, rgba(196,168,130,0.10) 0%, transparent 40%);
        }
        /* Watercolor wash panel */
        .wc-panel {
          background: rgba(255,252,247,0.85);
          box-shadow: 0 0 20px rgba(196,168,130,0.08), inset 0 0 30px rgba(255,255,255,0.3);
          border: 1px solid rgba(196,168,130,0.2);
        }
        /* Watercolor cell hidden */
        .wc-cell-hidden {
          background: linear-gradient(135deg, #c2d4ae 0%, #b8cca0 40%, #cad8b8 100%);
          box-shadow: 0 1px 4px rgba(91,138,78,0.12), inset 0 1px 2px rgba(255,255,255,0.35);
          border-radius: 3px;
        }
        .wc-cell-hidden:hover { background: linear-gradient(135deg, #cedaba 0%, #c4d4ae 40%, #d4e0c4 100%); }
        .wc-cell-hidden:active { background: linear-gradient(135deg, #b0c298 0%, #a8bc90 40%, #bcc8a8 100%); }
        /* Watercolor cell revealed */
        .wc-cell-revealed {
          background: linear-gradient(135deg, #f5ede0 0%, #efe5d5 60%, #faf4ea 100%);
          box-shadow: inset 0 1px 3px rgba(160,140,110,0.1);
          border-radius: 3px;
        }
        .wc-cell-revealed-empty {
          background: linear-gradient(135deg, #ede4d2 0%, #e5dbc8 60%, #f0e8da 100%);
          box-shadow: inset 0 1px 3px rgba(160,140,110,0.12);
          border-radius: 3px;
        }
        /* Watercolor splatter decorations */
        .wc-splash {
          border-radius: 43% 57% 52% 48% / 45% 55% 45% 55%;
          filter: blur(30px);
          opacity: 0.2;
        }
        /* Watercolor button */
        .wc-btn {
          background: linear-gradient(135deg, #7cb668 0%, #8cc87a 50%, #6aa658 100%);
          box-shadow: 0 2px 8px rgba(91,138,78,0.2), inset 0 1px 0 rgba(255,255,255,0.2);
          border: none;
          transition: all 0.2s;
        }
        .wc-btn:hover {
          background: linear-gradient(135deg, #8cc87a 0%, #9cd88a 50%, #7cb668 100%);
          box-shadow: 0 4px 12px rgba(91,138,78,0.25);
        }

        @keyframes ghibli-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ghibli-sway {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-3deg); }
          75% { transform: translateY(-3px) rotate(3deg); }
        }
        @keyframes ghibli-bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes ghibli-tremble {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-1.5px); }
          75% { transform: translateX(1.5px); }
        }
        @keyframes ghibli-jump {
          0% { transform: translateY(0) scale(1); }
          20% { transform: translateY(-16px) scale(1.1); }
          50% { transform: translateY(-4px) scale(0.95); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes ghibli-droop {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(3px) scaleY(0.96); }
        }
        @keyframes ghibli-dance {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-6deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-8px) rotate(6deg); }
        }
        @keyframes leaf-fall {
          0% { transform: translateY(-20px) rotate(0deg) scale(0.8); opacity: 0; }
          15% { opacity: 0.5; }
          100% { transform: translateY(100vh) rotate(300deg) scale(0.6); opacity: 0; }
        }
        @keyframes bubble-fade {
          0% { opacity: 0; transform: translateY(4px) translateX(-50%) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) translateX(-50%) scale(1); }
        }
        @keyframes cloud-drift {
          0% { transform: translateX(-120px); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateX(calc(100vw + 120px)); opacity: 0; }
        }
        @keyframes wc-breathe {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.22; transform: scale(1.05); }
        }
      `}</style>
      {children}
    </div>
  );
}
