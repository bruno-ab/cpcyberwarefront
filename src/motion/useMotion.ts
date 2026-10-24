'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applyMotion,
  MotionPref,
  readStoredMotion,
} from './motionPrefs';

export const useMotion = () => {
  const [motion, setMotionState] = useState<MotionPref>('on');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredMotion();
    setMotionState(stored);
    applyMotion(stored);
    setMounted(true);
  }, []);

  const setMotion = useCallback((pref: MotionPref) => {
    setMotionState(pref);
    applyMotion(pref);
  }, []);

  const toggleMotion = useCallback(() => {
    setMotionState((prev) => {
      const next: MotionPref = prev === 'on' ? 'off' : 'on';
      applyMotion(next);
      return next;
    });
  }, []);

  return { motion, setMotion, toggleMotion, animationsOn: motion === 'on', mounted };
};
