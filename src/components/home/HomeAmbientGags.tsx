'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMotion } from '../../motion/useMotion';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import {
  ASCII_RABBIT,
  ASCII_RABBIT_ALT,
  INVASION_LINES,
  ARABIC_GLYPHS,
  JAPANESE_GLYPHS,
  MATRIX_TERMS,
  SYNC_LABELS,
  glitchify,
  pickGagKind,
  randBetween,
  type GagKind,
} from './homeAmbientGagsContent';
import styles from './homeAmbientGags.module.css';

const TONES = ['cyan', 'magenta', 'yellow', 'red'] as const;

type MatrixCol = {
  id: number;
  left: string;
  tone: (typeof TONES)[number];
  duration: string;
  delay: string;
  cells: string[];
};

type InvasionLine = { text: string; corrupt: boolean };

type ActiveGag =
  | { kind: 'matrix'; cols: MatrixCol[] }
  | {
      kind: 'invasion';
      full: boolean;
      corner: '0' | '1';
      lines: InvasionLine[];
    }
  | { kind: 'rabbit'; corner: 'tl' | 'tr' | 'bl' | 'br'; art: string }
  | { kind: 'syncBar'; label: string }
  | {
      kind: 'scriptGlitch';
      glyphs: ScriptGlitchGlyph[];
    };

type ScriptGlitchGlyph = {
  id: number;
  text: string;
  script: 'arabic' | 'japanese';
  top: string;
  left: string;
  size: string;
  delay: string;
  duration: string;
  rgb: 'cmr' | 'myc' | 'ryc';
};

const GAG_DURATION_MS: Record<GagKind, number> = {
  matrix: 5200,
  invasion: 8200,
  rabbit: 3400,
  syncBar: 5400,
  scriptGlitch: 4600,
};

const RGB_MODES = ['cmr', 'myc', 'ryc'] as const;

const buildScriptGlitch = (): ActiveGag => {
  const count = 14 + Math.floor(Math.random() * 22);
  const glyphs: ScriptGlitchGlyph[] = Array.from({ length: count }, (_, i) => {
    const useArabic = Math.random() < 0.45;
    const pool = useArabic ? ARABIC_GLYPHS : JAPANESE_GLYPHS;
    return {
      id: i,
      text: pool[Math.floor(Math.random() * pool.length)],
      script: useArabic ? 'arabic' : 'japanese',
      top: `${randBetween(6, 88).toFixed(1)}%`,
      left: `${randBetween(3, 92).toFixed(1)}%`,
      size: `${randBetween(0.72, 1.65).toFixed(2)}rem`,
      delay: `${randBetween(0, 2.4).toFixed(2)}s`,
      duration: `${randBetween(0.35, 1.15).toFixed(2)}s`,
      rgb: RGB_MODES[Math.floor(Math.random() * RGB_MODES.length)],
    };
  });
  return { kind: 'scriptGlitch', glyphs };
};

const sampleTerms = (n: number) => {
  const out: string[] = [];
  for (let i = 0; i < n; i += 1) {
    out.push(MATRIX_TERMS[Math.floor(Math.random() * MATRIX_TERMS.length)]);
  }
  return out;
};

