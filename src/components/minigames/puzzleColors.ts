export type GemColor = 'cyan' | 'magenta' | 'yellow' | 'lime' | 'orange';

export const GEM_COLORS: GemColor[] = [
  'cyan',
  'magenta',
  'yellow',
  'lime',
  'orange',
];

export const GEM_HEX: Record<GemColor, string> = {
  cyan: '#2be4ea',
  magenta: '#ff2bd6',
  yellow: '#fed33f',
  lime: '#51ff00',
  orange: '#ff7d16',
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
