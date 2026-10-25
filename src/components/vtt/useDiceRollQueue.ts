'use client';

import { useCallback, useRef, useState } from 'react';
import type { DiceReveal } from './diceDecodeUtils';

export type DiceOverlayState = {
  active: boolean;
  reveal: DiceReveal | null;
  queued: number;
};

const idle = (): DiceOverlayState => ({
  active: false,
  reveal: null,
  queued: 0,
});

/** Serializes `vtt:dice` reveals so combat rolls do not overwrite each other. */
export function useDiceRollQueue() {
  const pending = useRef<DiceReveal[]>([]);
  const [state, setState] = useState<DiceOverlayState>(idle);

  const enqueue = useCallback((reveal: DiceReveal) => {
    setState((prev) => {
      if (!prev.active || !prev.reveal) {
        return { active: true, reveal, queued: pending.current.length };
      }
      pending.current.push(reveal);
      return { ...prev, queued: pending.current.length };
    });
  }, []);

  const completeCurrent = useCallback(() => {
    const next = pending.current.shift();
    if (next) {
      setState({ active: true, reveal: next, queued: pending.current.length });
      return;
    }
    setState(idle());
  }, []);

  const skipAll = useCallback(() => {
    pending.current = [];
    setState(idle());
  }, []);

  return { state, enqueue, completeCurrent, skipAll };
}
