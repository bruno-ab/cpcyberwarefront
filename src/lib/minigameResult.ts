import { apiUrl, authHeaders } from './api';

export type MinigameOutcome = 'won' | 'lost';

export const reportMinigameResult = async (
  campaignId: number,
  game: string,
  outcome: MinigameOutcome,
  meta?: Record<string, unknown>,
) => {
  try {
    const res = await fetch(
      apiUrl(`/api/campaigns/${campaignId}/minigame-result`),
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ game, outcome, meta }),
      },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
