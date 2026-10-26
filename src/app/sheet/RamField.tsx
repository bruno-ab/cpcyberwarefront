'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiUrl, authHeaders } from '../../lib/api';
import { computeCharacterRam } from '../../lib/characterRam';
import styles from './ramField.module.css';

type Props = {
  characterData: {
    id: string | number;
    sheet?: Record<string, any>;
    statBonuses?: Record<string, number>;
    cyberwares?: Array<{ name?: string }>;
  };
};

const RamField = ({ characterData }: Props) => {
  const sheet = characterData.sheet || {};
  const installedNames = useMemo(
    () =>
      (characterData.cyberwares || [])
        .map((c) => String(c.name || ''))
        .filter(Boolean),
    [characterData.cyberwares],
  );
  const breakdown = useMemo(
    () =>
      computeCharacterRam(sheet, characterData.statBonuses || {}, {
        installedNames,
      }),
    [sheet, characterData.statBonuses, installedNames],
  );

  const [current, setCurrent] = useState(breakdown.ram);

  useEffect(() => {
    setCurrent(breakdown.ram);
  }, [breakdown.ram, breakdown.ramMax]);

  const persist = (ram: number) => {
    const nextSheet = {
      ...sheet,
      other_traits: {
        ...(sheet.other_traits || {}),
        ram: Math.max(0, Math.min(breakdown.ramMax, ram)),
      },
    };
    fetch(apiUrl(`/api/characters/${characterData.id}/sheet`), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(nextSheet),
    }).catch((err) => console.error(err));
  };

  const setRam = (value: number) => {
    const clamped = Math.max(0, Math.min(breakdown.ramMax, value));
    setCurrent(clamped);
    persist(clamped);
  };

  if (!breakdown.hasNetDeck && breakdown.ramMax <= 0) {
    return (
      <section className={styles.wrap} data-disabled="1">
        <h4 className={styles.title}>RAM</h4>
        <p className={styles.hint}>
          Sem cyberdeck ou interface NET instalado — RAM indisponível na mesa.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.wrap} aria-label="RAM do deck">
      <div className={styles.top}>
        <h4 className={styles.title}>RAM</h4>
        <div className={styles.ratio}>
          {current}/{breakdown.ramMax}
        </div>
      </div>
      {breakdown.ramBonus > 0 ? (
        <p className={styles.boost}>
          Máx. {breakdown.ramBase}+{breakdown.ramBonus} chrome
        </p>
      ) : (
        <p className={styles.boost}>Buffer base do deck · {breakdown.ramBase}</p>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={breakdown.ramMax}
      >
        <span
          className={styles.fill}
          style={{
            width: `${breakdown.ramMax > 0 ? (current / breakdown.ramMax) * 100 : 0}%`,
          }}
        />
      </div>
      <label className={styles.field}>
        Atual
        <input
          type="number"
          min={0}
          max={breakdown.ramMax}
          value={current}
          onChange={(e) => setCurrent(Math.max(0, Number(e.target.value) || 0))}
          onBlur={(e) => setRam(Number(e.target.value) || 0)}
        />
      </label>
      <div className={styles.actions}>
        <button type="button" onClick={() => setRam(current - 1)}>
          −1
        </button>
        <button type="button" onClick={() => setRam(breakdown.ramMax)}>
          Recarregar deck
        </button>
        <button type="button" onClick={() => setRam(current + 1)}>
          +1
        </button>
      </div>
    </section>
  );
};

export default RamField;
