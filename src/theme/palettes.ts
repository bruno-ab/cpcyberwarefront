import {
  SECRET_THEMES,
  SECRET_THEME_IDS,
  isSecretThemeId,
  type SecretThemeId,
} from './secretThemes';
import { isThemeUnlocked } from './unlocks';

export type BaseThemeId =
  | 'night'
  | 'matrix'
  | 'hotline'
  | 'arasaka'
  | 'netwatch'
  | 'edgerunners'
  | 'amber';

export type ThemeId = BaseThemeId | SecretThemeId;

export type ThemeDef = {
  id: ThemeId;
  /** Swatch preview colors [primary, accent, alert] */
  swatches: [string, string, string];
  /** Secret palettes require ARG unlock */
  secret?: boolean;
};

export const THEME_STORAGE_KEY = 'cp-theme';

export const BASE_THEMES: ThemeDef[] = [
  { id: 'night', swatches: ['#00f3ff', '#ffb800', '#ff003c'] },
  { id: 'matrix', swatches: ['#33ff66', '#9dffb0', '#ff3333'] },
  { id: 'hotline', swatches: ['#00f3ff', '#ffb800', '#ff003c'] },
  { id: 'arasaka', swatches: ['#ff4d6d', '#f0e6d8', '#ff0000'] },
  { id: 'netwatch', swatches: ['#4db8ff', '#a8d4ff', '#ff4466'] },
  { id: 'edgerunners', swatches: ['#ff2bd6', '#fed33f', '#ff003c'] },
  { id: 'amber', swatches: ['#ffb000', '#ffd24a', '#ff4400'] },
];

export const THEMES: ThemeDef[] = [
  ...BASE_THEMES,
  ...SECRET_THEMES.map((t) => ({ ...t, secret: true as const })),
];

const BASE_THEME_IDS = BASE_THEMES.map((t) => t.id);

export const isBaseThemeId = (value: string): value is BaseThemeId =>
  BASE_THEME_IDS.includes(value as BaseThemeId);

export const isThemeId = (value: string): value is ThemeId =>
  isBaseThemeId(value) || isSecretThemeId(value);

export const isThemeSelectable = (id: ThemeId): boolean => {
  if (isBaseThemeId(id)) return true;
  return isThemeUnlocked(id);
};

export const applyTheme = (id: ThemeId) => {
  if (typeof document === 'undefined') return;
  if (isSecretThemeId(id) && !isThemeUnlocked(id)) return;
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
    if (!isThemeId(raw)) return 'night';
    if (isSecretThemeId(raw) && !isThemeUnlocked(raw)) return 'night';
    return raw;
  } catch {
    return 'night';
  }
};

/** Bootstrap script: base + any unlocked secret theme ids */
export const bootstrapThemeAllowList = (): string[] => [
  ...BASE_THEMES.filter((t) => t.id !== 'night').map((t) => t.id),
  ...SECRET_THEME_IDS,
];

export { SECRET_THEME_IDS, type SecretThemeId };
