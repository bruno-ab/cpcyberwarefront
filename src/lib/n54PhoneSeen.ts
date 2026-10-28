const keyFor = (characterId: string) => `cp-phone-n54-seen-${characterId}`;

export const readN54SeenIds = (characterId: string): Set<string> => {
  try {
    const raw = localStorage.getItem(keyFor(characterId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(String));
  } catch {
    return new Set();
  }
};

export const writeN54SeenIds = (characterId: string, ids: Set<string>) => {
  try {
    localStorage.setItem(keyFor(characterId), JSON.stringify(Array.from(ids)));
  } catch {
    /* ignore */
  }
};

export const countN54Unread = (
  characterId: string,
  feed: Array<{ id: number | string }>,
): number => {
  const seen = readN54SeenIds(characterId);
  return feed.filter((item) => !seen.has(String(item.id))).length;
};

export const markN54FeedSeen = (
  characterId: string,
  feed: Array<{ id: number | string }>,
) => {
  const seen = readN54SeenIds(characterId);
  feed.forEach((item) => seen.add(String(item.id)));
  writeN54SeenIds(characterId, seen);
};
