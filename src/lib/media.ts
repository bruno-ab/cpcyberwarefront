/** Fallbacks visuais originais (SVG) — sem assets oficiais ripados. */

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

export const cyberwareImageSrc = (item?: {
  image?: string | null;
  type?: string | null;
  name?: string;
}) => {
  if (item?.image && String(item.image).trim()) {
    return String(item.image);
  }
  const type = String(item?.type || 'default');
  if (CYBERWARE_TYPES.has(type)) {
    return `/images/cyberware/${type}.svg`;
  }
  return '/images/cyberware/default.svg';
};

export const npcImageSrc = (npc?: { id?: string; image?: string | null }) => {
  if (npc?.image && String(npc.image).trim()) {
    return String(npc.image);
  }
  if (npc?.id) {
    return `/images/npcs/${npc.id}.svg`;
  }
  return '/images/npcs/default.svg';
};
