export type TurnMoveLockState = {
  combat?: { active: boolean } | null;
  initiative?: Array<{ tokenId: string }>;
  turnIndex?: number;
  rules?: { tokenMoveOnTurnOnly?: boolean };
};

export const isTokenMoveLockedToTurn = (state: TurnMoveLockState | null | undefined) =>
  !!state?.rules?.tokenMoveOnTurnOnly &&
  !!state?.combat?.active &&
  (state?.initiative?.length ?? 0) > 0;

export const currentTurnTokenId = (state: TurnMoveLockState | null | undefined) =>
  state?.initiative?.[state.turnIndex ?? 0]?.tokenId ?? null;

export const canMoveTokenForRole = (
  state: TurnMoveLockState | null | undefined,
  tokenId: string,
  isGm: boolean,
) => {
  if (isGm) return true;
  if (!isTokenMoveLockedToTurn(state)) return true;
  const cur = currentTurnTokenId(state);
  return !!cur && cur === tokenId;
};

export const tokenMoveBlockedHint = (state: TurnMoveLockState | null | undefined) =>
  isTokenMoveLockedToTurn(state)
    ? 'Só move no próprio turno (combate)'
    : null;
