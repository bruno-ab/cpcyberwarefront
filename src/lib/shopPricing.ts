/** Preços de loja centralizados — mesma regra em /shop e /cyberware. */

export type PricedItem = {
  price?: number | null;
  implant_cost?: number | null;
  implantCost?: number | null;
};

/** Preço base em eddies (campo `price` do catálogo; fallback legado). */
export const itemEddiePrice = (item?: PricedItem | null): number => {
  if (!item) return 0;
  const n = Number(item.price ?? item.implant_cost ?? item.implantCost ?? 0);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

/** Desconto de Street Cred (igual ao backend: até 30%). */
export const streetCredPrice = (
  base: number,
  streetCred = 0,
): number => {
  const mod = 1 - Number(streetCred || 0) / 500;
  return Math.round(base * Math.max(0.7, mod));
};

export type { CampaignHeat } from './heat';
export { heatAwarePrice, heatShopMarkup } from './heat';

export const formatEddies = (n: number): string =>
  `¤${Math.round(n).toLocaleString('pt-BR')}`;
