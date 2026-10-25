import { apiUrl } from './api';

/** Fallbacks SVG locais — sem assets oficiais ripados. */

const CYBERWARE_TYPES = new Set([
  'operating_system',
  'frontal_cortex',
  'face',
  'nervous_system',
  'circulatory_system',
  'integumentary_system',
  'skeleton',
  'arms',
  'hands',
  'legs',
]);

/** Resolve path do bucket local (S3-like) na API. */
export const mediaObjectSrc = (key: string) =>
  apiUrl(`/api/media/object?key=${encodeURIComponent(key)}`);

export const resolveMediaSrc = (image?: string | null) => {
  if (!image || !String(image).trim()) return null;
  const value = String(image).trim();
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/api/media')) return apiUrl(value);
  if (value.startsWith('/')) return value;
  return mediaObjectSrc(value);
};

export const cyberwareImageSrc = (item?: {
  image?: string | null;
  type?: string | null;
  name?: string;
}) => {
  const resolved = resolveMediaSrc(item?.image);
  if (resolved) return resolved;
  const type = String(item?.type || 'default');
  if (CYBERWARE_TYPES.has(type)) {
    return `/images/cyberware/${type}.svg`;
  }
  return '/images/cyberware/default.svg';
};

export const npcImageSrc = (npc?: { id?: string; image?: string | null }) => {
  const resolved = resolveMediaSrc(npc?.image);
  if (resolved) return resolved;
  if (npc?.id) {
    // Prefer bucket local S3-like; SVG fica de fallback via onError no <img>
    return mediaObjectSrc(`npcs/${npc.id}.jpg`);
  }
  return '/images/npcs/default.svg';
};

export const characterImageSrc = (character?: {
  id?: string | number;
  image?: string | null;
  name?: string;
}) => {
  const resolved = resolveMediaSrc(character?.image);
  if (resolved) return resolved;
  if (character?.id != null) {
    return mediaObjectSrc(`characters/${String(character.id)}.jpg`);
  }
  return '/images/npcs/default.svg';
};
