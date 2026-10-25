export const SOUND_STORAGE_KEY = 'cp-sound';

export type SoundPref = 'on' | 'off';

export const readStoredSound = (): SoundPref => {
  if (typeof window === 'undefined') return 'on';
  try {
    const stored = localStorage.getItem(SOUND_STORAGE_KEY);
    if (stored === 'on' || stored === 'off') return stored;
  } catch {
    /* ignore */
  }
  return 'on';
};

export const applySoundPref = (pref: SoundPref) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-sound', pref);
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, pref);
  } catch {
    /* ignore */
  }
};
