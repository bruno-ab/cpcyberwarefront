'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMotion } from '../../motion/useMotion';
import {
  buildCharacterGagLines,
  encryptFragment,
  type CharacterFileSource,
} from './characterFileFlavor';
import styles from './CharactersPageGags.module.css';

type ToastTone = 'cyan' | 'yellow' | 'magenta';

type ActiveGag =
  | {
      kind: 'toast';
      id: number;
      text: string;
      top: string;
      left: string;
      tone: ToastTone;
      corrupt: boolean;
    }
  | { kind: 'tear'; id: number; top: string; width: string; left: string }
  | { kind: 'scan'; id: number }
  | {
      kind: 'shard';
      id: number;
      text: string;
      top: string;
      left: string;
    };

type Props = {
  characters: CharacterFileSource[];
};

const rand = (min: number, max: number) =>
  min + Math.random() * (max - min);

const pickTone = (text: string): ToastTone => {
  const t = text.toLowerCase();
  if (t.includes('netrunner') || t.includes('ice') || t.includes('breach')) {
    return 'magenta';
  }
  if (t.includes('solo') || t.includes('exec') || t.includes('lawman')) {
    return 'yellow';
  }
  return 'cyan';
};

export const CharactersPageGags = ({ characters }: Props) => {
  const { animationsOn, mounted } = useMotion();
  const [items, setItems] = useState<ActiveGag[]>([]);

  const lines = useMemo(
    () => buildCharacterGagLines(characters),
    [characters],
  );

  const live = mounted && animationsOn && lines.length > 0;

  useEffect(() => {
    if (!live) {
      setItems([]);
      return;
    }

    let seq = 0;
    let alive = true;
    const timers: number[] = [];

    const push = (gag: ActiveGag, lifeMs: number) => {
      setItems((prev) => [...prev.slice(-5), gag]);
      const clear = window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== gag.id));
      }, lifeMs);
      timers.push(clear);
    };

    const spawnToast = () => {
      const text = lines[Math.floor(Math.random() * lines.length)];
      const id = ++seq;
      push(
        {
          kind: 'toast',
          id,
          text,
          top: `${rand(12, 78).toFixed(1)}%`,
          left: `${rand(4, 58).toFixed(1)}%`,
          tone: pickTone(text),
          corrupt: Math.random() < 0.45,
        },
        rand(2200, 4200),
      );
    };

    const spawnTear = () => {
      push(
        {
          kind: 'tear',
          id: ++seq,
          top: `${rand(8, 90).toFixed(1)}%`,
          left: `${rand(0, 40).toFixed(1)}%`,
          width: `${rand(20, 70).toFixed(1)}%`,
        },
        600,
      );
    };

    const spawnScan = () => {
      push({ kind: 'scan', id: ++seq }, 1200);
    };

    const spawnShard = () => {
      const c =
        characters[Math.floor(Math.random() * Math.max(1, characters.length))];
      const seed = c
        ? `${c.name}:${c.idCard || c.id}`
        : `void:${Date.now()}`;
      push(
        {
          kind: 'shard',
          id: ++seq,
          text: encryptFragment(seed, 'gag-shard'),
          top: `${rand(10, 85).toFixed(1)}%`,
          left: `${rand(5, 80).toFixed(1)}%`,
        },
        2400,
      );
    };

    const tick = () => {
      if (!alive) return;
      const delay = rand(3200, 7800);
      const t = window.setTimeout(() => {
        const roll = Math.random();
        if (roll < 0.55) spawnToast();
        else if (roll < 0.72) spawnTear();
        else if (roll < 0.86) spawnScan();
        else spawnShard();
        tick();
      }, delay);
      timers.push(t);
    };

    const boot = window.setTimeout(() => {
      spawnToast();
      spawnScan();
    }, 900);
    timers.push(boot);
    tick();

    const burst = window.setInterval(() => {
      if (Math.random() > 0.55) return;
      spawnTear();
      if (Math.random() < 0.4) spawnShard();
    }, 14000);
    timers.push(burst);

    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
      window.clearInterval(burst);
    };
  }, [live, lines, characters]);

  if (!live) return null;

  return (
    <div className={styles.layer} aria-hidden data-characters-page-gags>
      {items.map((g) => {
        if (g.kind === 'toast') {
          return (
            <div
              key={g.id}
              className={styles.toast}
              data-tone={g.tone}
              data-corrupt={g.corrupt ? 'true' : 'false'}
              style={{ top: g.top, left: g.left }}
            >
              {g.text}
            </div>
          );
        }
        if (g.kind === 'tear') {
          return (
            <span
              key={g.id}
              className={styles.tear}
              style={{ top: g.top, left: g.left, width: g.width }}
            />
          );
        }
        if (g.kind === 'scan') {
          return <span key={g.id} className={styles.scanBand} />;
        }
        return (
          <span
            key={g.id}
            className={styles.shard}
            style={{ top: g.top, left: g.left }}
          >
            {g.text}
          </span>
        );
      })}
    </div>
  );
};

export default CharactersPageGags;
