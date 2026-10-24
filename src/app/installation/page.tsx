'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './installation.module.css';

/**
 * Tela de instalação de chrome — barra enche e volta ao ripperdoc.
 */
const InstallationPage = () => {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const redirected = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const characterId = searchParams.get('id');
  const pieceName = searchParams.get('name') || 'CYBERWARE';

  useEffect(() => {
    if (!characterId) {
      router.replace('/cyberware');
      return;
    }

    const started = Date.now();
    const durationMs = 4200;

    const tick = () => {
      const elapsed = Date.now() - started;
      const next = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(next);
      if (next < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    let frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [characterId, router]);

  useEffect(() => {
    if (!done || redirected.current || !characterId) return;
    redirected.current = true;
    const t = setTimeout(() => {
      router.push(`/cyberware?id=${characterId}`);
    }, 900);
    return () => clearTimeout(t);
  }, [done, characterId, router]);

  const barChars = 24;
  const filled = Math.round((progress / 100) * barChars);
  const bar =
    '#'.repeat(filled) + '.'.repeat(Math.max(0, barChars - filled));

  return (
    <div className={`${styles.terminal} ${done ? '' : styles.glitch}`}>
      <div className={styles.scanline} />
      <p className={styles.spinner}>{done ? '[OK]' : '[/]'}</p>
      <div className={styles.hydra}>
        <div className={styles.hydraRebooting}>
          <p>&lt; SYSTEM STATUS &gt;</p>
          <p className={styles.textSm}>INSTALLING: {pieceName.toUpperCase()}</p>
          <p className={styles.textSm}>
            PROCESS:{' '}
            <span className={styles.processAmount}>
              {progress.toFixed(0)}
            </span>
            %
          </p>
          <p className={styles.loadingBar} aria-hidden>
            ({bar.slice(0, filled)}
            <span className={styles.loadingBarUnloaded}>
              {bar.slice(filled)}
            </span>
            )
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {done && (
          <div className={styles.hydraRebootSuccess}>
            <p>REBOOTING SUCCESSFUL</p>
            <p className={styles.textSm}>Retornando ao ripperdoc…</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallationPage;
