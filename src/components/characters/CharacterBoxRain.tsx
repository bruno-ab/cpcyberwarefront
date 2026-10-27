'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMotion } from '../../motion/useMotion';
import {
  ARABIC_GLYPHS,
  JAPANESE_GLYPHS,
  MATRIX_TERMS,
} from '../home/homeAmbientGagsContent';
import styles from './CharacterBoxRain.module.css';

const ASCII_POOL =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&@*+=<>/\\|!?~^';
const HACK_CMDS = [
  ...MATRIX_TERMS,
  'sudo -i',
  'nmap -sS',
  'curl ICE',
  'ssh ghost',
  'kill -9',
  'chmod 777',
  'nc -lvp',
  'traceroute',
  'whoami',
  'hashcat',
  'hexdump',
  'strace',
  './breach.sh',
  'ping NET',
  'export PATH',
  'rm -rf /',
  'cat /proc',
  'iptables -F',
  'openssl enc',
  'proxy chain',
] as const;

const TONES = ['cyan', 'magenta', 'yellow', 'red'] as const;

type Tone = (typeof TONES)[number];
type ScriptKind = 'ascii' | 'hack' | 'jp' | 'ar';

type RainCell = {
  text: string;
  script: ScriptKind;
  head: boolean;
};

type RainCol = {
  id: number;
  left: string;
  duration: string;
  delay: string;
  tone: Tone;
  cells: RainCell[];
};

type Props = {
  active: boolean;
};

const rand = (min: number, max: number) =>
  min + Math.random() * (max - min);

const pickGlyph = (): { text: string; script: ScriptKind } => {
  const roll = Math.random();
  if (roll < 0.34) {
    return {
      text: ASCII_POOL[Math.floor(Math.random() * ASCII_POOL.length)],
      script: 'ascii',
    };
  }
  if (roll < 0.58) {
    return {
      text: HACK_CMDS[Math.floor(Math.random() * HACK_CMDS.length)],
      script: 'hack',
    };
  }
  if (roll < 0.79) {
    return {
      text: JAPANESE_GLYPHS[Math.floor(Math.random() * JAPANESE_GLYPHS.length)],
      script: 'jp',
    };
  }
  return {
    text: ARABIC_GLYPHS[Math.floor(Math.random() * ARABIC_GLYPHS.length)],
    script: 'ar',
  };
};

const buildColumns = (count: number): RainCol[] =>
  Array.from({ length: count }, (_, i) => {
    const depth = 8 + Math.floor(Math.random() * 14);
    const cells: RainCell[] = Array.from({ length: depth }, (__, j) => {
      const g = pickGlyph();
      return {
        text: g.text,
        script: g.script,
        head: j === depth - 1,
      };
    });
    return {
      id: i,
      left: `${rand(1, 96).toFixed(2)}%`,
      duration: `${rand(2.4, 5.6).toFixed(2)}s`,
      delay: `${rand(-4.5, 0.2).toFixed(2)}s`,
      tone: TONES[Math.floor(Math.random() * TONES.length)],
      cells,
    };
  });

export const CharacterBoxRain = ({ active }: Props) => {
  const { animationsOn, mounted } = useMotion();
  const [seed, setSeed] = useState(0);

  const live = mounted && animationsOn && active;

  useEffect(() => {
    if (!live) return;
    setSeed((s) => s + 1);
    const reshuffle = window.setInterval(() => {
      setSeed((s) => s + 1);
    }, 4200);
    return () => window.clearInterval(reshuffle);
  }, [live]);

  const cols = useMemo(() => {
    if (!live) return [];
    return buildColumns(10 + Math.floor(Math.random() * 8));
    // seed forces reshuffle of glyphs while hovered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, seed]);

  if (!mounted || !animationsOn) return null;

  return (
    <div
      className={styles.rain}
      data-active={live ? 'true' : 'false'}
      aria-hidden
    >
      {cols.map((col) => (
        <span
          key={`${seed}-${col.id}`}
          className={styles.col}
          data-tone={col.tone}
          style={{
            left: col.left,
            animationDuration: col.duration,
            animationDelay: col.delay,
          }}
        >
          {col.cells.map((cell, idx) => (
            <span
              key={`${col.id}-${idx}`}
              className={styles.cell}
              data-head={cell.head ? 'true' : 'false'}
              data-script={cell.script}
            >
              {cell.text}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
};

export default CharacterBoxRain;
