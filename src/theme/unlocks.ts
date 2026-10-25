import { SECRET_THEME_IDS, type SecretThemeId } from './secretThemes';

export const THEME_UNLOCKS_KEY = 'cp-theme-unlocks';
export const SHARD_COLLECTION_KEY = 'cp-shard-collection';
export const LORE_UNLOCKS_KEY = 'cp-lore-unlocks';

export const SECRETS_UPDATED_EVENT = 'cp-secrets-updated';

const parseJsonArray = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [];
  }
};

const writeJsonArray = (key: string, values: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(values))));
    window.dispatchEvent(new Event(SECRETS_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
};

export const readThemeUnlocks = (): SecretThemeId[] => {
  if (typeof window === 'undefined') return [];
  return parseJsonArray(localStorage.getItem(THEME_UNLOCKS_KEY)).filter(
    (id): id is SecretThemeId =>
      SECRET_THEME_IDS.includes(id as SecretThemeId),
  );
};

export const readLoreUnlocks = (): string[] => {
  if (typeof window === 'undefined') return [];
  return parseJsonArray(localStorage.getItem(LORE_UNLOCKS_KEY));
};

export const readShardCollection = (): string[] => {
  if (typeof window === 'undefined') return [];
  return parseJsonArray(localStorage.getItem(SHARD_COLLECTION_KEY));
};

export const isThemeUnlocked = (id: SecretThemeId): boolean =>
  readThemeUnlocks().includes(id);

export const unlockTheme = (id: SecretThemeId) => {
  if (typeof window === 'undefined') return;
  const next = [...readThemeUnlocks(), id];
  writeJsonArray(THEME_UNLOCKS_KEY, next);
};

export const unlockLore = (loreId: string) => {
  if (typeof window === 'undefined') return;
  const next = [...readLoreUnlocks(), loreId];
  writeJsonArray(LORE_UNLOCKS_KEY, next);
};

export const collectShard = (shardId: string): boolean => {
  if (typeof window === 'undefined') return false;
  const current = readShardCollection();
  if (current.includes(shardId)) return false;
  writeJsonArray(SHARD_COLLECTION_KEY, [...current, shardId]);
  return true;
};
