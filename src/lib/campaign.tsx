'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiUrl, authHeaders } from './api';
import type { CampaignHeat, HeatEffects } from './heat';
import { DEFAULT_HEAT } from './heat';
import { getAccessToken } from './authSession';
import {
  CP_CAMPAIGN_STORAGE_KEY,
  clearStoredCampaignId,
  resolveAllowedCampaignId,
} from './campaignAccess';

const STORAGE_KEY = CP_CAMPAIGN_STORAGE_KEY;

type CampaignSummary = {
  id: number;
  name: string;
  streetCred?: number;
  eddies?: number;
  heat?: CampaignHeat;
};

type CampaignContextValue = {
  campaignId: number;
  setCampaignId: (id: number) => void;
  campaign: CampaignSummary | null;
  heat: CampaignHeat;
  effects: HeatEffects | null;
  refresh: () => Promise<void>;
  loading: boolean;
};

const CampaignContext = createContext<CampaignContextValue | null>(null);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaignId, setCampaignIdState] = useState(1);
  const [campaign, setCampaign] = useState<CampaignSummary | null>(null);
  const [effects, setEffects] = useState<HeatEffects | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) setCampaignIdState(n);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setCampaignId = useCallback((id: number) => {
    setCampaignIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (!getAccessToken()) {
        setCampaign(null);
        setEffects(null);
        return;
      }
      let allowed: Awaited<ReturnType<typeof resolveAllowedCampaignId>>;
      try {
        allowed = await resolveAllowedCampaignId(campaignId);
      } catch {
        allowed = {
          campaignId: campaignId > 0 ? campaignId : null,
          forbidden: false,
          loggedIn: true,
        };
      }
      if (!allowed.loggedIn) {
        setCampaign(null);
        return;
      }
      if (allowed.forbidden && allowed.campaignId == null) {
        clearStoredCampaignId();
        setCampaign(null);
        return;
      }
      const effectiveId = allowed.campaignId ?? campaignId;
      if (effectiveId !== campaignId) {
        setCampaignIdState(effectiveId);
        try {
          localStorage.setItem(STORAGE_KEY, String(effectiveId));
        } catch {
          /* ignore */
        }
      }
      const [camp, heatRes] = await Promise.all([
        fetch(apiUrl(`/api/campaigns/${effectiveId}`), {
          headers: authHeaders(),
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch(apiUrl(`/api/campaigns/${effectiveId}/heat`), {
          headers: authHeaders(),
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);
      if (camp) setCampaign(camp);
      if (heatRes?.effects) setEffects(heatRes.effects);
      if (heatRes?.heat && camp) {
        setCampaign({ ...camp, heat: heatRes.heat });
      }
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<CampaignContextValue>(
    () => ({
      campaignId,
      setCampaignId,
      campaign,
      heat: campaign?.heat || DEFAULT_HEAT,
      effects,
      refresh,
      loading,
    }),
    [campaignId, setCampaignId, campaign, effects, refresh, loading],
  );

  return (
    <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>
  );
};

export const useCampaign = (): CampaignContextValue => {
  const ctx = useContext(CampaignContext);
  if (!ctx) {
    return {
      campaignId: 1,
      setCampaignId: () => undefined,
      campaign: null,
      heat: DEFAULT_HEAT,
      effects: null,
      refresh: async () => undefined,
      loading: false,
    };
  }
  return ctx;
};
