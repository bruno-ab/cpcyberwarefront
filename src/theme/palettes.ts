export type ThemeId =
  | 'night'
  | 'matrix'
  | 'hotline'
  | 'arasaka'
  | 'netwatch'
  | 'edgerunners'
  | 'amber';

export type ThemeDef = {
  id: ThemeId;
  /** Swatch preview colors [primary, accent, alert] */
  swatches: [string, string, string];
};

export const THEME_STORAGE_KEY = 'cp-theme';

export const THEMES: ThemeDef[] = [
  { id: 'night', swatches: ['#00f3ff', '#ffb800', '#ff003c'] },
  { id: 'matrix', swatches: ['#33ff66', '#9dffb0', '#ff3333'] },
  { id: 'hotline', swatches: ['#00f3ff', '#ffb800', '#ff003c'] },
  { id: 'arasaka', swatches: ['#ff4d6d', '#f0e6d8', '#ff0000'] },
  { id: 'netwatch', swatches: ['#4db8ff', '#a8d4ff', '#ff4466'] },
  { id: 'edgerunners', swatches: ['#ff2bd6', '#fed33f', '#ff003c'] },
  { id: 'amber', swatches: ['#ffb000', '#ffd24a', '#ff4400'] },
];

export const isThemeId = (value: string): value is ThemeId =>
  THEMES.some((t) => t.id === value);

export const applyTheme = (id: ThemeId) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (id === 'night') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', id);
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
};

export const readStoredTheme = (): ThemeId => {
  if (typeof window === 'undefined') return 'night';
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY) || 'night';
    return isThemeId(raw) ? raw : 'night';
  } catch {
    return 'night';
  }
};
