/**
 * Sons cyberpunk sintetizados via Web Audio API — sem assets binários.
 * Tom: blips de HUD, jack NET, glitch ICE, arpejos de breach.
 */

import { readStoredSound, type SoundPref } from './soundPrefs';

export type CyberSound =
  | 'ui'
  | 'confirm'
  | 'deny'
  | 'jack'
  | 'key'
  | 'correct'
  | 'wrong'
  | 'leak'
  | 'alarm'
  | 'win'
  | 'lose'
  | 'glitch'
  | 'scan'
  | 'pick'
  | 'crash'
  | 'install'
  | 'reboot'
  | 'coin'
  | 'lock'
  | 'surge';

type PlayOpts = {
  volume?: number;
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;
let pref: SoundPref = 'on';
let listenersBound = false;

const ensureCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }
  return ctx;
};

const now = () => ensureCtx()?.currentTime ?? 0;

const tone = (
  freq: number,
  dur: number,
  type: OscillatorType = 'square',
  opts: {
    gain?: number;
    attack?: number;
    detune?: number;
    delay?: number;
    slideTo?: number;
  } = {},
) => {
  const audio = ensureCtx();
  if (!audio || !master) return;
  const t0 = audio.currentTime + (opts.delay || 0);
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.slideTo != null) {
    osc.frequency.linearRampToValueAtTime(opts.slideTo, t0 + dur);
  }
  if (opts.detune) osc.detune.setValueAtTime(opts.detune, t0);
  const peak = opts.gain ?? 0.18;
  const atk = opts.attack ?? 0.008;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(atk + 0.01, dur));
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
};

