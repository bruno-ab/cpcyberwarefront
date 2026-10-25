/**
 * SFX cyberpunk: samples MyInstants (+ fallback Web Audio sintetizado).
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

type SampleSpec = {
  src: string;
  /** Corta o clip (ms) — muitos MP3 do MyInstants são longos. */
  maxMs?: number;
  /** Volume relativo do sample (0–1 antes do master). */
  gain?: number;
};

const BASE = '/sounds/cyberpunk';

/** Mapa: evento → sample baixado do MyInstants. */
const SAMPLES: Record<CyberSound, SampleSpec> = {
  ui: { src: `${BASE}/blip.mp3`, maxMs: 280, gain: 0.35 },
  confirm: { src: `${BASE}/message.mp3`, maxMs: 700, gain: 0.55 },
  deny: { src: `${BASE}/alert-soft.mp3`, maxMs: 600, gain: 0.5 },
  jack: { src: `${BASE}/phone.mp3`, maxMs: 1400, gain: 0.45 },
  key: { src: `${BASE}/blip.mp3`, maxMs: 120, gain: 0.22 },
  correct: { src: `${BASE}/message.mp3`, maxMs: 450, gain: 0.45 },
  wrong: { src: `${BASE}/alert.mp3`, maxMs: 500, gain: 0.5 },
  leak: { src: `${BASE}/alert.mp3`, maxMs: 550, gain: 0.55 },
  alarm: { src: `${BASE}/alarm-cop.mp3`, maxMs: 1600, gain: 0.5 },
  win: { src: `${BASE}/message.mp3`, maxMs: 900, gain: 0.6 },
  lose: { src: `${BASE}/police.mp3`, maxMs: 1600, gain: 0.45 },
  glitch: { src: `${BASE}/drop.mp3`, maxMs: 700, gain: 0.4 },
  scan: { src: `${BASE}/ringtone.mp3`, maxMs: 900, gain: 0.35 },
  pick: { src: `${BASE}/blip.mp3`, maxMs: 200, gain: 0.3 },
  crash: { src: `${BASE}/drop.mp3`, maxMs: 900, gain: 0.5 },
  install: { src: `${BASE}/sfx.mp3`, maxMs: 1800, gain: 0.4 },
  reboot: { src: `${BASE}/ui-2077.mp3`, maxMs: 2000, gain: 0.4 },
  coin: { src: `${BASE}/message.mp3`, maxMs: 500, gain: 0.5 },
  lock: { src: `${BASE}/alert-soft.mp3`, maxMs: 700, gain: 0.45 },
  surge: { src: `${BASE}/alarm-synth.mp3`, maxMs: 1400, gain: 0.4 },
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let pref: SoundPref = 'on';
let listenersBound = false;
const cache = new Map<string, HTMLAudioElement>();
const playing = new Set<HTMLAudioElement>();

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

/** Fallback sintético se o MP3 falhar. */
const playSynth = (id: CyberSound, volume = 1) => {
  const v = volume;
  switch (id) {
    case 'ui':
      tone(920, 0.045, 'square', { gain: 0.08 * v });
      tone(1400, 0.03, 'square', { gain: 0.05 * v, delay: 0.02 });
      break;
    case 'confirm':
    case 'correct':
    case 'coin':
    case 'win':
      tone(520, 0.07, 'triangle', { gain: 0.12 * v });
      tone(780, 0.09, 'triangle', { gain: 0.1 * v, delay: 0.05 });
      tone(1040, 0.11, 'sine', { gain: 0.08 * v, delay: 0.1 });
      break;
    case 'deny':
    case 'wrong':
    case 'leak':
      tone(220, 0.14, 'sawtooth', { gain: 0.1 * v, slideTo: 110 });
      noiseBurst(0.08, 0.06 * v, 0.02);
      break;
    case 'jack':
      tone(180, 0.12, 'sawtooth', { gain: 0.1 * v, slideTo: 420 });
      tone(640, 0.08, 'square', { gain: 0.09 * v, delay: 0.08 });
      break;
    case 'key':
    case 'pick':
      tone(1100 + Math.random() * 400, 0.028, 'square', { gain: 0.045 * v });
      break;
    case 'alarm':
    case 'lose':
      for (let i = 0; i < 3; i++) {
        tone(880, 0.07, 'square', { gain: 0.09 * v, delay: i * 0.12 });
        tone(440, 0.07, 'square', { gain: 0.08 * v, delay: i * 0.12 + 0.06 });
      }
      break;
    case 'glitch':
    case 'crash':
    case 'surge':
      noiseBurst(0.12, 0.14 * v);
      tone(90, 0.18, 'sawtooth', { gain: 0.12 * v, slideTo: 30 });
      break;
    case 'scan':
      tone(240, 0.22, 'sine', { gain: 0.07 * v, slideTo: 1600 });
      break;
    case 'install':
    case 'reboot':
      tone(110, 0.35, 'sine', { gain: 0.08 * v });
      tone(220, 0.2, 'triangle', { gain: 0.09 * v, delay: 0.2, slideTo: 440 });
      break;
    case 'lock':
      tone(320, 0.06, 'square', { gain: 0.08 * v });
      tone(520, 0.1, 'triangle', { gain: 0.09 * v, delay: 0.16 });
      break;
    default:
      break;
  }
};

const getAudio = (src: string): HTMLAudioElement => {
  let el = cache.get(src);
  if (!el) {
    el = new Audio(src);
    el.preload = 'auto';
    cache.set(src, el);
  }
  return el;
};

const playSample = (spec: SampleSpec, volume: number): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const base = getAudio(spec.src);
    const el = base.cloneNode(true) as HTMLAudioElement;
    el.volume = Math.max(0, Math.min(1, (spec.gain ?? 0.5) * volume));
    el.currentTime = 0;
    playing.add(el);
    const cleanup = () => {
      playing.delete(el);
      el.removeAttribute('src');
      el.load();
    };
    el.addEventListener('ended', cleanup, { once: true });
    void el.play().catch(() => {
      cleanup();
    });
    if (spec.maxMs) {
      window.setTimeout(() => {
        try {
          el.pause();
          el.currentTime = 0;
        } catch {
          /* ignore */
        }
        cleanup();
      }, spec.maxMs);
    }
    return true;
  } catch {
    return false;
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
  // Preload dos samples curtos mais usados
  ['blip.mp3', 'message.mp3', 'alert.mp3', 'alert-soft.mp3'].forEach((f) => {
    try {
      getAudio(`${BASE}/${f}`).load();
    } catch {
      /* ignore */
    }
  });
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
  if (next === 'off') {
    playing.forEach((el) => {
      try {
        el.pause();
      } catch {
        /* ignore */
      }
    });
    playing.clear();
  }
};

export const getCyberSoundPref = (): SoundPref => pref;

export const playCyberSound = (id: CyberSound, opts: PlayOpts = {}) => {
  if (typeof window === 'undefined') return;
  if (pref === 'off' || readStoredSound() === 'off') return;
  const volume = opts.volume ?? 1;
  const audio = ensureCtx();
  if (audio?.state === 'suspended') {
    void audio.resume();
  }
  const spec = SAMPLES[id];
  const ok = spec ? playSample(spec, volume) : false;
  if (!ok) playSynth(id, volume);
};
