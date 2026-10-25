export const FONT_STORAGE_KEY = 'cp-font';

export type FontScalePref = 'md' | 'lg';

export const readStoredFontScale = (): FontScalePref => {
  if (typeof window === 'undefined') return 'md';
  try {
    const stored = localStorage.getItem(FONT_STORAGE_KEY);
    if (stored === 'md' || stored === 'lg') return stored;
  } catch {
    /* ignore */
  }
  return 'md';
};

export const applyFontScale = (pref: FontScalePref) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-font', pref);
  try {
    localStorage.setItem(FONT_STORAGE_KEY, pref);
  } catch {
    /* ignore */
  }
};
