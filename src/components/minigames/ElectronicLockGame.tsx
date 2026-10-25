'use client';

import { useEffect, useMemo, useState } from 'react';
import shell from './MinigameShell.module.css';
import styles from './ElectronicLockGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';

const RINGS = 3;

/** Arrombamento: alinhe os anéis da fechadura. Tecnologia reduz a tolerância necessária. */
export const ElectronicLockGame = () => {
  const [status, setStatus] = useState<Status>('menu');
  const [tech, setTech] = useState(2);
  const [angles, setAngles] = useState([0, 0, 0]);
  const [targets, setTargets] = useState([0, 0, 0]);
  const [attempts, setAttempts] = useState(0);
  const [msg, setMsg] = useState('');

  const tolerance = useMemo(() => Math.max(6, 18 - tech * 2), [tech]);
  const maxAttempts = useMemo(() => 4 + Math.floor(tech / 2), [tech]);

  const start = () => {
    setTargets(
      Array.from({ length: RINGS }, () => Math.floor(Math.random() * 360)),
    );
    setAngles(Array.from({ length: RINGS }, () => Math.floor(Math.random() * 360)));
    setAttempts(0);
    setMsg('');
    setStatus('playing');
  };

  const diff = (a: number, b: number) => {
    const d = Math.abs(((a - b) % 360 + 360) % 360);
    return Math.min(d, 360 - d);
  };

  const aligned = angles.every((a, i) => diff(a, targets[i]) <= tolerance);

  useEffect(() => {
    if (status !== 'playing') return;
    if (aligned) {
      setStatus('won');
      setMsg('Fechadura aberta — maglock liberado.');
    }
  }, [aligned, status]);

  const rotate = (i: number, delta: number) => {
    if (status !== 'playing') return;
    setAngles((prev) => {
      const next = [...prev];
      next[i] = (((next[i] + delta) % 360) + 360) % 360;
      return next;
    });
  };

  const tryPick = () => {
    if (status !== 'playing') return;
    if (aligned) {
      setStatus('won');
      setMsg('Fechadura aberta — maglock liberado.');
      return;
    }
    const next = attempts + 1;
    setAttempts(next);
    if (next >= maxAttempts) {
      setStatus('lost');
      setMsg('Alarme! Tentativas esgotadas.');
    } else {
      setMsg(`Fora do alinhamento (±${tolerance}°). Restam ${maxAttempts - next}.`);
    }
  };

  return (
    <div className={shell.wrap} data-accent="yellow">
      <header className={shell.head}>
        <h3>Arrombamento</h3>
        <p>
          Gire os anéis até alinhar os marcadores. Tecnologia mais alta =
          tolerância maior e mais tentativas.
        </p>
      </header>

      {status === 'menu' && (
        <div className={shell.menu}>
          <label>
            Tecnologia (0–5)
            <select
              value={tech}
              onChange={(e) => setTech(Number(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} — tolerância ±{Math.max(6, 18 - n * 2)}° / {4 + Math.floor(n / 2)} tries
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={shell.start} onClick={start}>
            Iniciar lockpick
          </button>
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={shell.hud}>
            <span>TECH {tech}</span>
            <span>±{tolerance}°</span>
            <span>
              TRY {attempts}/{maxAttempts}
            </span>
          </div>
          <div className={styles.lock}>
            {angles.map((ang, i) => (
              <div
                key={i}
                className={styles.ring}
                style={{
                  width: `${70 - i * 16}%`,
                  height: `${70 - i * 16}%`,
                  transform: `rotate(${ang}deg)`,
                  zIndex: RINGS - i,
                }}
              >
                <span className={styles.marker} />
                <span
                  className={styles.target}
                  style={{ transform: `rotate(${targets[i] - ang}deg)` }}
                />
              </div>
            ))}
            <div className={styles.core} />
          </div>
          <div className={styles.controls}>
            {angles.map((_, i) => (
              <div key={i} className={styles.ringCtrl}>
                <span>Anel {i + 1}</span>
                <button type="button" className={shell.action} onClick={() => rotate(i, -12)}>
                  ◀
                </button>
                <button type="button" className={shell.action} onClick={() => rotate(i, 12)}>
                  ▶
                </button>
              </div>
            ))}
          </div>
          {status === 'playing' && (
            <button type="button" className={shell.start} onClick={tryPick}>
              Forçar pin
            </button>
          )}
          {msg && <p className={shell.hint}>{msg}</p>}
          {(status === 'won' || status === 'lost') && (
            <div className={shell.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>{status === 'won' ? 'Acesso concedido.' : 'ICE local alertado.'}</p>
              <button type="button" className={shell.start} onClick={start}>
                De novo
              </button>
              <button type="button" className={shell.ghost} onClick={() => setStatus('menu')}>
                Menu
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ElectronicLockGame;
