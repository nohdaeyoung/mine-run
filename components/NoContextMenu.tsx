'use client';

import { useEffect } from 'react';

export default function NoContextMenu() {
  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', handler, true);
    return () => document.removeEventListener('contextmenu', handler, true);
  }, []);

  return null;
}
