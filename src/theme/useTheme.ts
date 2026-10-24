'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applyTheme,
  readStoredTheme,
  ThemeId,
  THEMES,
} from './palettes';

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemeId>('night');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
    setMounted(true);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    applyTheme(id);
  }, []);

  return { theme, setTheme, themes: THEMES, mounted };
};
