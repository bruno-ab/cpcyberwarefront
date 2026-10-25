export type CampaignHeat = {
  police: number;
  corpo: number;
  media: number;
};

export type HeatEffects = {
  shopMarkup: number;
  contactPenalty: number;
  encounter: string;
  encounterBlurb: string;
  mediaSpotlight: boolean;
  corpoInterest: boolean;
  wantedStars: number;
};

export const DEFAULT_HEAT: CampaignHeat = {
  police: 0,
  corpo: 0,
  media: 0,
};

export const heatShopMarkup = (heat?: CampaignHeat | null): number => {
  const h = heat || DEFAULT_HEAT;
  return Math.min(
    1.45,
    1 + Number(h.police || 0) * 0.05 + Number(h.corpo || 0) / 400 + Number(h.media || 0) / 500,
  );
};

/** Preço final: Street Cred desconta, Heat encarece. */
export const heatAwarePrice = (
  base: number,
  streetCred = 0,
  heat?: CampaignHeat | null,
): number => {
  const streetMod = Math.max(0.7, 1 - Number(streetCred || 0) / 500);
  const heatMod = heatShopMarkup(heat);
  return Math.round(base * streetMod * heatMod);
};

export const wantedLabel = (stars: number): string => {
  const n = Math.max(0, Math.min(5, Math.round(stars)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
};
