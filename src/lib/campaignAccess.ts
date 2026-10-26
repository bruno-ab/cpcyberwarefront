import { fetchMineCampaigns, type CampaignRow } from './campaignsApi';
import { getAccessToken, getPlayerIdFromToken } from './authSession';

export const CP_CAMPAIGN_STORAGE_KEY = 'cp-campaign-id';

export const clearStoredCampaignId = (): void => {
  try {
    localStorage.removeItem(CP_CAMPAIGN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

export const playerCanUseCampaign = (
  campaignId: number,
  mine: {
    participating?: CampaignRow[];
    asGm?: CampaignRow[];
    asPlayer?: CampaignRow[];
  } | null,
): boolean => {
  if (!mine || !Number.isFinite(campaignId) || campaignId <= 0) return false;
  const ids = new Set<number>();
  for (const list of [
    mine.participating,
    mine.asGm,
    mine.asPlayer,
  ]) {
    for (const c of list || []) {
      ids.add(Number(c.id));
    }
  }
  return ids.has(Number(campaignId));
};

export const resolveAllowedCampaignId = async (
  preferredId: number,
): Promise<{ campaignId: number | null; forbidden: boolean; loggedIn: boolean }> => {
  const loggedIn = !!getAccessToken();
  if (!loggedIn) {
    return { campaignId: null, forbidden: false, loggedIn: false };
  }
  const mine = await fetchMineCampaigns();
  if (!mine) {
    const fallbackId =
      Number.isFinite(preferredId) && preferredId > 0 ? preferredId : null;
    return { campaignId: fallbackId, forbidden: false, loggedIn: true };
  }
  if (playerCanUseCampaign(preferredId, mine)) {
    return { campaignId: preferredId, forbidden: false, loggedIn: true };
  }
  const fallback = mine.participating?.[0]?.id ?? mine.asGm?.[0]?.id ?? null;
  if (fallback != null) {
    return { campaignId: Number(fallback), forbidden: preferredId > 0, loggedIn: true };
  }
  return { campaignId: null, forbidden: true, loggedIn: true };
};

export const getPlayerId = (): number => getPlayerIdFromToken();
