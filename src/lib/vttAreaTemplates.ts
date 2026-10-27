export type AreaTemplateKind = 'cone' | 'burst' | 'line';

export type VttAreaTemplate = {
  id: string;
  kind: AreaTemplateKind;
  x: number;
  y: number;
  dirX?: number;
  dirY?: number;
  length?: number;
  radius?: number;
  floor?: number;
  label?: string;
};

const cheb = (ax: number, ay: number, bx: number, by: number) =>
  Math.max(Math.abs(ax - bx), Math.abs(ay - by));

export const cellsForAreaTemplate = (
  t: VttAreaTemplate,
): Array<{ x: number; y: number }> => {
  const out = new Set<string>();
  const add = (x: number, y: number) => out.add(`${x},${y}`);

  if (t.kind === 'burst') {
    const r = Math.max(1, Math.min(12, Number(t.radius) || 3));
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (cheb(0, 0, dx, dy) <= r) add(t.x + dx, t.y + dy);
      }
    }
  } else if (t.kind === 'line') {
    const len = Math.max(1, Math.min(24, Number(t.length) || 6));
    let dx = Number(t.dirX) || 1;
    let dy = Number(t.dirY) || 0;
    if (dx === 0 && dy === 0) dx = 1;
    for (let i = 0; i <= len; i++) add(t.x + dx * i, t.y + dy * i);
  } else {
    const len = Math.max(1, Math.min(16, Number(t.length) || 4));
    let fx = Number(t.dirX) || 1;
    let fy = Number(t.dirY) || 0;
    if (fx === 0 && fy === 0) fx = 1;
    add(t.x, t.y);
    for (let d = 1; d <= len; d++) {
      for (let side = -d; side <= d; side++) {
        const px = t.x + fx * d + (fy !== 0 ? side : 0);
        const py = t.y + fy * d + (fx !== 0 ? side : 0);
        if (cheb(t.x, t.y, px, py) <= d + 1) add(px, py);
      }
    }
  }

  return Array.from(out).map((k) => {
    const [x, y] = k.split(',').map(Number);
    return { x, y };
  });
};
