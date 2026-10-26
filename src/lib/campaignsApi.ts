import { apiFetch, authHeaders } from './api';

export type CampaignRow = {
  id: number;
  name: string;
  gmPlayerId: number;
  memberPlayerIds?: number[];
  streetCred?: number;
  eddies?: number;
  characterIds?: string[];
  npcIds?: string[];
};

export type CampaignInvite = {
  id: number;
  campaignId: number;
  email?: string | null;
  invitedPlayerId?: number | null;
  status: 'pending' | 'accepted' | 'declined';
  campaignName?: string;
  gmName?: string | null;
};

export type CampaignMember = {
  playerId: number;
  name: string;
  email?: string | null;
  role: 'gm' | 'player';
};

export type CampaignMembersResponse = {
  campaignId: number;
  members: CampaignMember[];
  pendingInvites: CampaignInvite[];
};

export type MineCampaignsResponse = {
  playerId: number;
  asGm: CampaignRow[];
  asPlayer: CampaignRow[];
  participating: CampaignRow[];
};

export type VttSceneSummary = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  sessionId: string;
  mapName?: string;
  tokenCount?: number;
};

export type ScenesListResponse = {
  campaignId: number;
  activeSceneId: string | null;
  scenes: VttSceneSummary[];
};

const authJsonHeaders = (): HeadersInit => authHeaders();