const buildMatrix = (): MatrixCol[] => {
  const count = 8 + Math.floor(Math.random() * 10);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${randBetween(2, 96)}%`,
    tone: TONES[Math.floor(Math.random() * TONES.length)],
    duration: `${randBetween(3.2, 5.8).toFixed(2)}s`,
    delay: `${randBetween(0, 0.8).toFixed(2)}s`,
    cells: sampleTerms(10 + Math.floor(Math.random() * 14)),
  }));
};

const buildInvasion = (): ActiveGag => {
  const full = Math.random() < 0.22;
  const lineCount = full ? 4 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 2);
  const shuffled = [...INVASION_LINES].sort(() => Math.random() - 0.5);
  const lines = shuffled.slice(0, lineCount).map((line, idx) => {
    const glitched = idx === 0 || Math.random() < 0.45 ? glitchify(line) : line;
    return {
      text: glitched,
      corrupt: full ? Math.random() < 0.4 : idx % 2 === 1,
    };
  });
  return {
    kind: 'invasion',
    full,
    corner: Math.random() < 0.5 ? '0' : '1',
    lines,
  };
};

const buildRabbit = (): ActiveGag => {
  const corners = ['tl', 'tr', 'bl', 'br'] as const;
  return {
    kind: 'rabbit',
    corner: corners[Math.floor(Math.random() * corners.length)],
    art: Math.random() < 0.5 ? ASCII_RABBIT : ASCII_RABBIT_ALT,
  };
};

const buildSyncBar = (): ActiveGag => ({
  kind: 'syncBar',
  label: SYNC_LABELS[Math.floor(Math.random() * SYNC_LABELS.length)],
});

const spawnGag = (kind: GagKind): ActiveGag => {
  switch (kind) {
    case 'matrix':
      return { kind: 'matrix', cols: buildMatrix() };
    case 'invasion':
      return buildInvasion();
    case 'rabbit':
      return buildRabbit();
    case 'syncBar':
      return buildSyncBar();
    case 'scriptGlitch':
      return buildScriptGlitch();
    default:
      return { kind: 'syncBar', label: SYNC_LABELS[0] };
  }
};

/** Rare ambient cyberpunk gags on the home landing (non-blocking overlay). */
export const HomeAmbientGags = () => {
  const { animationsOn, mounted } = useMotion();
  const [gag, setGag] = useState<ActiveGag | null>(null);

  const clearGag = useCallback(() => setGag(null), []);

  const scheduleEnabled = mounted && animationsOn;

  useEffect(() => {
    if (!scheduleEnabled) {
      setGag(null);
      return undefined;
    }

    let alive = true;
    const timers: number[] = [];

    const runGag = () => {
      if (!alive) return;
      const kind = pickGagKind();
      setGag(spawnGag(kind));
      if (kind === 'invasion') {
        playCyberSound('glitch', { volume: 0.18 });
      }
      const clear = window.setTimeout(() => {
        if (alive) setGag(null);
      }, GAG_DURATION_MS[kind]);
      timers.push(clear);
    };

    const scheduleNext = () => {
      if (!alive) return;
      const delay = randBetween(20_000, 90_000);
      const t = window.setTimeout(() => {
        runGag();
        scheduleNext();
      }, delay);
      timers.push(t);
    };

    const boot = window.setTimeout(() => {
      runGag();
      scheduleNext();
    }, randBetween(18_000, 45_000));
    timers.push(boot);

    return () => {
      alive = false;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [scheduleEnabled]);

  const invasionDismiss = useCallback(() => {
    playCyberSound('ui', { volume: 0.15 });
    clearGag();
  }, [clearGag]);

  const matrixCols = useMemo(
    () => (gag?.kind === 'matrix' ? gag.cols : null),
    [gag],
  );

  if (!scheduleEnabled || !gag) {
    return null;
  }

  return (
    <div className={styles.layer} aria-hidden data-home-ambient-gags>
      {gag.kind === 'matrix' && matrixCols && (
        <div className={styles.matrixBurst}>
          {matrixCols.map((col) => (
            <div
              key={col.id}
              className={styles.matrixCol}
              data-tone={col.tone}
              style={{
                left: col.left,
                animationDuration: col.duration,
                animationDelay: col.delay,
              }}
            >
              {col.cells.map((cell, i) => (
                <span key={`${col.id}-${i}`}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      )}

      {gag.kind === 'invasion' && !gag.full && (
        <div className={styles.invasion} data-corner={gag.corner}>
          <div className={styles.invasionHead}>
            <span>unknown@net</span>
            <button type="button" className={styles.dismiss} onClick={invasionDismiss}>
              fechar
            </button>
          </div>
          {gag.lines.map((line, i) => (
            <p
              key={line.text + i}
              className={styles.invasionLine}
              data-corrupt={line.corrupt ? '1' : undefined}
            >
              {'> '}
              {line.text}
            </p>
          ))}
        </div>
      )}

      {gag.kind === 'invasion' && gag.full && (
        <div className={styles.invasionFull}>
          <div className={styles.invasionPanel}>
            <div className={styles.invasionHead}>
              <span>intrusion attempt</span>
              <button type="button" className={styles.dismiss} onClick={invasionDismiss}>
                negar
              </button>
            </div>
            {gag.lines.map((line, i) => (
              <p
                key={line.text + i}
                className={styles.invasionLine}
                data-corrupt={line.corrupt ? '1' : undefined}
              >
                {'> '}
                {line.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {gag.kind === 'rabbit' && (
        <pre className={styles.rabbit} data-corner={gag.corner}>
          {gag.art}
        </pre>
      )}

      {gag.kind === 'syncBar' && (
        <div className={styles.syncWrap}>
          <div className={styles.syncLabel}>{gag.label}</div>
          <div className={styles.syncTrack}>
            <div className={styles.syncFill} />
          </div>
        </div>
      )}

      {gag.kind === 'scriptGlitch' && (
        <div className={styles.scriptBurst}>
          {gag.glyphs.map((g) => (
            <span
              key={g.id}
              className={styles.scriptGlyph}
              data-script={g.script}
              data-rgb={g.rgb}
              style={{
                top: g.top,
                left: g.left,
                fontSize: g.size,
                animationDelay: g.delay,
                animationDuration: g.duration,
              }}
            >
              {g.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
