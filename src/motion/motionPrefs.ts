export const MOTION_STORAGE_KEY = 'cp-motion';

export type MotionPref = 'on' | 'off';

export const readStoredMotion = (): MotionPref => {
  if (typeof window === 'undefined') return 'on';
  try {
    const stored = localStorage.getItem(MOTION_STORAGE_KEY);
    if (stored === 'on' || stored === 'off') return stored;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'off';
    }
  } catch {
    /* ignore */
  }
  return 'on';
};

export const applyMotion = (pref: MotionPref) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-motion', pref);
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, pref);
  } catch {
    /* ignore */
  }
};
