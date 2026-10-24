'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiUrl, authHeaders } from '../../lib/api';
import styles from './vitalityField.module.css';

type Band = 'ok' | 'bruise' | 'hurt' | 'crit' | 'dead';

type Props = {
  characterData: {
    id: string | number;
    sheet?: Record<string, any>;
  };
};

const bandForIndex = (index1: number, max: number): Band => {
  if (max <= 0) return 'ok';
  if (index1 >= max) return 'dead';
  const ratio = index1 / max;
  if (ratio <= 0) return 'ok';
  if (ratio <= 0.3) return 'bruise';
  if (ratio <= 0.55) return 'hurt';
  if (ratio < 1) return 'crit';
  return 'dead';
};

const severityFromMarked = (marked: number, max: number): number => {
  if (max <= 0) return 0;
  if (marked <= 0) return 0;
  if (marked >= max) return 5;
  const ratio = marked / max;
  if (ratio <= 0.3) return 1;
  if (ratio <= 0.55) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
};

const conditionMessage = (marked: number, max: number): string => {
  if (marked <= 0) return 'Saudável — sem penalidade na parada.';
  if (marked >= max) return 'INCAPACITADO / MORTO — jack fora.';
  const ratio = marked / max;
  if (ratio <= 0.3) return 'Escoriado — −1 dado nas paradas físicas.';
  if (ratio <= 0.55) return 'Machucado — −2 dados; teste Stamina sob stress.';
  if (ratio <= 0.75) return 'Gravemente ferido — −3 dados; movimento reduzido.';
  return 'Aleijado — −4 dados; só ações desesperadas.';
};

const BAND_LABELS: Record<Band, string> = {
  ok: 'Saudável',
  bruise: 'Escoriado',
  hurt: 'Machucado',
  crit: 'Crítico',
  dead: 'Morto',
};

const VitalityField = ({ characterData }: Props) => {
  const [max, setMax] = useState(7);
  const [marked, setMarked] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const nextMax = Number(characterData?.sheet?.vitality ?? 7) || 7;
    const nextMarked = Math.min(
      Number(characterData?.sheet?.vitality_marked ?? 0) || 0,
      nextMax,
    );
    setMax(nextMax);
    setMarked(nextMarked);
    setMessage(conditionMessage(nextMarked, nextMax));
  }, [characterData?.sheet?.vitality, characterData?.sheet?.vitality_marked]);

  const severity = severityFromMarked(marked, max);
  const activeBand: Band =
    marked <= 0 ? 'ok' : bandForIndex(marked, max);

  const boxes = useMemo(
    () => Array.from({ length: Math.max(0, max) }, (_, i) => i + 1),
    [max],
  );

  const persist = (nextMax: number, nextMarked: number) => {
    const sheet = { ...(characterData.sheet || {}) };
    sheet.vitality = nextMax;
    sheet.vitality_marked = nextMarked;
    fetch(apiUrl(`/api/characters/${characterData.id}/sheet`), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(sheet),
    }).catch((err) => console.error(err));
  };

  const applyMarked = (next: number) => {
    const clamped = Math.max(0, Math.min(max, next));
    setMarked(clamped);
    setMessage(conditionMessage(clamped, max));
    persist(max, clamped);
  };

  const onBoxClick = (index1: number) => {
    if (marked === index1) {
      applyMarked(index1 - 1);
    } else {
      applyMarked(index1);
    }
  };

  const onMaxChange = (value: number) => {
    const nextMax = Math.max(1, Math.min(20, value || 1));
    const nextMarked = Math.min(marked, nextMax);
    setMax(nextMax);
    setMarked(nextMarked);
    setMessage(conditionMessage(nextMarked, nextMax));
  };

  return (
    <section
      className={styles.wrap}
      data-severity={severity}
      aria-label="Trilha de vitalidade"
    >
      <div className={styles.scan} aria-hidden />

      <div className={styles.top}>
        <h4 className={styles.title}>Vitalidade</h4>
        <div className={styles.ratio}>
          {marked}/{max}
        </div>
        <label className={styles.maxField}>
          Máx.
          <input
            type="number"
            min={1}
            max={20}
            value={max}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            onBlur={() => persist(max, marked)}
          />
        </label>
      </div>

      <div className={styles.bands} aria-hidden>
        {(Object.keys(BAND_LABELS) as Band[]).map((band) => (
          <span
            key={band}
            className={styles.bandTag}
            data-band={band}
            data-active={activeBand === band}
          >
            {BAND_LABELS[band]}
          </span>
        ))}
      </div>

      <div className={styles.track} role="group" aria-label="Marcar dano">
        {boxes.map((n) => {
          const filled = n <= marked;
          const band = bandForIndex(n, max);
          return (
            <button
              key={n}
              type="button"
              className={styles.box}
              data-filled={filled}
              data-band={band}
              aria-pressed={filled}
              aria-label={`Vitalidade ${n} de ${max}`}
              onClick={() => onBoxClick(n)}
            >
              <span className={styles.boxIndex}>{n}</span>
            </button>
          );
        })}
      </div>

      <p className={styles.status}>{message}</p>
      <p className={styles.hint}>
        Clique num quadrado pra marcar dano até ele · clique de novo no último
        pra curar 1.
      </p>

      <div className={styles.actions}>
        <button type="button" onClick={() => applyMarked(Math.max(0, marked - 1))}>
          −1 dano
        </button>
        <button type="button" onClick={() => applyMarked(marked + 1)}>
          +1 dano
        </button>
        <button type="button" onClick={() => applyMarked(0)}>
          Curar tudo
        </button>
      </div>
    </section>
  );
};

export default VitalityField;