const noiseBurst = (dur: number, gain = 0.12, delay = 0) => {
  const audio = ensureCtx();
  if (!audio || !master) return;
  const len = Math.floor(audio.sampleRate * dur);
  const buffer = audio.createBuffer(1, len, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const g = audio.createGain();
  const filter = audio.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800 + Math.random() * 2200;
  filter.Q.value = 0.7;
  const t0 = audio.currentTime + delay;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
};

const playPatch = (id: CyberSound, volume = 1) => {
  const v = volume;
  switch (id) {
    case 'ui':
      tone(920, 0.045, 'square', { gain: 0.08 * v });
      tone(1400, 0.03, 'square', { gain: 0.05 * v, delay: 0.02 });
      break;
    case 'confirm':
      tone(520, 0.07, 'triangle', { gain: 0.12 * v });
      tone(780, 0.09, 'triangle', { gain: 0.1 * v, delay: 0.05 });
      tone(1040, 0.11, 'sine', { gain: 0.08 * v, delay: 0.1 });
      break;
    case 'deny':
      tone(220, 0.14, 'sawtooth', { gain: 0.1 * v, slideTo: 110 });
      noiseBurst(0.08, 0.06 * v, 0.02);
      break;
    case 'jack':
      tone(180, 0.12, 'sawtooth', { gain: 0.1 * v, slideTo: 420 });
      tone(640, 0.08, 'square', { gain: 0.09 * v, delay: 0.08 });
      tone(960, 0.06, 'square', { gain: 0.07 * v, delay: 0.14 });
      noiseBurst(0.05, 0.05 * v, 0.1);
      break;
    case 'key':
      tone(1100 + Math.random() * 400, 0.028, 'square', {
        gain: 0.045 * v,
      });
      break;
    case 'correct':
      tone(660, 0.05, 'triangle', { gain: 0.1 * v });
      tone(990, 0.07, 'triangle', { gain: 0.09 * v, delay: 0.04 });
      break;
    case 'wrong':
      tone(160, 0.1, 'sawtooth', { gain: 0.11 * v });
      tone(120, 0.12, 'square', { gain: 0.08 * v, delay: 0.05 });
      break;
    case 'leak':
      tone(90, 0.16, 'sawtooth', { gain: 0.12 * v, slideTo: 40 });
      noiseBurst(0.12, 0.08 * v);
      break;
    case 'alarm':
      for (let i = 0; i < 3; i++) {
        tone(880, 0.07, 'square', { gain: 0.09 * v, delay: i * 0.12 });
        tone(440, 0.07, 'square', {
          gain: 0.08 * v,
          delay: i * 0.12 + 0.06,
        });
      }
      break;
    case 'win':
      [523, 659, 784, 1046].forEach((f, i) => {
        tone(f, 0.12, 'triangle', { gain: 0.11 * v, delay: i * 0.07 });
        tone(f * 2, 0.08, 'sine', {
          gain: 0.04 * v,
          delay: i * 0.07 + 0.02,
        });
      });
      break;
    case 'lose':
      tone(400, 0.15, 'sawtooth', { gain: 0.1 * v, slideTo: 80 });
      tone(200, 0.2, 'square', { gain: 0.08 * v, delay: 0.08, slideTo: 60 });
      noiseBurst(0.2, 0.1 * v, 0.05);
      break;
    case 'glitch':
      noiseBurst(0.09, 0.14 * v);
      tone(300 + Math.random() * 900, 0.06, 'sawtooth', {
        gain: 0.08 * v,
        slideTo: 80 + Math.random() * 200,
      });
      break;
    case 'scan':
      tone(240, 0.22, 'sine', { gain: 0.07 * v, slideTo: 1600 });
      tone(1600, 0.1, 'sine', { gain: 0.04 * v, delay: 0.18, slideTo: 400 });
      break;
    case 'pick':
      tone(740, 0.04, 'square', { gain: 0.09 * v });
      tone(1180, 0.05, 'triangle', { gain: 0.07 * v, delay: 0.03 });
      break;
    case 'crash':
      noiseBurst(0.14, 0.16 * v);
      tone(90, 0.18, 'sawtooth', { gain: 0.14 * v, slideTo: 30 });
      tone(1500, 0.05, 'square', { gain: 0.08 * v, delay: 0.02 });
      break;
    case 'install':
      tone(110, 0.35, 'sine', { gain: 0.08 * v });
      tone(165, 0.35, 'triangle', { gain: 0.05 * v, detune: 8 });
      for (let i = 0; i < 5; i++) {
        tone(400 + i * 90, 0.05, 'square', {
          gain: 0.05 * v,
          delay: 0.08 + i * 0.07,
        });
      }
      break;
    case 'reboot':
      tone(60, 0.25, 'sine', { gain: 0.1 * v, slideTo: 220 });
      tone(220, 0.2, 'triangle', { gain: 0.09 * v, delay: 0.2, slideTo: 440 });
      tone(880, 0.15, 'sine', { gain: 0.07 * v, delay: 0.38 });
      noiseBurst(0.06, 0.05 * v, 0.4);
      break;
    case 'coin':
      tone(980, 0.05, 'square', { gain: 0.09 * v });
      tone(1480, 0.08, 'triangle', { gain: 0.08 * v, delay: 0.04 });
      break;
    case 'lock':
      tone(320, 0.06, 'square', { gain: 0.08 * v });
      tone(280, 0.08, 'square', { gain: 0.07 * v, delay: 0.07 });
      tone(520, 0.1, 'triangle', { gain: 0.09 * v, delay: 0.16 });
      break;
    case 'surge':
      tone(80, 0.2, 'sawtooth', { gain: 0.12 * v, slideTo: 600 });
      noiseBurst(0.18, 0.12 * v, 0.04);
      tone(1200, 0.08, 'square', { gain: 0.07 * v, delay: 0.12 });
      break;
    default:
      break;
  }
};

export const unlockCyberAudio = async () => {
  const audio = ensureCtx();
  if (!audio) return;
  if (audio.state === 'suspended') {
    try {
      await audio.resume();
    } catch {
      /* ignore */
    }
  }
  unlocked = audio.state === 'running';
};

export const bindCyberAudioUnlock = () => {
  if (typeof window === 'undefined' || listenersBound) return;
  listenersBound = true;
  pref = readStoredSound();
  const unlock = () => {
    void unlockCyberAudio();
  };
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true });
};

export const setCyberSoundPref = (next: SoundPref) => {
  pref = next;
};

export const getCyberSoundPref = (): SoundPref => pref;

export const playCyberSound = (id: CyberSound, opts: PlayOpts = {}) => {
  if (typeof window === 'undefined') return;
  if (pref === 'off' || readStoredSound() === 'off') return;
  const audio = ensureCtx();
  if (!audio) return;
  if (audio.state === 'suspended') {
    void audio.resume().then(() => {
      unlocked = true;
      playPatch(id, opts.volume ?? 1);
    });
    return;
  }
  unlocked = true;
  playPatch(id, opts.volume ?? 1);
};