export const fetchMineCampaigns = async (): Promise<MineCampaignsResponse | null> => {
  const res = await apiFetch('/api/campaigns/mine', { headers: authJsonHeaders() });
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const createCampaign = async (name: string): Promise<CampaignRow | null> => {
  const res = await apiFetch('/api/campaigns', {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const updateCampaign = async (
  id: number,
  patch: Partial<CampaignRow>,
): Promise<CampaignRow | null> => {
  const res = await apiFetch(`/api/campaigns/${id}`, {
    method: 'PUT',
    headers: authJsonHeaders(),
    body: JSON.stringify(patch),
  });
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const fetchCampaignScenes = async (
  campaignId: number,
): Promise<ScenesListResponse | null> => {
  const res = await apiFetch(`/api/vtt/campaigns/${campaignId}/scenes`, {
    headers: authJsonHeaders(),
  });
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

/** Authenticated session snapshot (role-filtered; same rules as VTT join membership). */
export const fetchVttSession = async (
  sessionId: string,
): Promise<Record<string, unknown> | null> => {
  const res = await apiFetch(
    `/api/vtt/sessions/${encodeURIComponent(sessionId)}`,
    { headers: authJsonHeaders() },
  );
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const createScene = async (
  campaignId: number,
  body: { name: string; description?: string },
): Promise<ScenesListResponse | null> => {
  const res = await apiFetch(`/api/vtt/campaigns/${campaignId}/scenes`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(body),
  });
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const activateScene = async (
  campaignId: number,
  sceneId: string,
): Promise<boolean> => {
  const res = await apiFetch(
    `/api/vtt/campaigns/${campaignId}/scenes/${sceneId}/activate`,
    { method: 'POST', headers: authJsonHeaders() },
  );
  return res?.ok ?? false;
};

export type RosterResponse = {
  campaign: { id: number; name: string };
  characters: Array<{ id: string; name: string; role?: string; playerId?: number }>;
};

export const fetchRoster = async (campaignId: number): Promise<RosterResponse | null> => {
  const res = await apiFetch(`/api/campaigns/${campaignId}/roster`, {
    headers: authJsonHeaders(),
  });
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export type CampaignNpc = {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  threat: string;
  summary: string;
  image?: string | null;
  /** Ficha JSON local para chrome/RAM ao spawnar token NPC na mesa. */
  spawnCharacterId?: string;
};

export const fetchCampaignNpcs = async (
  campaignId: number,
): Promise<CampaignNpc[]> => {
  const res = await apiFetch(`/api/campaigns/${campaignId}/npcs`, {
    headers: authJsonHeaders(),
  });
  if (!res?.ok) return [];
  try {
    const data = await res.json();
    return Array.isArray(data?.npcs) ? data.npcs : [];
  } catch {
    return [];
  }
};

export type MyCampaignInvitesResult = {
  invites: CampaignInvite[];
  error: string | null;
};

export const fetchMyCampaignInvites = async (): Promise<MyCampaignInvitesResult> => {
  const res = await apiFetch('/api/campaigns/invites/mine', {
    headers: authJsonHeaders(),
  });
  if (!res?.ok) {
    let error = `Não foi possível carregar convites (${res?.status ?? '?'})`;
    try {
      const body = (await res?.json()) as { message?: string | string[] };
      const msg = body?.message;
      if (typeof msg === 'string') error = msg;
      else if (Array.isArray(msg)) error = msg.join(', ');
    } catch {
      /* ignore parse errors */
    }
    return { invites: [], error };
  }
  try {
    const data = await res.json();
    return {
      invites: Array.isArray(data) ? data : [],
      error: null,
    };
  } catch {
    return { invites: [], error: 'Resposta inválida ao carregar convites.' };
  }
};

export const acceptCampaignInvite = async (
  inviteId: number,
): Promise<boolean> => {
  const res = await apiFetch(`/api/campaigns/invites/${inviteId}/accept`, {
    method: 'POST',
    headers: authJsonHeaders(),
  });
  return res?.ok ?? false;
};

export const declineCampaignInvite = async (
  inviteId: number,
): Promise<boolean> => {
  const res = await apiFetch(`/api/campaigns/invites/${inviteId}/decline`, {
    method: 'POST',
    headers: authJsonHeaders(),
  });
  return res?.ok ?? false;
};

export const fetchCampaignMembers = async (
  campaignId: number,
): Promise<CampaignMembersResponse | null> => {
  const res = await apiFetch(`/api/campaigns/${campaignId}/members`, {
    headers: authJsonHeaders(),
  });
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const inviteToCampaign = async (
  campaignId: number,
  body: { email?: string; playerId?: number },
): Promise<CampaignInvite | null> => {
  const res = await apiFetch(`/api/campaigns/${campaignId}/invites`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(body),
  });
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const removeCampaignMember = async (
  campaignId: number,
  playerId: number,
): Promise<boolean> => {
  const res = await apiFetch(
    `/api/campaigns/${campaignId}/members/${playerId}`,
    { method: 'DELETE', headers: authJsonHeaders() },
  );
  return res?.ok ?? false;
};

export type CampaignLinkConflict = {
  previousCampaignId?: number;
  previousCampaignName: string;
};

const unwrapApiError = (body: Record<string, unknown> | null | undefined) => {
  if (!body) return body;
  const msg = body.message;
  if (msg && typeof msg === 'object' && !Array.isArray(msg)) {
    return { ...body, ...(msg as Record<string, unknown>) };
  }
  return body;
};

export type RosterLinkResult =
  | { ok: true }
  | { ok: false; error: string }
  | { ok: false; needsConfirm: CampaignLinkConflict };

export const addCharacterToRoster = async (
  campaignId: number,
  characterId: string,
  confirmMigration = false,
): Promise<RosterLinkResult> => {
  const res = await apiFetch(`/api/campaigns/${campaignId}/roster`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify({ characterId, confirmMigration }),
  });
  if (res?.ok) return { ok: true };
  let body: Record<string, unknown> = {};
  try {
    body = unwrapApiError((await res?.json()) as Record<string, unknown>) ?? {};
  } catch {
    /* ignore */
  }
  if (body.code === 'needs-confirm') {
    return {
      ok: false,
      needsConfirm: {
        previousCampaignId: Number(body.previousCampaignId) || undefined,
        previousCampaignName:
          String(body.previousCampaignName || '') || 'outra campanha',
      },
    };
  }
  const errMsg =
    typeof body.message === 'string'
      ? body.message
      : `Falha ao vincular personagem (${res?.status ?? '?'})`;
  return { ok: false, error: errMsg };
};

export type IdCardLinkResult =
  | { ok: true }
  | { ok: false; error: string }
  | { ok: false; needsConfirm: CampaignLinkConflict };

export const linkCampaignByIdCard = async (
  campaignId: number,
  idCard: string,
  confirmMigration = false,
): Promise<IdCardLinkResult> => {
  const res = await apiFetch(`/api/campaigns/${campaignId}/link-by-card`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify({ idCard: idCard.trim(), confirmMigration }),
  });
  if (res?.ok) return { ok: true };
  let body: Record<string, unknown> = {};
  try {
    body = unwrapApiError((await res?.json()) as Record<string, unknown>) ?? {};
  } catch {
    /* ignore */
  }
  if (body.code === 'needs-confirm') {
    return {
      ok: false,
      needsConfirm: {
        previousCampaignId: Number(body.previousCampaignId) || undefined,
        previousCampaignName:
          String(body.previousCampaignName || '') || 'outra campanha',
      },
    };
  }
  const errMsg =
    typeof body.message === 'string'
      ? body.message
      : `Falha ao vincular ID-card (${res?.status ?? '?'})`;
  return { ok: false, error: errMsg };
};
