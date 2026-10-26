import { describe, expect, it } from 'vitest';
import { vttJoinErrorMessage } from './vttJoinMessages';

describe('vttJoinErrorMessage', () => {
  it('maps known join errors', () => {
    expect(vttJoinErrorMessage('roster-required')).toMatch(/ficha/i);
    expect(vttJoinErrorMessage('scene-not-available')).toMatch(/publicar/i);
    expect(vttJoinErrorMessage('forbidden')).toMatch(/convite/i);
  });
});
