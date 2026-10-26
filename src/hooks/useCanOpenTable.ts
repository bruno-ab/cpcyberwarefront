'use client';

import { useEffect, useState } from 'react';
import { fetchMineCampaigns } from '../lib/campaignsApi';
import { AUTH_CHANGED_EVENT, getAccessToken } from '../lib/authSession';

export const useCanOpenTable = (): { canOpen: boolean; loading: boolean } => {
  const [canOpen, setCanOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = async () => {
      const token = getAccessToken();
      if (!token) {
        setCanOpen(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const mine = await fetchMineCampaigns();
        const has =
          (mine?.participating?.length ?? 0) > 0 ||
          (mine?.asGm?.length ?? 0) > 0 ||
          (mine?.asPlayer?.length ?? 0) > 0;
        setCanOpen(has);
      } catch {
        setCanOpen(false);
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

  return { canOpen, loading };
};
