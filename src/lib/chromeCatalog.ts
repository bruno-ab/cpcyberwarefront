import {
  CYBERWARE_CATALOG,
  type CyberwareCatalogEntry,
} from '../data/cyberwareCatalog';

export const matchCatalogEntry = (
  installedName: string,
): CyberwareCatalogEntry | undefined => {
  const n = String(installedName || '')
    .toLowerCase()
    .trim();
  if (!n) return undefined;
  return CYBERWARE_CATALOG.find((e) => {
    const en = e.name.toLowerCase();
    if (n === en || n.includes(en) || en.includes(n)) return true;
    const short = en.split('(')[0].trim();
    if (short.length >= 4 && (n.includes(short) || short.includes(n))) return true;
    return false;
  });
};

export const chromeActivationRamCost = (installedName: string): number | null => {
  const entry = matchCatalogEntry(installedName);
  if (!entry?.ramCost || entry.ramCost <= 0) return null;
  return entry.ramCost;
};

export const passiveChromeFx = (installedNames: string[]): string[] => {
  const tags: string[] = [];
  for (const name of installedNames) {
    const n = name.toLowerCase();
    if (/kiroshi|optic|ocular/.test(n)) tags.push('optics');
    if (/subdermal/.test(n)) tags.push('subdermal');
  }
  return Array.from(new Set(tags));
};
