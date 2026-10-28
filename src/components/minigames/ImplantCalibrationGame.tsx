'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCampaign } from '../../lib/campaign';
import { reportMinigameResult } from '../../lib/minigameResult';
import shell from './MinigameShell.module.css';
import styles from './ImplantCalibrationGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';

const CHANNELS = ['signal', 'power', 'sync', 'bleed'] as const;

/** Calibragem de implante: alinhe sliders e fique abaixo do limiar de cyberpsicose. */
export const ImplantCalibrationGame = () => {
  const { campaignId, refresh } = useCampaign();
  const reported = useRef(false);
  const [status, setStatus] = useState<Status>('menu');
  const [humanity, setHumanity] = useState(7);
  const [values, setValues] = useState([50, 50, 50, 50]);
  const [targets, setTargets] = useState([50, 50, 50, 50]);
  const [tries, setTries] = useState(0);

  const psychoThreshold = useMemo(
    () => Math.max(25, 55 - (10 - humanity) * 4),
    [humanity],
  );

  const stress = useMemo(() => {
    const err =
      values.reduce((acc, v, i) => acc + Math.abs(v - targets[i]), 0) / CHANNELS.length;
    return Math.min(100, Math.round(err * 1.4 + (10 - humanity) * 3));
  }, [values, targets, humanity]);

  const start = () => {
    reported.current = false;
    setTargets(CHANNELS.map(() => 20 + Math.floor(Math.random() * 60)));
    setValues(CHANNELS.map(() => 50));
    setTries(0);
    setStatus('playing');
  };

  const commit = () => {
    if (status !== 'playing') return;
    const next = tries + 1;
    setTries(next);
    // Vitória: stress sob o limiar de psico (e com margem mínima de estabilidade).
    if (stress <= psychoThreshold && stress <= Math.max(28, psychoThreshold - 5)) {
      setStatus('won');
      return;
    }
    if (next >= 5 || stress > 90) setStatus('lost');
  };

  useEffect(() => {
    if ((status !== 'won' && status !== 'lost') || reported.current) return;
    reported.current = true;
    reportMinigameResult(campaignId, 'calibrate', status, {
      humanity,
      stress,
      tries,
    }).then(() => refresh());
  }, [status, campaignId, humanity, stress, tries, refresh]);

  return (
    <div className={shell.wrap} data-accent="magenta">
      <header className={shell.head}>
        <h3>Calibragem de Implante</h3>
        <p>
          Ajuste os canais até estabilizar o chrome. A barra mostra o limiar de
          cyberpsicose — Humanidade baixa deixa a margem mais apertada.
        </p>
      </header>

      {status === 'menu' && (
        <div className={shell.menu}>
          <label>
            Humanidade atual
            <select
              value={humanity}
              onChange={(e) => setHumanity(Number(e.target.value))}
            >
              {[10, 9, 8, 7, 6, 5, 4, 3].map((h) => (
                <option key={h} value={h}>
                  {h} — limiar psico {Math.max(25, 55 - (10 - h) * 4)}%
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={shell.start} onClick={start}>
            Ligar bancada
          </button>
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={shell.hud}>
            <span>HUM {humanity}</span>
            <span>STRESS {stress}%</span>
            <span>TRY {tries}/5</span>
          </div>
          <div className={styles.meter}>
            <div className={styles.stress} style={{ width: `${stress}%` }} />
            <div
              className={styles.threshold}
              style={{ left: `${psychoThreshold}%` }}
              title="Limiar cyberpsicose"
            />
            <span className={styles.meterLabel}>
              limiar psico {psychoThreshold}%
            </span>
          </div>
          <div className={styles.sliders}>
            {CHANNELS.map((ch, i) => (
              <label key={ch} className={styles.row}>
                <span>{ch}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={values[i]}
                  disabled={status !== 'playing'}
                  onChange={(e) => {
                    const next = [...values];
                    next[i] = Number(e.target.value);
                    setValues(next);
                  }}
                />
                <em>{values[i]}</em>
              </label>
            ))}
          </div>
          {status === 'playing' && (
            <button type="button" className={shell.start} onClick={commit}>
              Commit calibração
            </button>
          )}
          <p className={shell.hint}>
            Alvo oculto: aproxime stress &lt; 35% e abaixo do limiar.
          </p>
          {(status === 'won' || status === 'lost') && (
            <div className={shell.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>
                {status === 'won'
                  ? 'Chrome estável — rejeição evitada.'
                  : 'Rejeição / pico psico. Narrador: risco de cyberpsicose.'}
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

export default ImplantCalibrationGame;
