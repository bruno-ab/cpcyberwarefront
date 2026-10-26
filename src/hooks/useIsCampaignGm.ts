'use client';

import { useEffect, useState } from 'react';
import { fetchMineCampaigns } from '../lib/campaignsApi';
import { AUTH_CHANGED_EVENT, getAccessToken } from '../lib/authSession';

/** True when the logged-in account narrates at least one campaign. */
export const useIsCampaignGm = (): { isGm: boolean; loading: boolean } => {
  const [isGm, setIsGm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = async () => {
      if (!getAccessToken()) {
        setIsGm(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const mine = await fetchMineCampaigns();
        setIsGm((mine?.asGm?.length ?? 0) > 0);
      } catch {
        setIsGm(false);
      } finally {
        setLoading(false);
      }
    };
    void sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return { isGm, loading };
};
