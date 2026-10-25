/** Client-side mirror of API vtt-cover aim helpers (keep in sync). */

export type RangeBandId = 'close' | 'medium' | 'long' | 'out';
export type CoverLevel = 'none' | 'partial' | 'total';

export type AimWall = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  door?: boolean;
  open?: boolean;
};

export type AimPreview = {
  distance: number;
  range: { band: RangeBandId; penalty: number; label: string };
  cover: { level: CoverLevel; penalty: number; label: string; hits: number };
  modifier: number;
  canShoot: boolean;
  clearLos: boolean;
  summary: string;
};

export const chebyshev = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));

const segmentsIntersect = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
) => {
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(d) < 1e-9) return false;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / d;
  return t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98;
};

export const coverBetween = (
  walls: AimWall[],
  ax: number,
  ay: number,
  bx: number,
  by: number,
): { level: CoverLevel; penalty: number; hits: number } => {
  let hits = 0;
  for (const w of walls) {
    if (w.door && w.open) continue;
    if (segmentsIntersect(ax, ay, bx, by, w.x1, w.y1, w.x2, w.y2)) hits += 1;
  }
  if (hits >= 2) return { level: 'total', penalty: 3, hits };
  if (hits === 1) return { level: 'partial', penalty: 1, hits };
  return { level: 'none', penalty: 0, hits };
};

export const rangeBand = (
  dist: number,
): { band: RangeBandId; penalty: number } => {
  if (dist <= 3) return { band: 'close', penalty: 0 };
  if (dist <= 8) return { band: 'medium', penalty: 1 };
  if (dist <= 15) return { band: 'long', penalty: 2 };
  return { band: 'out', penalty: 99 };
};

export const rangeBandLabel = (band: RangeBandId, penalty: number) => {
  switch (band) {
    case 'close':
      return 'curto (+0)';
    case 'medium':
      return `médio (+${penalty} dif)`;
    case 'long':
      return `longo (+${penalty} dif)`;
    default:
      return 'fora de alcance';
  }
};

export const coverLabel = (level: CoverLevel, penalty: number) => {
  switch (level) {
    case 'partial':
      return `cobertura parcial (+${penalty} dif)`;
    case 'total':
      return `cobertura total (+${penalty} dif)`;
    default:
      return 'LoS limpa';
  }
};

export const buildAimPreview = (
  walls: AimWall[],
  ax: number,
  ay: number,
  bx: number,
  by: number,
): AimPreview => {
  const distance = chebyshev(ax, ay, bx, by);
  const range = rangeBand(distance);
  const cover = coverBetween(walls, ax, ay, bx, by);
  const modifier =
    range.band === 'out' ? range.penalty : range.penalty + cover.penalty;
  const canShoot = range.band !== 'out';
  const clearLos = cover.level === 'none';
  const rangeLbl = rangeBandLabel(range.band, range.penalty);
  const coverLbl = coverLabel(cover.level, cover.penalty);
  const modLbl =
    range.band === 'out'
      ? 'fora'
      : modifier === 0
        ? '+0 dif'
        : `+${modifier} dif`;
  return {
    distance,
    range: { ...range, label: rangeLbl },
    cover: { ...cover, label: coverLbl },
    modifier,
    canShoot,
    clearLos,
    summary: `${distance}u · ${rangeLbl} · ${coverLbl} · ${modLbl}`,
  };
};

export const AIM_RANGE_RINGS = [
  { radius: 3, band: 'close' as const, label: 'curto' },
  { radius: 8, band: 'medium' as const, label: 'médio' },
  { radius: 15, band: 'long' as const, label: 'longo' },
];
