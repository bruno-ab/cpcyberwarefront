'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from '../../i18n/useTranslations';
import {
  buildChromeBootPayload,
  randomBootDurationMs,
  type ChromeBootSheetSummary,
} from '../../lib/chromeBoot';
import styles from './ChromeBootSequence.module.css';

export type ChromeBootCharacter = {
  id: string;
  name: string;
  role?: string;
  sheetSummary?: ChromeBootSheetSummary;
} | null;

type Props = {
  active: boolean;
  character: ChromeBootCharacter;
  onDone: () => void;
};

export const ChromeBootSequence = ({ active, character, onDone }: Props) => {
  const { t } = useTranslations('vtt.chromeBoot');
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');
  const [durationMs] = useState(() => randomBootDurationMs());
  const timerRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  const payload = useMemo(() => {
    if (!character) return null;
    return buildChromeBootPayload(character, t);
  }, [character, t]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPhase('out');
    window.setTimeout(() => {
      setPhase('idle');
      onDone();
    }, 420);
  }, [onDone]);

  useEffect(() => {
    doneRef.current = false;
    if (!active) {
      setPhase('idle');
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    setPhase('in');
    timerRef.current = window.setTimeout(finish, durationMs);
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, durationMs, finish]);

  useEffect(() => {
    if (!active || phase !== 'in') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        finish();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [active, phase, finish]);

  if (!active || phase === 'idle') return null;

  const role =
    character?.role ||
    character?.sheetSummary?.role ||
    t('noRole');
  const noLink = !character;

  return (
    <div
      className={styles.overlay}
      data-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
      onClick={finish}
    >
      <div className={styles.scanlines} aria-hidden />
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        style={
          {
            '--boot-duration': `${durationMs}ms`,
          } as React.CSSProperties
        }
      >
        <header className={styles.header}>
          <div>
            <p className={styles.title}>{t('title')}</p>
            <p className={styles.sub}>{t('subtitle')}</p>
          </div>
          <span className={styles.role}>{role}</span>
        </header>

        {noLink ? (
          <>
            <p className={styles.runnerName}>{t('noChromeLinked')}</p>
            <p className={styles.emptyChrome}>{t('noChromeHint')}</p>
          </>
        ) : (
          <>
            <p className={styles.runnerName}>{character!.name}</p>
            <div className={styles.fwRow}>
              <span>{t('firmware')}</span>
              <span className={styles.fwValue}>{payload?.firmware}</span>
            </div>

            <p className={styles.sectionLabel}>{t('implants')}</p>
            {!payload?.implants.length ? (
              <p className={styles.emptyChrome}>{t('noImplants')}</p>
            ) : (
              <ul className={styles.implantList}>
                {payload.implants.map((row) => (
                  <li key={row.name}>
                    <span>{row.name}</span>
                    <span className={styles.implantFw}>fw {row.firmware}</span>
                  </li>
                ))}
              </ul>
            )}

            {payload && payload.warnings.length > 0 && (
              <div className={styles.warnings}>
                <p className={styles.sectionLabel}>{t('warningsLabel')}</p>
                <ul className={styles.warningList}>
                  {payload.warnings.map((w) => (
                    <li key={w.id} data-severity={w.severity}>
                      {w.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className={styles.progress} aria-hidden>
          <div className={styles.progressBar} />
        </div>

        <footer className={styles.footer}>
          <span className={styles.hint}>{t('skipHint')}</span>
          <button type="button" className={styles.skip} onClick={finish}>
            {t('skip')}
          </button>
        </footer>
      </div>
    </div>
  );
};
