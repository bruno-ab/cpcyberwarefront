'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useCampaign } from '../../lib/campaign';
import { reportMinigameResult } from '../../lib/minigameResult';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import shell from './MinigameShell.module.css';
import styles from './RipperSurgeryGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';

/** Cirurgia do ripperdoc: mantenha o laser sobre o ponto de implante. */
export const RipperSurgeryGame = () => {
  const { campaignId, refresh } = useCampaign();
  const reported = useRef(false);
  const [status, setStatus] = useState<Status>('menu');
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState(0);
  const [humanityCost, setHumanityCost] = useState(0);
  const [recoveryHours, setRecoveryHours] = useState(0);
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const [target, setTarget] = useState({ x: 50, y: 42 });
  const [glitch, setGlitch] = useState(false);
  const [holding, setHolding] = useState(false);
  const drift = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 50, y: 50 });
  const errorsRef = useRef(0);

  const start = () => {
    reported.current = false;
    setProgress(0);
    setErrors(0);
    errorsRef.current = 0;
    setHumanityCost(1);
    setRecoveryHours(6);
    setTarget({
      x: 35 + Math.random() * 30,
      y: 30 + Math.random() * 30,
    });
    const startCursor = { x: 50, y: 80 };
    setCursor(startCursor);
    cursorRef.current = startCursor;
    drift.current = { x: 0, y: 0 };
    setHolding(false);
    setStatus('playing');
    playCyberSound('install');
  };

  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => {
      drift.current.x += (Math.random() - 0.5) * 1.6;
      drift.current.y += (Math.random() - 0.5) * 1.6;
      drift.current.x *= 0.92;
      drift.current.y *= 0.92;
      setCursor((c) => {
        const next = {
          x: Math.max(5, Math.min(95, c.x + drift.current.x * 0.35)),
          y: Math.max(5, Math.min(95, c.y + drift.current.y * 0.35)),
        };
        cursorRef.current = next;
        return next;
      });
    }, 50);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing' || !holding) return;
    const id = setInterval(() => {
      const c = cursorRef.current;
      const dx = c.x - target.x;
      const dy = c.y - target.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 8) {
        setProgress((p) => {
          const next = Math.min(100, p + 2.2);
          if (next >= 100) {
            setStatus('won');
            playCyberSound('reboot');
          } else if (Math.random() < 0.2) {
            playCyberSound('scan', { volume: 0.25 });
          }
          return next;
        });
      } else {
        const nextErr = errorsRef.current + 1;
        errorsRef.current = nextErr;
        setErrors(nextErr);
        setHumanityCost((h) => h + 1);
        setRecoveryHours((r) => r + 2);
        setGlitch(true);
        playCyberSound('wrong', { volume: 0.55 });
        setTimeout(() => setGlitch(false), 280);
        if (nextErr >= 12) {
          setStatus('lost');
          playCyberSound('lose');
        }
      }
    }, 120);
    return () => clearInterval(id);
  }, [status, holding, target]);

  useEffect(() => {
    if ((status !== 'won' && status !== 'lost') || reported.current) return;
    reported.current = true;
    reportMinigameResult(campaignId, 'surgery', status, {
      humanityCost,
      recoveryHours,
      errors,
    }).then(() => refresh());
  }, [status, campaignId, humanityCost, recoveryHours, errors, refresh]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (status !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const next = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
    cursorRef.current = next;
    setCursor(next);
  };

  return (
    <div className={shell.wrap} data-accent="alert" data-glitch={glitch ? '1' : '0'}>
      <header className={shell.head}>
        <h3>Cirurgia Ripperdoc</h3>
        <p>
          Segure o botão e mantenha o laser no ponto de implante. Desvio aumenta
          custo de Humanidade e horas de recuperação.
        </p>
      </header>

      {status === 'menu' && (
        <div className={shell.menu}>
          <button type="button" className={shell.start} onClick={start}>
            Abrir mesa cirúrgica
          </button>
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={shell.hud}>
            <span>IMPLANT {Math.round(progress)}%</span>
            <span>ERR {errors}</span>
            <span>HUM −{humanityCost}</span>
            <span className={shell.timer}>{recoveryHours}h recovery</span>
          </div>
          <div
            className={styles.table}
            onPointerMove={onMove}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture?.(e.pointerId);
              setHolding(true);
            }}
            onPointerUp={() => setHolding(false)}
            onPointerCancel={() => setHolding(false)}
            onPointerLeave={() => setHolding(false)}
          >
            <div
              className={styles.target}
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
            />
            <div
              className={styles.laser}
              style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
            />
            <p className={styles.prompt}>SEGURE para cortar</p>
          </div>
          <div className={styles.bar}>
            <div className={styles.fill} style={{ width: `${progress}%` }} />
          </div>
          {(status === 'won' || status === 'lost') && (
            <div className={shell.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>
                {status === 'won'
                  ? `Chrome instalado. Humanidade −${humanityCost}, recovery ${recoveryHours}h.`
                  : `Cirurgia abortada. Trauma: Humanidade −${humanityCost}, ${recoveryHours}h.`}
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

export default RipperSurgeryGame;
