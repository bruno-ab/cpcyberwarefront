'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './DiceGlitchOverlay.module.css';

export type DiceReveal = {
  id: string;
  pool: number;
  difficulty: number;
  dice: number[];
  successes: number;
  ones: number;
  botch: boolean;
  label?: string;
  rollerName?: string;
};

type Props = {
  active: boolean;
  reveal: DiceReveal | null;
  onDone?: () => void;
};

/** Scramble → hold result → fade out. Player can dismiss with X. */
const SCRAMBLE_MS = 1000;
const HOLD_MS = 4500;
const FADE_MS = 900;
const REDUCED_HOLD_MS = 2800;

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return true;
  if (document.documentElement.getAttribute('data-motion') === 'off') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const DiceGlitchOverlay = ({ active, reveal, onDone }: Props) => {
  const [phase, setPhase] = useState<
    'idle' | 'scramble' | 'reveal' | 'fadeout'
  >('idle');
  const [faces, setFaces] = useState<number[]>([]);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  };

  const dismiss = () => {
    clearTimers();
    setPhase('idle');
    onDone?.();
  };

  const startFade = () => {
    setPhase('fadeout');
    const t = window.setTimeout(() => {
      setPhase('idle');
      onDone?.();
    }, FADE_MS);
    timers.current.push(t);
  };

  useEffect(() => {
    clearTimers();
    if (!active || !reveal) {
      setPhase('idle');
      return;
    }

    if (prefersReducedMotion()) {
      setFaces(reveal.dice);
      setPhase('reveal');
      const t = window.setTimeout(startFade, REDUCED_HOLD_MS);
      timers.current.push(t);
      return () => clearTimers();
    }

    setPhase('scramble');
    setFaces(
      Array.from({ length: reveal.pool }, () => 1 + Math.floor(Math.random() * 10)),
    );

    const tick = window.setInterval(() => {
      setFaces(
        Array.from(
          { length: reveal.pool },
          () => 1 + Math.floor(Math.random() * 10),
        ),
      );
    }, 70);

    const revealTimer = window.setTimeout(() => {
      window.clearInterval(tick);
      setFaces(reveal.dice);
      setPhase('reveal');
      const hold = window.setTimeout(startFade, HOLD_MS);
      timers.current.push(hold);
    }, SCRAMBLE_MS);
    timers.current.push(revealTimer);

    return () => {
      window.clearInterval(tick);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reveal?.id]);

  if (!active || !reveal || phase === 'idle') return null;

  const shown = faces;
  const botch = (phase === 'reveal' || phase === 'fadeout') && reveal.botch;
  const showingResult = phase === 'reveal' || phase === 'fadeout';

  return (
    <div
      className={styles.overlay}
      data-phase={phase}
      data-botch={botch ? '1' : '0'}
      role="status"
      aria-live="polite"
    >
      <div className={styles.panel}>
        <button
          type="button"
          className={styles.close}
          onClick={dismiss}
          aria-label="Fechar rolagem"
          title="Fechar"
        >
          ×
        </button>
        <header className={styles.head}>
          <span className={styles.eyebrow}>
            {phase === 'scramble'
              ? 'ROLLING…'
              : phase === 'fadeout'
                ? 'CLEAR'
                : 'RESULT'}
          </span>
          <strong>
            {reveal.rollerName ? `${reveal.rollerName} · ` : ''}
            {reveal.label || 'Teste'}
          </strong>
        </header>
        <div className={styles.diceRow}>
          {shown.map((n, i) => (
            <span
              key={`${reveal.id}-${i}`}
              className={styles.die}
              data-face={showingResult ? n : undefined}
              data-success={
                showingResult && n >= reveal.difficulty ? '1' : '0'
              }
              data-one={showingResult && n === 1 ? '1' : '0'}
            >
              {n}
            </span>
          ))}
        </div>
        {showingResult ? (
          <p className={styles.result} data-botch={botch ? '1' : '0'}>
            {botch ? (
              <>
                <em>BOTCH</em> · {reveal.ones} um(ns) · 0 sucessos
              </>
            ) : (
              <>
                <em>{reveal.successes}</em> sucesso
                {reveal.successes === 1 ? '' : 's'} · dif {reveal.difficulty}
              </>
            )}
          </p>
        ) : (
          <p className={styles.result}>scrambling buffer…</p>
        )}
      </div>
    </div>
  );
};

export default DiceGlitchOverlay;
