'use client';

import { useEffect, useState } from 'react';
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

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return true;
  if (document.documentElement.getAttribute('data-motion') === 'off') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/** Scramble + reveal overlay for Storyteller d10 rolls. */
export const DiceGlitchOverlay = ({ active, reveal, onDone }: Props) => {
  const [phase, setPhase] = useState<'idle' | 'scramble' | 'reveal'>('idle');
  const [faces, setFaces] = useState<number[]>([]);

  useEffect(() => {
    if (!active || !reveal) {
      setPhase('idle');
      return;
    }

    if (prefersReducedMotion()) {
      setFaces(reveal.dice);
      setPhase('reveal');
      const t = window.setTimeout(() => onDone?.(), 900);
      return () => window.clearTimeout(t);
    }

    setPhase('scramble');
    setFaces(Array.from({ length: reveal.pool }, () => 1 + Math.floor(Math.random() * 10)));

    const tick = window.setInterval(() => {
      setFaces(
        Array.from({ length: reveal.pool }, () => 1 + Math.floor(Math.random() * 10)),
      );
    }, 70);

    const revealTimer = window.setTimeout(() => {
      window.clearInterval(tick);
      setFaces(reveal.dice);
      setPhase('reveal');
    }, 1000);

    const doneTimer = window.setTimeout(() => onDone?.(), 2400);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(revealTimer);
      window.clearTimeout(doneTimer);
    };
  }, [active, reveal, onDone]);

  if (!active || !reveal || phase === 'idle') return null;

  const shown = faces;
  const botch = phase === 'reveal' && reveal.botch;

  return (
    <div
      className={styles.overlay}
      data-phase={phase}
      data-botch={botch ? '1' : '0'}
      role="status"
      aria-live="polite"
    >
      <div className={styles.panel}>
        <header className={styles.head}>
          <span className={styles.eyebrow}>
            {phase === 'scramble' ? 'ROLLING…' : 'RESULT'}
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
              data-face={phase === 'reveal' ? n : undefined}
              data-success={
                phase === 'reveal' && n >= reveal.difficulty ? '1' : '0'
              }
              data-one={phase === 'reveal' && n === 1 ? '1' : '0'}
            >
              {n}
            </span>
          ))}
        </div>
        {phase === 'reveal' ? (
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
