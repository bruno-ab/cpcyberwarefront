'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applySoundPref,
  readStoredSound,
  type SoundPref,
} from './soundPrefs';
import {
  bindCyberAudioUnlock,
  playCyberSound,
  setCyberSoundPref,
  type CyberSound,
} from './cyberSounds';

export const useSound = () => {
  const [sound, setSoundState] = useState<SoundPref>('on');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredSound();
    setSoundState(stored);
    setCyberSoundPref(stored);
    applySoundPref(stored);
    bindCyberAudioUnlock();
    setMounted(true);
  }, []);

  const setSound = useCallback((pref: SoundPref) => {
    setSoundState(pref);
    setCyberSoundPref(pref);
    applySoundPref(pref);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundState((prev) => {
      const next: SoundPref = prev === 'on' ? 'off' : 'on';
      setCyberSoundPref(next);
      applySoundPref(next);
      if (next === 'on') playCyberSound('ui');
      return next;
    });
  }, []);

  const play = useCallback((id: CyberSound, volume?: number) => {
    playCyberSound(id, { volume });
  }, []);

  return {
    sound,
    setSound,
    toggleSound,
    soundOn: sound === 'on',
    mounted,
    play,
  };
};
