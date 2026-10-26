import { apiUrl, authHeaders } from './api';
import { fetchMineCampaigns } from './campaignsApi';

export type NpcPortraitOverrides = Record<string, string>;

export const fetchNpcPortraitOverrides = async (): Promise<NpcPortraitOverrides> => {
  try {
    const res = await fetch(apiUrl('/api/npcs/portraits'));
    if (!res.ok) return {};
    const data = await res.json();
    const portraits = data?.portraits;
    if (!portraits || typeof portraits !== 'object') return {};
    return portraits as NpcPortraitOverrides;
  } catch {
    return {};
  }
};

export const patchNpcPortrait = async (
  npcId: string,
  image: string,
): Promise<{ ok: boolean; message?: string }> => {
  const res = await fetch(apiUrl(`/api/npcs/${encodeURIComponent(npcId)}/portrait`), {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ image }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      message:
        (body as { message?: string }).message ||
        'Não foi possível salvar o retrato do NPC.',
    };
  }
  return { ok: true };
};

/** Narrador de pelo menos uma campanha pode trocar fotos de NPC. */
export const canEditNpcPortraits = async (): Promise<boolean> => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token') || ''
      : '';
  if (!token) return false;
  const mine = await fetchMineCampaigns();
  return Boolean(mine?.asGm?.length);
};
