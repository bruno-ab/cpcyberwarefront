'use client';

import { useEffect, useRef, useState } from 'react';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import shell from './MinigameShell.module.css';
import styles from './CyberpsychosisSurgeGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';
type Target = { id: number; x: number; y: number };

/** Surto de cyberpsicose: acompanhe alvos enquanto a HUD glitcha. */
export const CyberpsychosisSurgeGame = () => {
  const [status, setStatus] = useState<Status>('menu');
  const [humanity, setHumanity] = useState(6);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [glitch, setGlitch] = useState(false);
  const [remaining, setRemaining] = useState(20);
  const seq = useRef(0);

  const spawnRate = Math.max(400, 1100 - (10 - humanity) * 80);
  const goal = 8 + Math.floor((10 - humanity) / 2);
  const maxMiss = Math.max(2, 5 - Math.floor((10 - humanity) / 3));

  const start = () => {
    setScore(0);
    setMisses(0);
    setTargets([]);
    setRemaining(20);
    setStatus('playing');
    playCyberSound('surge');
  };

  useEffect(() => {
    if (status !== 'playing') return;
    const spawn = setInterval(() => {
      setGlitch(true);
      playCyberSound('glitch', { volume: 0.35 });
      setTimeout(() => setGlitch(false), 180);
      const id = ++seq.current;
      setTargets((prev) => [
        ...prev.slice(-4),
        {
          id,
          x: 10 + Math.random() * 80,
          y: 15 + Math.random() * 70,
        },
      ]);
      setTimeout(() => {
        setTargets((prev) => {
          if (!prev.some((t) => t.id === id)) return prev;
          setMisses((m) => m + 1);
          return prev.filter((t) => t.id !== id);
        });
      }, spawnRate + 700);
    }, spawnRate);
    return () => clearInterval(spawn);
  }, [status, spawnRate]);

  useEffect(() => {
    if (status !== 'playing') return;
    if (remaining <= 0) {
      setStatus(score >= goal ? 'won' : 'lost');
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [status, remaining, score, goal]);

  useEffect(() => {
    if (status !== 'playing') return;
    if (misses >= maxMiss) {
      setStatus('lost');
      playCyberSound('lose');
    }
    if (score >= goal) {
      setStatus('won');
      playCyberSound('win');
    }
  }, [misses, score, status, maxMiss, goal]);

  const hit = (id: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    setScore((s) => s + 1);
    playCyberSound('correct', { volume: 0.7 });
  };

  return (
    <div
      className={shell.wrap}
      data-accent="alert"
      data-glitch={glitch ? '1' : '0'}
    >
      <header className={shell.head}>
        <h3>Surto de Cyberpsicose</h3>
        <p>
          Clique nos ecos antes que sumam. Humanidade baixa = spawns mais
          rápidos, mais alvos e menos erros permitidos.
        </p>
      </header>

      {status === 'menu' && (
        <div className={shell.menu}>
          <label>
            Humanidade
            <select
              value={humanity}
              onChange={(e) => setHumanity(Number(e.target.value))}
            >
              {[10, 8, 6, 4, 2].map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={shell.start} onClick={start}>
            Entrar no surto
          </button>
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={shell.hud}>
            <span>
              FOCUS {score}/{goal}
            </span>
            <span>
              MISS {misses}/{maxMiss}
            </span>
            <span className={shell.timer}>{remaining}s</span>
          </div>
          <div className={styles.field} data-noise={glitch ? '1' : '0'}>
            {targets.map((t) => (
              <button
                key={t.id}
                type="button"
                className={styles.echo}
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
                onClick={() => hit(t.id)}
                aria-label="eco"
              />
            ))}
            <div className={styles.noise} aria-hidden />
          </div>
          {(status === 'won' || status === 'lost') && (
            <div className={shell.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>
                {status === 'won'
                  ? 'Foco recuperado — surto contido.'
                  : 'Perdeu o controle. Narrador: cena de cyberpsicose.'}
              </p>
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

export default CyberpsychosisSurgeGame;
