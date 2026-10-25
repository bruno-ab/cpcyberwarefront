import { findRoleKit, ROLE_KITS } from '../data/roleAbilities';

/** Visual variant for role-tinted sheet chrome (2–3 per role). */
export type SheetThemeVariant = 'default' | 'alt' | 'extreme';

export const SHEET_THEME_VARIANTS: SheetThemeVariant[] = [
  'default',
  'alt',
  'extreme',
];

export const DEFAULT_SHEET_ROLE_ID = 'nightcity';

export type SheetRoleId =
  | typeof DEFAULT_SHEET_ROLE_ID
  | (typeof ROLE_KITS)[number]['id'];

const STORAGE_PREFIX = 'cp-sheet-theme';

export const sheetThemeStorageKey = (
  characterId: string,
  roleId: string,
): string => `${STORAGE_PREFIX}:${characterId}:${roleId}`;

export const resolveSheetRoleId = (roleName?: string | null): SheetRoleId => {
  const kit = findRoleKit(roleName);
  return kit?.id ?? DEFAULT_SHEET_ROLE_ID;
};

export const isSheetThemeVariant = (v: string): v is SheetThemeVariant =>
  SHEET_THEME_VARIANTS.includes(v as SheetThemeVariant);

export const readSheetThemeVariant = (
  characterId: string,
  roleId: string,
): SheetThemeVariant => {
  if (typeof window === 'undefined') return 'default';
  try {
    const raw = localStorage.getItem(sheetThemeStorageKey(characterId, roleId));
    if (raw && isSheetThemeVariant(raw)) return raw;
  } catch {
    /* ignore */
  }
  return 'default';
};

export const writeSheetThemeVariant = (
  characterId: string,
  roleId: string,
  variant: SheetThemeVariant,
): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(sheetThemeStorageKey(characterId, roleId), variant);
  } catch {
    /* ignore */
  }
};

/** i18n keys under sheet.roleTheme.roles.* */
export const SHEET_ROLE_IDS: SheetRoleId[] = [
  DEFAULT_SHEET_ROLE_ID,
  ...ROLE_KITS.map((r) => r.id),
];
