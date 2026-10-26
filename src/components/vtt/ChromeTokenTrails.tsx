'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './chromeTokenTrails.module.css';

export type SandyTrailGhost = {
  id: string;
  x: number;
  y: number;
  color: string;
};

type Props = {
  grid: number;
  floor: number;
  tokens: Array<{ id: string; x: number; y: number; color: string; floor?: number; auras?: string[] }>;
  fxEvents: SandyTrailGhost[];
  onConsumeFx?: (id: string) => void;
};

const TRAIL_TTL_MS = 720;
const MAX_GHOSTS = 24;

export const ChromeTokenTrails = ({
  grid,
  floor,
  tokens,
  fxEvents,
  onConsumeFx,
}: Props) => {
  const [ghosts, setGhosts] = useState<SandyTrailGhost[]>([]);
  const prevPos = useRef<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const next: SandyTrailGhost[] = [];
    for (const t of tokens) {
      if ((t.floor ?? 0) !== floor) continue;
      if (!(t.auras || []).includes('sandevistan')) continue;
      const prev = prevPos.current.get(t.id);
      if (prev && (prev.x !== t.x || prev.y !== t.y)) {
        next.push({
          id: `mv_${t.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          x: prev.x,
          y: prev.y,
          color: t.color,
        });
      }
      prevPos.current.set(t.id, { x: t.x, y: t.y });
    }
    if (next.length) {
      setGhosts((g) => [...next, ...g].slice(0, MAX_GHOSTS));
    }
  }, [tokens, floor]);

  useEffect(() => {
    if (!fxEvents.length) return;
    setGhosts((g) =>
      [...fxEvents.map((e) => ({ ...e })), ...g].slice(0, MAX_GHOSTS),
    );
    for (const e of fxEvents) onConsumeFx?.(e.id);
  }, [fxEvents, onConsumeFx]);

  useEffect(() => {
    if (!ghosts.length) return;
    const t = window.setTimeout(() => {
      setGhosts((g) => g.slice(0, Math.max(0, g.length - 4)));
    }, TRAIL_TTL_MS);
    return () => window.clearTimeout(t);
  }, [ghosts]);

  if (!ghosts.length) return null;

  return (
    <div className={styles.layer} aria-hidden>
      {ghosts.map((g, i) => {
        const hue =
          (i * 47 +
            g.x * 37 +
            g.y * 53 +
            (g.id.charCodeAt(g.id.length - 1) || 0)) %
          360;
        return (
          <div
            key={g.id}
            className={styles.ghost}
            style={{
              left: g.x * grid,
              top: g.y * grid,
              width: grid,
              height: grid,
              ['--trail-hue' as string]: String(hue),
            }}
          />
        );
      })}
    </div>
  );
};
