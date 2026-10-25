import { describe, expect, it } from 'vitest';
import {
  buildLockWaves,
  computeVerdict,
  parseRollKind,
  rawSuccessCount,
} from './diceDecodeUtils';

describe('computeVerdict', () => {
  it('flags botch from server', () => {
    expect(computeVerdict({ successes: 0, botch: true })).toBe('botch');
  });
  it('flags exceptional at 5+ successes', () => {
    expect(computeVerdict({ successes: 5, botch: false })).toBe('exceptional');
  });
  it('flags common failure with zero net', () => {
    expect(computeVerdict({ successes: 0, botch: false })).toBe('failure');
  });
  it('flags normal success', () => {
    expect(computeVerdict({ successes: 2, botch: false })).toBe('success');
  });
});

describe('parseRollKind', () => {
  it('detects initiative labels', () => {
    expect(parseRollKind('Iniciativa Dex+Alertness')).toBe('initiative');
  });
  it('detects hack labels', () => {
    expect(parseRollKind('NET ICE bypass')).toBe('hack');
  });
});

describe('buildLockWaves', () => {
  it('distributes indices across five beats', () => {
    const waves = buildLockWaves(7, 5);
    expect(waves.flat().sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(waves[0]).toEqual([0, 5]);
  });
});

describe('rawSuccessCount', () => {
  it('counts difficulty hits before cancel', () => {
    expect(rawSuccessCount([6, 1, 8, 3], 6)).toBe(2);
  });
});
