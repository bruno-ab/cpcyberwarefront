/** Soma Storyteller: atributo + habilidade (+ bônus chrome opcional). */

const ATTR_GROUPS = ['physical', 'social', 'mental'] as const;
const SKILL_GROUPS = ['talents', 'skills', 'knowledges'] as const;

export const ATTR_OPTIONS = [
  'strength',
  'dexterity',
  'stamina',
  'charisma',
  'manipulation',
  'appearance',
  'perception',
  'intelligence',
  'wits',
] as const;

export const SKILL_OPTIONS = [
  'alertness',
  'athletics',
  'brawl',
  'empathy',
  'expression',
  'intimidation',
  'leadership',
  'streetwise',
  'subterfuge',
  'animal_ken',
  'crafts',
  'drive',
  'etiquette',
  'firearms',
  'melee',
  'performance',
  'security',
  'stealth',
  'survival',
  'academics',
  'computer',
  'finance',
  'investigation',
  'law',
  'medicine',
  'occult',
  'politics',
  'science',
  'technology',
] as const;

const lookup = (
  sheet: Record<string, any> | null | undefined,
  groups: readonly string[],
  key: string,
) => {
  for (const g of groups) {
    const n = Number(sheet?.[g]?.[key]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  // flat fallback
  const flat = Number(sheet?.[key]);
  return Number.isFinite(flat) ? flat : 0;
};

export const sheetStatValue = (
  sheet: Record<string, any> | null | undefined,
  key: string,
  bonuses?: Record<string, number>,
) => {
  const base =
    lookup(sheet, ATTR_GROUPS, key) || lookup(sheet, SKILL_GROUPS, key);
  const bonus = Number(bonuses?.[key]) || 0;
  return Math.max(0, base + bonus);
};

export const computeSheetPool = (
  sheet: Record<string, any> | null | undefined,
  attr: string,
  skill: string,
  bonuses?: Record<string, number>,
) =>
  sheetStatValue(sheet, attr, bonuses) + sheetStatValue(sheet, skill, bonuses);

export const formatStatOption = (key: string) =>
  key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
