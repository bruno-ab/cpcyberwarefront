'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyTheme,
  readStoredTheme,
  ThemeId,
  THEMES,
  isThemeSelectable,
  BASE_THEMES,
} from './palettes';
import { SECRETS_UPDATED_EVENT } from './unlocks';

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemeId>('night');
  const [mounted, setMounted] = useState(false);
  const [unlockTick, setUnlockTick] = useState(0);

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
    setMounted(true);
    const onUnlock = () => setUnlockTick((n) => n + 1);
    window.addEventListener(SECRETS_UPDATED_EVENT, onUnlock);
    return () => window.removeEventListener(SECRETS_UPDATED_EVENT, onUnlock);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    if (!isThemeSelectable(id)) return;
    setThemeState(id);
    applyTheme(id);
  }, []);

  const themes = useMemo(() => {
    void unlockTick;
    return THEMES;
  }, [unlockTick]);

  const selectableThemes = useMemo(() => {
    void unlockTick;
    return themes.filter((t) => isThemeSelectable(t.id));
  }, [themes, unlockTick]);

  const lockedSecretThemes = useMemo(() => {
    void unlockTick;
    return themes.filter((t) => t.secret && !isThemeSelectable(t.id));
  }, [themes, unlockTick]);

  return {
    theme,
    setTheme,
    themes: selectableThemes,
    lockedSecretThemes,
    allThemes: themes,
    baseThemes: BASE_THEMES,
    mounted,
  };
};
