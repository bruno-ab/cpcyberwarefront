'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SheetThemeVariant } from '../../theme/sheetRoleThemes';
import styles from './sheetGlitches.module.css';

type GlitchKind =
  | 'scan'
  | 'tear'
  | 'noise'
  | 'chromatic'
  | 'corrupt'
  | 'flash';

type ActiveGlitch = {
  id: number;
  kind: GlitchKind;
  top: string;
  left: string;
  width: string;
  height: string;
  rotate: number;
};

const KINDS: GlitchKind[] = [
  'scan',
  'tear',
  'noise',
  'chromatic',
  'corrupt',
  'flash',
];

const ROLE_KIND_BIAS: Record<string, GlitchKind[]> = {
  nightcity: ['scan', 'chromatic', 'noise', 'flash'],
  solo: ['tear', 'flash', 'chromatic', 'corrupt'],
  netrunner: ['scan', 'chromatic', 'corrupt', 'noise'],
  tech: ['corrupt', 'scan', 'noise', 'flash'],
  fixer: ['flash', 'noise', 'scan'],
  nomad: ['tear', 'flash', 'noise'],
  media: ['chromatic', 'flash', 'corrupt'],
  exec: ['scan', 'flash', 'chromatic'],
  lawman: ['scan', 'tear', 'flash'],
  medtech: ['scan', 'noise', 'flash'],
  rockerboy: ['chromatic', 'tear', 'flash', 'corrupt'],
};

const rand = (min: number, max: number) =>
  min + Math.random() * (max - min);

const pickKind = (roleId: string): GlitchKind => {
  const pool = ROLE_KIND_BIAS[roleId] ?? KINDS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const spawn = (id: number, roleId: string): ActiveGlitch => ({
  id,
  kind: pickKind(roleId),
  top: `${rand(4, 88)}%`,
  left: `${rand(2, 82)}%`,
  width: `${rand(8, 38)}%`,
  height: `${rand(1.5, 12)}%`,
  rotate: rand(-3, 3),
});

type Props = {
  roleId?: string;
  themeVariant?: SheetThemeVariant;
};

/** Ambient HUD glitches that flicker across the character sheet. */
export const SheetAmbientGlitches = ({
  roleId = 'nightcity',
  themeVariant = 'default',
}: Props) => {
  const [items, setItems] = useState<ActiveGlitch[]>([]);

  const timing = useMemo(() => {
    if (themeVariant === 'extreme') {
      return { minDelay: 1200, maxDelay: 3600, burstChance: 0.72 };
    }
    if (themeVariant === 'alt') {
      return { minDelay: 1500, maxDelay: 4400, burstChance: 0.62 };
    }
    return { minDelay: 1800, maxDelay: 5200, burstChance: 0.55 };
  }, [themeVariant]);

  useEffect(() => {
    let seq = 0;
    let alive = true;
    const timers: number[] = [];

    const tick = () => {
      if (!alive) return;
      const delay = rand(timing.minDelay, timing.maxDelay);
      const t = window.setTimeout(() => {
        const id = ++seq;
        const g = spawn(id, roleId);
        setItems((prev) => [...prev.slice(-4), g]);
        const life = rand(280, themeVariant === 'extreme' ? 1100 : 900);
        const clear = window.setTimeout(() => {
          setItems((prev) => prev.filter((x) => x.id !== id));
        }, life);
        timers.push(clear);
        tick();
      }, delay);
      timers.push(t);
    };

    tick();
    const burst = window.setInterval(() => {
      if (Math.random() > timing.burstChance) return;
      const batch = [spawn(++seq, roleId), spawn(++seq, roleId)];
      setItems((prev) => [...prev, ...batch].slice(-6));
      batch.forEach((g) => {
        const clear = window.setTimeout(() => {
          setItems((prev) => prev.filter((x) => x.id !== g.id));
        }, rand(200, 600));
        timers.push(clear);
      });
    }, 12000);
    timers.push(burst);

    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
      window.clearInterval(burst);
    };
  }, [roleId, themeVariant, timing]);

  return (
    <div
      className={styles.layer}
      data-sheet-ambient
      data-role={roleId}
      data-sheet-theme={themeVariant}
      aria-hidden
    >
      {items.map((g) => (
        <span
          key={g.id}
          className={`${styles.glitch} ${styles[g.kind]}`}
          style={{
            top: g.top,
            left: g.left,
            width: g.width,
            height: g.height,
            transform: `rotate(${g.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export default SheetAmbientGlitches;
