'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './DiceGlitchOverlay.module.css';
import {
  BEAT_MS,
  buildLockWaves,
  CANCEL_MS,
  type DiceReveal,
  type DiceVerdict,
  FADE_MS,
  FAST_BEAT_MS,
  FAST_HOLD_MS,
  HOLD_MS,
  parseRollKind,
  prefersReducedMotion,
  rawSuccessCount,
  readDiceFastMode,
  REDUCED_HOLD_MS,
  computeVerdict,
  resolveRoleAccent,
  scrambleFace,
  writeDiceFastMode,
} from './diceDecodeUtils';

export type { DiceReveal } from './diceDecodeUtils';

type Props = {
  active: boolean;
  reveal: DiceReveal | null;
  queued?: number;
  onDone?: () => void;
  onVerdict?: (verdict: DiceVerdict) => void;
};

type Phase = 'idle' | 'decode' | 'cancel' | 'verdict' | 'fadeout';

export const DiceDecodeOverlay = ({
  active,
  reveal,
  queued = 0,
  onDone,
  onVerdict,
}: Props) => {
  const { t } = useTranslations('vtt.diceDecode');
  const tr = (key: string, vars?: Record<string, string>) => {
    let s = t(key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, v);
      }
    }
    return s;
  };
  const [phase, setPhase] = useState<Phase>('idle');
  const [beat, setBeat] = useState(0);
  const [locked, setLocked] = useState<Set<number>>(() => new Set());
  const [faces, setFaces] = useState<number[]>([]);
  const [showCancel, setShowCancel] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const timers = useRef<number[]>([]);
  const lockedRef = useRef<Set<number>>(new Set());
  const verdictFired = useRef(false);

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
    const tId = window.setTimeout(() => {
      setPhase('idle');
      onDone?.();
    }, FADE_MS);
    timers.current.push(tId);
  };

  useEffect(() => {
    setFastMode(readDiceFastMode());
  }, [active, reveal?.id]);

  const rollKind = useMemo(
    () => reveal?.rollKind ?? parseRollKind(reveal?.label),
    [reveal?.label, reveal?.rollKind],
  );
  const roleAccent = useMemo(
    () => resolveRoleAccent(reveal?.characterRole),
    [reveal?.characterRole],
  );

  const verdict = useMemo(
    () => (reveal ? computeVerdict(reveal) : null),
    [reveal],
  );

  const rawSuccess = useMemo(
    () =>
      reveal ? rawSuccessCount(reveal.dice, reveal.difficulty) : 0,
    [reveal],
  );

  useEffect(() => {
    clearTimers();
    verdictFired.current = false;
    if (!active || !reveal) {
      setPhase('idle');
      setLocked(new Set());
      setShowCancel(false);
      return;
    }

    const reduced = prefersReducedMotion();
    const fast = !reduced && (fastMode || readDiceFastMode());
    setFaces(reveal.dice.map(() => scrambleFace()));
    setLocked(new Set());
    lockedRef.current = new Set();
    setShowCancel(false);
    setBeat(0);

    if (reduced) {
      setFaces(reveal.dice);
      const all = new Set(reveal.dice.map((_, i) => i));
      lockedRef.current = all;
      setLocked(all);
      setPhase('verdict');
      if (!verdictFired.current && verdict) {
        verdictFired.current = true;
        onVerdict?.(verdict);
      }
      const hold = window.setTimeout(startFade, REDUCED_HOLD_MS);
      timers.current.push(hold);
      return () => clearTimers();
    }

    const waves = buildLockWaves(reveal.dice.length);
    const beatMs = fast ? FAST_BEAT_MS : BEAT_MS;
    setPhase('decode');

    const scrambleTick = window.setInterval(() => {
      setFaces((prev) =>
        prev.map((v, i) =>
          lockedRef.current.has(i) ? reveal.dice[i] : scrambleFace(),
        ),
      );
    }, fast ? 40 : 65);

    const runBeat = (index: number) => {
      setBeat(index);
      const wave = fast ? waves.flat() : waves[index] || [];
      for (const i of wave) lockedRef.current.add(i);
      setLocked(new Set(lockedRef.current));
      setFaces((prev) =>
        prev.map((_, i) =>
          lockedRef.current.has(i) ? reveal.dice[i] : prev[i] ?? scrambleFace(),
        ),
      );

      const lastBeat = fast ? 0 : waves.length - 1;
      if (index >= lastBeat) {
        window.clearInterval(scrambleTick);
        lockedRef.current = new Set(reveal.dice.map((_, i) => i));
        setLocked(new Set(lockedRef.current));
        setFaces(reveal.dice);

        const needsCancel =
          !fast && reveal.ones > 0 && rawSuccess > 0 && reveal.successes >= 0;

        if (needsCancel) {
          setPhase('cancel');
          setShowCancel(true);
          const cancelTimer = window.setTimeout(() => {
            setPhase('verdict');
            if (!verdictFired.current && verdict) {
              verdictFired.current = true;
              onVerdict?.(verdict);
            }
            const hold = window.setTimeout(
              startFade,
              fast ? FAST_HOLD_MS : HOLD_MS,
            );
            timers.current.push(hold);
          }, fast ? 120 : CANCEL_MS);
          timers.current.push(cancelTimer);
        } else {
          setPhase('verdict');
          if (!verdictFired.current && verdict) {
            verdictFired.current = true;
            onVerdict?.(verdict);
          }
          const hold = window.setTimeout(
            startFade,
            fast ? FAST_HOLD_MS : HOLD_MS,
          );
          timers.current.push(hold);
        }
        return;
      }

      const nextBeat = window.setTimeout(() => runBeat(index + 1), beatMs);
      timers.current.push(nextBeat);
    };

    if (fast) {
      runBeat(0);
    } else {
      const first = window.setTimeout(() => runBeat(0), beatMs * 0.35);
      timers.current.push(first);
    }

    return () => {
      window.clearInterval(scrambleTick);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reveal?.id, fastMode]);

  if (!active || !reveal || phase === 'idle') return null;

  const showingResult =
    phase === 'cancel' || phase === 'verdict' || phase === 'fadeout';
  const decodeProgress = Math.min(5, beat + 1);

  const toggleFast = () => {
    const next = !fastMode;
    setFastMode(next);
    writeDiceFastMode(next);
  };

  return (
    <div
      className={styles.overlay}
      data-phase={phase === 'decode' ? 'scramble' : phase}
      data-verdict={showingResult ? verdict ?? undefined : undefined}
      data-roll-kind={rollKind}
      data-role-accent={roleAccent}
      role="status"
      aria-live="polite"
    >
      <div
        className={styles.panel}
        data-verdict={showingResult && verdict ? verdict : undefined}
      >
        <button
          type="button"
          className={styles.close}
          onClick={dismiss}
          aria-label={t('close')}
          title={t('close')}
        >
          ×
        </button>
        <header className={styles.head}>
          <span className={styles.eyebrow}>
            {phase === 'decode'
              ? tr('eyebrowDecode', { beat: String(decodeProgress) })
              : phase === 'cancel'
                ? t('eyebrowCancel')
                : phase === 'fadeout'
                  ? t('eyebrowClear')
                  : t('eyebrowVerdict')}
          </span>
          <strong>
            {reveal.rollerName ? `${reveal.rollerName} · ` : ''}
            {reveal.label || t('defaultLabel')}
          </strong>
          {queued > 0 ? (
            <span className={styles.queueBadge}>
              {tr('queue', { count: String(queued) })}
            </span>
          ) : null}
        </header>
        <div className={styles.beatRail} aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={styles.beatTick}
              data-lit={i < decodeProgress || showingResult ? '1' : '0'}
            />
          ))}
        </div>
        <div className={styles.diceRow}>
          {faces.map((n, i) => {
            const isLocked = locked.has(i);
            const final = reveal.dice[i];
            const isSuccess = final >= reveal.difficulty;
            const isOne = final === 1;
            const cancelPulse =
              showCancel && showingResult && (isOne || (isSuccess && reveal.ones > 0));
            return (
              <span
                key={`${reveal.id}-${i}`}
                className={styles.die}
                data-locked={isLocked ? '1' : '0'}
                data-face={showingResult ? final : undefined}
                data-success={showingResult && isSuccess ? '1' : '0'}
                data-one={showingResult && isOne ? '1' : '0'}
                data-cancel={cancelPulse ? '1' : '0'}
              >
                {isLocked || showingResult ? final : n}
              </span>
            );
          })}
        </div>
        {showingResult && verdict ? (
          <div className={styles.verdictBlock} data-verdict={verdict}>
            <p className={styles.verdictTitle}>{t(`verdict.${verdict}.title`)}</p>
            <p className={styles.verdictDetail}>
              {tr(`verdict.${verdict}.detail`, {
                successes: String(reveal.successes),
                ones: String(reveal.ones),
                raw: String(rawSuccess),
                diff: String(reveal.difficulty),
              })}
            </p>
          </div>
        ) : (
          <p className={styles.result}>{t('scrambling')}</p>
        )}
        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.fastToggle}
            aria-pressed={fastMode}
            onClick={toggleFast}
          >
            {fastMode ? t('fastOn') : t('fastOff')}
          </button>
          <button type="button" className={styles.skipBtn} onClick={dismiss}>
            {queued > 0 ? t('skipNext') : t('skip')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export const DiceGlitchOverlay = DiceDecodeOverlay;
export default DiceDecodeOverlay;
