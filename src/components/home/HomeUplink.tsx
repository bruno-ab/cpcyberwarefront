'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotion } from '../../motion/useMotion';
import pt from '../../i18n/messages/pt-BR.json';
import en from '../../i18n/messages/en.json';
import { useTranslations } from '../../i18n/useTranslations';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import styles from './HomeUplink.module.css';

const GLITCH_CHARS = '█▓░#@$%&';

const corruptLine = (text: string): string => {
  const chars = text.split('');
  const n = Math.min(4, Math.max(2, Math.floor(chars.length * 0.12)));
  for (let i = 0; i < n; i += 1) {
    const idx = Math.floor(Math.random() * chars.length);
    chars[idx] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]!;
  }
  return chars.join('');
};

export const HomeUplink = () => {
  const { t, locale } = useTranslations('home');
  const { animationsOn } = useMotion();
  const catalog = locale === 'en' ? en : pt;
  const feedLines = catalog.home.uplink.feed;

  const [log, setLog] = useState<string[]>([]);
  const [typing, setTyping] = useState('');
  const [busy, setBusy] = useState(false);
  const [glitchLine, setGlitchLine] = useState<number | null>(null);
  const lineIndex = useRef(0);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const pushLine = useCallback(
    (full: string, withGlitch: boolean) => {
      if (!withGlitch || !animationsOn) {
        setLog((prev) => [...prev.slice(-5), full]);
        return;
      }
      const corrupted = corruptLine(full);
      setLog((prev) => [...prev.slice(-5), corrupted]);
      setGlitchLine(-1);
      const fixId = window.setTimeout(() => {
        setLog((prev) => {
          const next = [...prev];
          next[next.length - 1] = full;
          return next;
        });
        setGlitchLine(null);
      }, 280);
      timers.current.push(fixId);
    },
    [animationsOn],
  );

  const runFeedLine = useCallback(() => {
    if (!feedLines.length || busy) return;
    const full = feedLines[lineIndex.current % feedLines.length]!;
    lineIndex.current += 1;
    setBusy(true);
    setTyping('');
    playCyberSound('key', { volume: 0.22 });

    let i = 0;
    const typeTick = () => {
      i += 1;
      setTyping(full.slice(0, i));
      if (i < full.length) {
        const id = window.setTimeout(typeTick, 18 + Math.random() * 22);
        timers.current.push(id);
      } else {
        const finishId = window.setTimeout(() => {
          const doGlitch = animationsOn && Math.random() < 0.35;
          pushLine(full, doGlitch);
          setTyping('');
          setBusy(false);
        }, 120);
        timers.current.push(finishId);
      }
    };
    typeTick();
  }, [animationsOn, busy, feedLines, pushLine]);

  const onTerminalClick = () => {
    if (busy) return;
    playCyberSound('ui', { volume: 0.28 });
    runFeedLine();
  };

  return (
    <div className={styles.frame}>
      <div className={styles.scanlines} aria-hidden />
      <div className={styles.vignette} aria-hidden />
      <button
        type="button"
        className={styles.terminal}
        onClick={onTerminalClick}
        aria-label={t('uplink.aria')}
      >
        <div className={styles.termHead}>
          <span className={styles.termTag}>{t('uplink.tag')}</span>
          <span className={styles.termStatus} data-busy={busy || undefined}>
            {busy ? t('uplink.syncing') : t('uplink.idle')}
          </span>
        </div>
        <div className={styles.skyline} aria-hidden>
          <svg viewBox="0 0 640 360" className={styles.skySvg}>
            <defs>
              <linearGradient id="homeSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#120818" />
                <stop offset="100%" stopColor="#0a0a0c" />
              </linearGradient>
            </defs>
            <rect width="640" height="360" fill="url(#homeSky)" />
            <g fill="#12141a" stroke="#fcee0a" strokeWidth="1.5">
              <path d="M0 300 L40 300 L40 180 L80 180 L80 220 L120 220 L120 140 L160 140 L160 300 Z" />
              <path d="M170 300 L170 120 L210 90 L250 120 L250 300 Z" />
              <path d="M260 300 L260 160 L320 160 L320 100 L360 100 L360 300 Z" />
              <path d="M380 300 L380 200 L420 200 L420 80 L460 80 L480 110 L500 80 L540 80 L540 300 Z" />
              <path d="M550 300 L550 190 L600 190 L600 240 L640 240 L640 300 Z" />
            </g>
            <g stroke="#2be4ea" strokeWidth="1" opacity="0.7">
              <line x1="0" y1="310" x2="640" y2="310" />
              <line x1="80" y1="200" x2="80" y2="210" />
              <line x1="140" y1="160" x2="140" y2="170" />
              <line x1="300" y1="120" x2="300" y2="130" />
              <line x1="450" y1="100" x2="450" y2="115" />
            </g>
          </svg>
        </div>
        <div className={styles.logPane}>
          {log.map((line, idx) => (
            <p
              key={`${idx}-${line.slice(0, 8)}`}
              className={styles.logLine}
              data-glitch={
                glitchLine === -1 && idx === log.length - 1 ? true : undefined
              }
            >
              <span className={styles.prompt}>{'>'}</span> {line}
            </p>
          ))}
          <p className={styles.logLine} data-active>
            <span className={styles.prompt}>{'>'}</span>{' '}
            {typing}
            <span className={styles.cursor} aria-hidden>
              ▮
            </span>
          </p>
          <p className={styles.hint}>{t('uplink.hint')}</p>
        </div>
      </button>
    </div>
  );
};
