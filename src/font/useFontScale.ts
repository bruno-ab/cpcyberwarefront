'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applyFontScale,
  type FontScalePref,
  readStoredFontScale,
} from './fontPrefs';

export const useFontScale = () => {
  const [scale, setScaleState] = useState<FontScalePref>('md');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredFontScale();
    setScaleState(stored);
    applyFontScale(stored);
    setMounted(true);
  }, []);

  const setScale = useCallback((pref: FontScalePref) => {
    setScaleState(pref);
    applyFontScale(pref);
  }, []);

  const toggleScale = useCallback(() => {
    setScaleState((prev) => {
      const next: FontScalePref = prev === 'lg' ? 'md' : 'lg';
      applyFontScale(next);
      return next;
    });
  }, []);

  return {
    scale,
    setScale,
    toggleScale,
    enlarged: scale === 'lg',
    mounted,
  };
};
