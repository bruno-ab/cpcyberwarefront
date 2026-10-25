export const CYBERWARE_RARITIES = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
] as const;

export type CyberwareRarity = (typeof CYBERWARE_RARITIES)[number];

export type CyberwareFilterStatus =
  | 'all'
  | 'buyable'
  | 'owned'
  | 'installed';

export type CyberwareSort =
  | 'name'
  | 'price-asc'
  | 'price-desc'
  | 'rarity'
  | 'edge';

export type CyberwareFilterState = {
  query: string;
  rarity: 'all' | CyberwareRarity;
  status: CyberwareFilterStatus;
  type: string;
  priceMin: string;
  priceMax: string;
  sort: CyberwareSort;
  affordableOnly: boolean;
};

export const DEFAULT_CYBERWARE_FILTERS: CyberwareFilterState = {
  query: '',
  rarity: 'all',
  status: 'all',
  type: 'all',
  priceMin: '',
  priceMax: '',
  sort: 'name',
  affordableOnly: false,
};

export type FilterableChrome = {
  id?: number | string;
  name?: string;
  type?: string | null;
  rarity?: string;
  description?: string;
  effect?: string;
  /** Preço efetivo em Eddies (já com heat/SC se aplicável). */
  price?: number;
  edgeCost?: number;
};

const RARITY_RANK: Record<string, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

export const rarityRank = (rarity?: string) =>
  RARITY_RANK[String(rarity || '').trim().toLowerCase()] || 0;

export const parsePriceBound = (raw: string) => {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

export const matchesChromeQuery = (
  item: FilterableChrome,
  query: string,
) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.name?.toLowerCase().includes(q) ||
    item.type?.toLowerCase().includes(q) ||
    item.rarity?.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q) ||
    item.effect?.toLowerCase().includes(q) ||
    false
  );
};

export const matchesChromeFilters = (
  item: FilterableChrome,
  filters: CyberwareFilterState,
  opts?: { wallet?: number },
) => {
  if (!matchesChromeQuery(item, filters.query)) return false;

  if (
    filters.rarity !== 'all' &&
    String(item.rarity || '').toLowerCase() !== filters.rarity.toLowerCase()
  ) {
    return false;
  }

  if (filters.type !== 'all' && item.type !== filters.type) {
    return false;
  }

  const price = Number(item.price) || 0;
  const min = parsePriceBound(filters.priceMin);
  const max = parsePriceBound(filters.priceMax);
  if (min != null && price < min) return false;
  if (max != null && price > max) return false;

  if (filters.affordableOnly && opts?.wallet != null && price > opts.wallet) {
    return false;
  }

  return true;
};

export const sortChromeItems = <T extends FilterableChrome>(
  items: T[],
  sort: CyberwareSort,
): T[] => {
  const list = [...items];
  list.sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      case 'price-desc':
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      case 'rarity':
        return rarityRank(b.rarity) - rarityRank(a.rarity);
      case 'edge':
        return (Number(b.edgeCost) || 0) - (Number(a.edgeCost) || 0);
      case 'name':
      default:
        return String(a.name || '').localeCompare(String(b.name || ''), 'pt', {
          sensitivity: 'base',
        });
    }
  });
  return list;
};

export const hasActiveCyberwareFilters = (f: CyberwareFilterState) =>
  Boolean(
    f.query.trim() ||
      f.rarity !== 'all' ||
      f.status !== 'all' ||
      f.type !== 'all' ||
      f.priceMin.trim() ||
      f.priceMax.trim() ||
      f.affordableOnly ||
      f.sort !== 'name',
  );
