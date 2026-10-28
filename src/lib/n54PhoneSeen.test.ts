import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  countN54Unread,
  markN54FeedSeen,
  readN54SeenIds,
} from './n54PhoneSeen';

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
  });
});

describe('n54PhoneSeen', () => {
  it('counts unread headlines', () => {
    const feed = [{ id: 'a' }, { id: 'b' }];
    expect(countN54Unread('char-1', feed)).toBe(2);
    markN54FeedSeen('char-1', [{ id: 'a' }]);
    expect(countN54Unread('char-1', feed)).toBe(1);
    expect(readN54SeenIds('char-1').has('a')).toBe(true);
  });
});
