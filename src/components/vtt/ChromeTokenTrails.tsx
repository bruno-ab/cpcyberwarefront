'use client';

import { useEffect, useRef, useState } from 'react';
import { resolveMediaSrc } from '../../lib/media';
import styles from './chromeTokenTrails.module.css';

export type SandyTrailGhost = {
  id: string;
  x: number;
  y: number;
  color: string;
  tokenId?: string;
  portraitUrl?: string | null;
  label?: string;
};

type TrailToken = {
  id: string;
  x: number;
  y: number;
  color: string;
  name?: string;
  floor?: number;
  auras?: string[];
  portraitUrl?: string | null;
};

type Props = {
  grid: number;
  floor: number;
  tokens: TrailToken[];
  fxEvents: SandyTrailGhost[];
  onConsumeFx?: (id: string) => void;
};

const TRAIL_TTL_MS = 880;
const MAX_GHOSTS = 36;

const portraitOf = (t: TrailToken): string | null => {
  const raw = t.portraitUrl;
  if (!raw) return null;
  return resolveMediaSrc(raw) || raw || null;
};

const labelOf = (t: TrailToken): string =>
  (t.name || '').trim().slice(0, 2).toUpperCase() || '·';

const GhostFace = ({
  portraitUrl,
  label,
  color,
}: {
  portraitUrl?: string | null;
  label?: string;
  color: string;
}) => {
  const initial = (label || '·').slice(0, 2).toUpperCase();
  if (portraitUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={portraitUrl} alt="" draggable={false} />
    );
  }
  return (
    <span className={styles.initial} style={{ color }}>
      {initial}
    </span>
  );
};

export const ChromeTokenTrails = ({
  grid,
  floor,
  tokens,
  fxEvents,
  onConsumeFx,
}: Props) => {
  const [ghosts, setGhosts] = useState<SandyTrailGhost[]>([]);
  const prevPos = useRef<Map<string, { x: number; y: number }>>(new Map());
  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;

  useEffect(() => {
    const next: SandyTrailGhost[] = [];
    for (const t of tokens) {
      if ((t.floor ?? 0) !== floor) continue;
      if (!(t.auras || []).includes('sandevistan')) continue;
      const prev = prevPos.current.get(t.id);
      if (prev && (prev.x !== t.x || prev.y !== t.y)) {
        const dx = t.x - prev.x;
        const dy = t.y - prev.y;
        const steps = Math.max(1, Math.max(Math.abs(dx), Math.abs(dy)));
        const stamp = Date.now();
        const portrait = portraitOf(t);
        const label = labelOf(t);
        for (let s = 0; s < steps; s += 1) {
          const px = prev.x + Math.round((dx * s) / steps);
          const py = prev.y + Math.round((dy * s) / steps);
          next.push({
            id: `mv_${t.id}_${stamp}_${s}_${Math.random().toString(36).slice(2, 5)}`,
            x: px,
            y: py,
            color: t.color,
            tokenId: t.id,
            portraitUrl: portrait,
            label,
          });
        }
      }
      prevPos.current.set(t.id, { x: t.x, y: t.y });
    }
    if (next.length) {
      setGhosts((g) => [...next, ...g].slice(0, MAX_GHOSTS));
    }
  }, [tokens, floor]);

  useEffect(() => {
    if (!fxEvents.length) return;
    const enriched = fxEvents.map((e) => {
      if (e.portraitUrl || !e.tokenId) return e;
      const tok = tokensRef.current.find((t) => t.id === e.tokenId);
      if (!tok) return e;
      return {
        ...e,
        portraitUrl: portraitOf(tok),
        label: e.label || labelOf(tok),
        color: e.color || tok.color,
      };
    });
    setGhosts((g) => [...enriched, ...g].slice(0, MAX_GHOSTS));
    for (const e of fxEvents) onConsumeFx?.(e.id);
  }, [fxEvents, onConsumeFx]);

  useEffect(() => {
    if (!ghosts.length) return;
    const t = window.setTimeout(() => {
      setGhosts((g) => g.slice(0, Math.max(0, g.length - 6)));
    }, TRAIL_TTL_MS);
    return () => window.clearTimeout(t);
  }, [ghosts]);

  if (!ghosts.length) return null;

  return (
    <div className={styles.layer} aria-hidden data-sandy-trails>
      {ghosts.map((g) => (
        <div
          key={g.id}
          className={styles.ghost}
          style={{
            left: g.x * grid,
            top: g.y * grid,
            width: grid,
            height: grid,
            ['--token-color' as string]: g.color || '#FCEE0A',
          }}
        >
          <span className={`${styles.plate} ${styles.plateR}`}>
            <GhostFace
              portraitUrl={g.portraitUrl}
              label={g.label}
              color="#ff6688"
            />
          </span>
          <span className={`${styles.plate} ${styles.plateG}`}>
            <GhostFace
              portraitUrl={g.portraitUrl}
              label={g.label}
              color="#66ff88"
            />
          </span>
          <span className={`${styles.plate} ${styles.plateB}`}>
            <GhostFace
              portraitUrl={g.portraitUrl}
              label={g.label}
              color="#66e0ff"
            />
          </span>
          <span className={`${styles.plate} ${styles.plateMain}`}>
            <GhostFace
              portraitUrl={g.portraitUrl}
              label={g.label}
              color={g.color}
            />
          </span>
        </div>
      ))}
    </div>
  );
};

export default ChromeTokenTrails;
