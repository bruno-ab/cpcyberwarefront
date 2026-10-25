'use client';

import { useMemo, useState } from 'react';
import { formatStatLabel } from '../../lib/formatStatLabel';
import { StatDots } from './StatDots';
import styles from './StatPanel.module.css';

export type StatColumn = {
  id: string;
  title: string;
  keys: string[];
  values: Record<string, number>;
};

type Props = {
  columns: StatColumn[];
  bonuses?: Record<string, number>;
  onDotClick: (
    columnId: string,
    key: string,
    index: number,
  ) => void;
};

export const StatPanel = ({ columns, bonuses = {}, onDotClick }: Props) => {
  const [openId, setOpenId] = useState<string | null>(columns[0]?.id ?? null);

  const boostList = useMemo(
    () =>
      Object.entries(bonuses)
        .filter(([, v]) => Number(v) > 0)
        .map(([k, v]) => `${formatStatLabel(k)} +${v}`),
    [bonuses],
  );

  return (
    <div className={styles.block}>
      <div className={styles.legend} aria-hidden>
        <span className={styles.swatch} data-kind="base">
          <i>●</i> ficha
        </span>
        <span className={styles.swatch} data-kind="bonus">
          <i>●</i> chrome instalado
        </span>
      </div>

      {boostList.length > 0 ? (
        <p className={styles.boosts}>
          <strong>Chrome boosts:</strong>
          {boostList.join(' · ')}
        </p>
      ) : null}

      <div className={styles.grid}>
        {columns.map((col) => {
          const open = openId === col.id;
          return (
            <section key={col.id} className={styles.panel}>
              <button
                type="button"
                className={`${styles.panelHead} ${styles.toggle}`}
                aria-expanded={open}
                onClick={() =>
                  setOpenId((prev) => (prev === col.id ? null : col.id))
                }
              >
                <h4 className={styles.panelTitle}>{col.title}</h4>
                <span className={styles.chevron}>{open ? '−' : '+'}</span>
              </button>

              <div className={`${styles.panelHead} ${styles.panelHeadStatic}`}>
                <h4 className={styles.panelTitle}>{col.title}</h4>
                <span className={styles.panelAccent} aria-hidden />
              </div>

              <div className={styles.rows} data-open={open ? '1' : '0'}>
                {col.keys.map((key) => {
                  const base = Number(col.values[key]) || 0;
                  const bonus = Number(bonuses[key]) || 0;
                  return (
                    <div key={key} className={styles.row}>
                      <span className={styles.rowLabel}>
                        {formatStatLabel(key)}
                      </span>
                      <StatDots
                        base={base}
                        bonus={bonus}
                        max={5}
                        onBaseClick={(index) =>
                          onDotClick(col.id, key, index)
                        }
                        label={`${formatStatLabel(key)}: ${base}${
                          bonus ? ` +${bonus} chrome` : ''
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default StatPanel;
