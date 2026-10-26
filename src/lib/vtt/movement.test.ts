import { describe, expect, it } from 'vitest';
import {
  budgetReachableCells,
  canAffordMoveTo,
  reachableCells,
  type TurnMovement,
} from './movement';

describe('vtt movement budget (client)', () => {
  it('budget reachable stays anchored to turn start after partial move', () => {
    const spent: TurnMovement = {
      tokenId: 't1',
      startX: 5,
      startY: 5,
      max: 3,
      remaining: 1,
    };
    expect(spent.remaining).toBe(1);
    expect(canAffordMoveTo(spent, 8, 5)).toBe(true);
    const budgetCells = budgetReachableCells(spent, 10, 10);
    expect(budgetCells.some((c) => c.x === 8 && c.y === 5)).toBe(true);
    const wrongHighlight = reachableCells(7, 7, spent.remaining, 10, 10);
    expect(wrongHighlight.some((c) => c.x === 8 && c.y === 5)).toBe(false);
  });
});
