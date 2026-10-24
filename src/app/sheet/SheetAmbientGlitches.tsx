'use client';

import { useEffect, useState } from 'react';
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

const rand = (min: number, max: number) =>
  min + Math.random() * (max - min);

const spawn = (id: number): ActiveGlitch => ({
  id,
  kind: KINDS[Math.floor(Math.random() * KINDS.length)],
  top: `${rand(4, 88)}%`,
  left: `${rand(2, 82)}%`,
  width: `${rand(8, 38)}%`,
  height: `${rand(1.5, 12)}%`,
  rotate: rand(-3, 3),
});

/** Ambient HUD glitches that flicker across the character sheet. */
export const SheetAmbientGlitches = () => {
  const [items, setItems] = useState<ActiveGlitch[]>([]);

  useEffect(() => {
    let seq = 0;
    let alive = true;
    const timers: number[] = [];

    const tick = () => {
      if (!alive) return;
      const delay = rand(1800, 5200);
      const t = window.setTimeout(() => {
        const id = ++seq;
        const g = spawn(id);
        setItems((prev) => [...prev.slice(-4), g]);
        const life = rand(280, 900);
        const clear = window.setTimeout(() => {
          setItems((prev) => prev.filter((x) => x.id !== id));
        }, life);
        timers.push(clear);
        tick();
      }, delay);
      timers.push(t);
    };

    tick();
    // occasional burst
    const burst = window.setInterval(() => {
      if (Math.random() > 0.55) return;
      const batch = [spawn(++seq), spawn(++seq)];
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
  }, []);

  return (
    <div className={styles.layer} aria-hidden>
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
