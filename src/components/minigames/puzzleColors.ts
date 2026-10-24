export type GemColor = 'cyan' | 'magenta' | 'yellow' | 'violet' | 'alert';

export const GEM_COLORS: GemColor[] = [
  'cyan',
  'magenta',
  'yellow',
  'violet',
  'alert',
];

/** Neon cyberpunk palette */
export const GEM_HEX: Record<GemColor, string> = {
  cyan: '#2be4ea',
  magenta: '#ff2bd6',
  yellow: '#fed33f',
  violet: '#b14cff',
  alert: '#ff4d6d',
};

export const GEM_GLOW: Record<GemColor, string> = {
  cyan: '0 0 12px #2be4ea99',
  magenta: '0 0 12px #ff2bd699',
  yellow: '0 0 12px #fed33f99',
  violet: '0 0 12px #b14cff99',
  alert: '0 0 12px #ff4d6d99',
};

export const GEM_LABELS: Record<GemColor, string> = {
  cyan: 'ICE',
  magenta: 'NET',
  yellow: 'EDDIE',
  violet: 'CHROME',
  alert: 'BLOOD',
};

export type PuzzleSpeed = 'lento' | 'rua' | 'netrun' | 'blackwall';

export const SPEED_MS: Record<PuzzleSpeed, number> = {
  lento: 900,
  rua: 550,
  netrun: 320,
  blackwall: 180,
};

export const SPEED_LABELS: Record<PuzzleSpeed, string> = {
  lento: 'Lento',
  rua: 'Rua',
  netrun: 'Netrun',
  blackwall: 'Blackwall',
};
