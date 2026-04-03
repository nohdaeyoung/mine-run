'use client';

import { useState } from 'react';
import { startBGM, stopBGM } from '@/lib/bgm';

export default function BGMToggle() {
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (playing) {
      stopBGM();
      setPlaying(false);
    } else {
      startBGM();
      setPlaying(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white border border-[#c4a882]/30
        flex items-center justify-center text-lg hover:bg-white/90 transition-all cursor-pointer shadow-sm"
      title={playing ? 'BGM Off' : 'BGM On'}
    >
      {playing ? '🎵' : '🔇'}
    </button>
  );
}
