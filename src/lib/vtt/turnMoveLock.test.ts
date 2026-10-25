import { describe, expect, it } from 'vitest';
import { canMoveTokenForRole, isTokenMoveLockedToTurn } from './turnMoveLock';

describe('turnMoveLock', () => {
  const state = {
    combat: { active: true },
    initiative: [{ tokenId: 'tok-a' }],
    turnIndex: 0,
    rules: { tokenMoveOnTurnOnly: true },
  };

  it('locks player to current token only', () => {
    expect(isTokenMoveLockedToTurn(state)).toBe(true);
    expect(canMoveTokenForRole(state, 'tok-a', false)).toBe(true);
    expect(canMoveTokenForRole(state, 'tok-b', false)).toBe(false);
    expect(canMoveTokenForRole(state, 'tok-b', true)).toBe(true);
  });
});
