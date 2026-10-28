import { useEffect, useState } from 'react';
import { SKINS, type SkinName } from '@/theme';

// The chosen skin lives in localStorage so +html.tsx can apply it before the first paint.
const KEY = 'sb-skin';
const listeners = new Set<(s: SkinName | null) => void>();

export function readSkin(): SkinName | null {
  try {
    const s = localStorage.getItem(KEY);
    return s === 'butik' || s === 'stiker' ? s : null;
  } catch {
    return null;
  }
}

export function setSkin(s: SkinName) {
  try {
    localStorage.setItem(KEY, s);
  } catch {}
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-skin', s);
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', SKINS[s].browserBar);
  }
  listeners.forEach((l) => l(s));
}

// For the few places where words or decorations differ per skin.
// Starts as null so the build-time HTML and the first browser render match.
export function useSkin(): SkinName | null {
  const [skin, set] = useState<SkinName | null>(null);
  useEffect(() => {
    set(readSkin());
    listeners.add(set);
    return () => {
      listeners.delete(set);
    };
  }, []);
  return skin;
}
