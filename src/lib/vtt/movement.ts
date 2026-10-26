/** Chebyshev distance — 8-way adjacency, 1 square per cell. */
export const gridStepCost = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number => Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));

export type TurnMovement = {
  tokenId: string;
  startX: number;
  startY: number;
  remaining: number;
  max: number;
};

export const consumedFromTurnStart = (
  move: TurnMovement,
  x: number,
  y: number,
): number => gridStepCost(move.startX, move.startY, x, y);

export const canAffordMoveTo = (
  move: TurnMovement,
  x: number,
  y: number,
): boolean => consumedFromTurnStart(move, x, y) <= move.max;

/** Destinations allowed this turn (Chebyshev from turn start, uses max not remaining). */
export const budgetReachableCells = (
  move: TurnMovement,
  mapW: number,
  mapH: number,
): Array<{ x: number; y: number }> =>
  reachableCells(move.startX, move.startY, move.max, mapW, mapH);

export const reachableCells = (
  fromX: number,
  fromY: number,
  remaining: number,
  mapW: number,
  mapH: number,
): Array<{ x: number; y: number }> => {
  if (remaining <= 0) return [];
  const out: Array<{ x: number; y: number }> = [];
  const seen = new Set<string>();
  type Node = { x: number; y: number; d: number };
  const q: Node[] = [{ x: fromX, y: fromY, d: 0 }];
  seen.add(`${fromX},${fromY}`);
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  while (q.length) {
    const cur = q.shift()!;
    if (cur.d > 0 && cur.d <= remaining) out.push({ x: cur.x, y: cur.y });
    if (cur.d >= remaining) continue;
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || ny < 0 || nx >= mapW || ny >= mapH) continue;
      const key = `${nx},${ny}`;
      if (seen.has(key)) continue;
      seen.add(key);
      q.push({ x: nx, y: ny, d: cur.d + 1 });
    }
  }
  return out;
};
