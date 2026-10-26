import { apiUrl, authHeaders } from './api';

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

export const fetchMineCampaigns = async (): Promise<MineCampaignsResponse | null> => {
  const res = await fetch(apiUrl('/api/campaigns/mine'), {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
};

export const createCampaign = async (name: string): Promise<CampaignRow | null> => {
  const res = await fetch(apiUrl('/api/campaigns'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) return null;
  return res.json();
};

export const updateCampaign = async (
  id: number,
  patch: Partial<CampaignRow>,
): Promise<CampaignRow | null> => {
  const res = await fetch(apiUrl(`/api/campaigns/${id}`), {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  return res.json();
};

export const fetchCampaignScenes = async (
  campaignId: number,
): Promise<ScenesListResponse | null> => {
  const res = await fetch(apiUrl(`/api/vtt/campaigns/${campaignId}/scenes`), {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
};

export const createScene = async (
  campaignId: number,
  body: { name: string; description?: string },
): Promise<ScenesListResponse | null> => {
  const res = await fetch(apiUrl(`/api/vtt/campaigns/${campaignId}/scenes`), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
};

export const activateScene = async (
  campaignId: number,
  sceneId: string,
): Promise<boolean> => {
  const res = await fetch(
    apiUrl(`/api/vtt/campaigns/${campaignId}/scenes/${sceneId}/activate`),
    { method: 'POST', headers: authHeaders() },
  );
  return res.ok;
};

export type RosterResponse = {
  campaign: { id: number; name: string };
  characters: Array<{ id: string; name: string; role?: string; playerId?: number }>;
};

export const fetchRoster = async (campaignId: number): Promise<RosterResponse | null> => {
  const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/roster`), {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
};

export type CampaignNpc = {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  threat: string;
  summary: string;
};

export const fetchCampaignNpcs = async (
  campaignId: number,
): Promise<CampaignNpc[]> => {
  const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/npcs`), {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.npcs) ? data.npcs : [];
};

export const fetchMyCampaignInvites = async (): Promise<CampaignInvite[]> => {
  const res = await fetch(apiUrl('/api/campaigns/invites/mine'), {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const acceptCampaignInvite = async (
  inviteId: number,
): Promise<boolean> => {
  const res = await fetch(apiUrl(`/api/campaigns/invites/${inviteId}/accept`), {
    method: 'POST',
    headers: authHeaders(),
  });
  return res.ok;
};

export const declineCampaignInvite = async (
  inviteId: number,
): Promise<boolean> => {
  const res = await fetch(
    apiUrl(`/api/campaigns/invites/${inviteId}/decline`),
    { method: 'POST', headers: authHeaders() },
  );
  return res.ok;
};

export const fetchCampaignMembers = async (
  campaignId: number,
): Promise<CampaignMembersResponse | null> => {
  const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/members`), {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
};

export const inviteToCampaign = async (
  campaignId: number,
  body: { email?: string; playerId?: number },
): Promise<CampaignInvite | null> => {
  const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/invites`), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
};

export const removeCampaignMember = async (
  campaignId: number,
  playerId: number,
): Promise<boolean> => {
  const res = await fetch(
    apiUrl(`/api/campaigns/${campaignId}/members/${playerId}`),
    { method: 'DELETE', headers: authHeaders() },
  );
  return res.ok;
};
