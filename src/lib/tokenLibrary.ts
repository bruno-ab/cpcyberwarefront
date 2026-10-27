export type TokenLibraryStamp = {
  kind: 'character' | 'npc';
  id: string;
  label?: string;
};

const key = (campaignId: number) => `cp-vtt-token-library:${campaignId}`;

export const loadTokenLibrary = (campaignId: number): TokenLibraryStamp[] => {
  try {
    const raw = localStorage.getItem(key(campaignId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveTokenLibrary = (
  campaignId: number,
  stamps: TokenLibraryStamp[],
) => {
  try {
    localStorage.setItem(key(campaignId), JSON.stringify(stamps.slice(0, 32)));
  } catch {
    /* ignore */
  }
};

export const toggleTokenLibraryStamp = (
  campaignId: number,
  stamp: TokenLibraryStamp,
): TokenLibraryStamp[] => {
  const list = loadTokenLibrary(campaignId);
  const idx = list.findIndex(
    (s) => s.kind === stamp.kind && s.id === stamp.id,
  );
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift(stamp);
  saveTokenLibrary(campaignId, list);
  return list;
};
