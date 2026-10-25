export type VttArIntel = {
  name: string;
  affiliation?: string;
  threat?: 'low' | 'med' | 'high';
  weapons?: string[];
};

type TokenLike = {
  kind?: string;
  ownerPlayerId?: number;
  controllerPlayerId?: number;
  characterId?: number | string;
};

export const isArTargetToken = (token: TokenLike): boolean => {
  const kind = token.kind || (token.characterId ? 'runner' : 'host');
  if (kind === 'npc' || kind === 'host' || kind === 'vehicle') return true;
  if (kind === 'drone' || kind === 'summon') return false;
  if (token.ownerPlayerId != null || token.controllerPlayerId != null) {
    return false;
  }
  return kind !== 'runner';
};

export const tokenShowsNameplate = (
  token: TokenLike & { name?: string },
  opts: { showAr: boolean; myPlayerId?: number },
): boolean => {
  const mine =
    opts.myPlayerId != null &&
    (Number(token.ownerPlayerId) === Number(opts.myPlayerId) ||
      Number(token.controllerPlayerId) === Number(opts.myPlayerId));
  if (mine) return true;
  if (opts.showAr && isArTargetToken(token)) return true;
  if (!isArTargetToken(token)) return true;
  return false;
};
