'use client';

import { useEffect } from 'react';
import { applySoundPref, readStoredSound } from '../../lib/sound/soundPrefs';
import {
  bindCyberAudioUnlock,
  setCyberSoundPref,
} from '../../lib/sound/cyberSounds';

/** Liga unlock do AudioContext e preferência persistida em qualquer página. */
export const SoundBootstrap = () => {
  useEffect(() => {
    const pref = readStoredSound();
    setCyberSoundPref(pref);
    applySoundPref(pref);
    bindCyberAudioUnlock();
  }, []);
  return null;
};

export default SoundBootstrap;
