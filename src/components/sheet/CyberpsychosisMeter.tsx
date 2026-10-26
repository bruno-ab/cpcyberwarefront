'use client';

import styles from './CyberpsychosisMeter.module.css';

type Capacity = {
  baseCapacity?: number;
  used?: number;
  remaining?: number;
  inCyberpsychosis?: boolean;
  cyberpsychosisSeverity?: number;
};

type Props = {
  capacity?: Capacity | null;
  installedCount?: number;
};

const SEGMENTS = 10;

/** Mesmo limiar de `statusLabel` (“Carga crítica”) — barras vermelhas a partir da 8ª. */
export const CYBERPSYCHOSIS_CRITICAL_RATIO = 0.75;

export const isCyberpsychosisCritical = (
  ratio: number,
  inPsycho: boolean,
): boolean => inPsycho || ratio >= CYBERPSYCHOSIS_CRITICAL_RATIO;

/** Cor por posição na escala (0 = verde … 1 = vermelho). */
const segmentColor = (t: number) => {
  const clamped = Math.max(0, Math.min(1, t));
  // verde #1db954 → amarelo #e6c200 → vermelho #ff2a2a
  if (clamped < 0.5) {
    const u = clamped / 0.5;
    const r = Math.round(29 + (230 - 29) * u);
    const g = Math.round(185 + (194 - 185) * u);
    const b = Math.round(84 + (0 - 84) * u);
    return `rgb(${r},${g},${b})`;
  }
  const u = (clamped - 0.5) / 0.5;
  const r = Math.round(230 + (255 - 230) * u);
  const g = Math.round(194 + (42 - 194) * u);
  const b = Math.round(0 + (42 - 0) * u);
  return `rgb(${r},${g},${b})`;
};

const statusLabel = (ratio: number, inPsycho: boolean, severity: number) => {
  if (inPsycho || severity > 0) {
    return `Cyberpsicose ativa · severidade ${severity}`;
  }
  if (ratio >= 1) return 'No limite — próximo passo é overclock';
  if (ratio >= 0.75) return 'Carga crítica';
  if (ratio >= 0.5) return 'Carga elevada';
  if (ratio >= 0.25) return 'Carga moderada';
  if (ratio > 0) return 'Carga leve';
  return 'Estável — sem chrome pesado';
};

export const CyberpsychosisMeter = ({
  capacity,
  installedCount = 0,
}: Props) => {
  const base = Math.max(1, Number(capacity?.baseCapacity) || 10);
  const used = Math.max(0, Number(capacity?.used) || 0);
  const remaining = Number(capacity?.remaining);
  const severity = Math.max(0, Number(capacity?.cyberpsychosisSeverity) || 0);
  const inPsycho = Boolean(capacity?.inCyberpsychosis) || severity > 0;

  // Preenche barras pela carga; overclock estende além de 100% (todas cheias + pulse).
  const ratio = used / base;
  const filled = Math.min(
    SEGMENTS,
    Math.max(0, Math.ceil(Math.min(ratio, 1.25) * SEGMENTS)),
  );
  const isCritical = isCyberpsychosisCritical(ratio, inPsycho);

  return (
    <section
      className={`${styles.wrap}${isCritical ? ` ${styles.critical}` : ''}`}
      data-psycho={inPsycho ? '1' : '0'}
      data-severity={isCritical ? 'red' : 'normal'}
      aria-label="Medidor de cyberpsicose"
    >
      {isCritical ? (
        <div className={styles.alertRow} role="status">
          <span className={styles.alertBadge}>Alerta · Cyberpsicose</span>
          <span className={styles.alertHint}>
            {inPsycho ? 'Psicose ativa — estabilize na mesa' : 'Risco crítico'}
          </span>
        </div>
      ) : null}

      <header className={styles.head}>
        <h3 className={styles.title}>Cyberpsicose</h3>
        <span className={styles.meta}>
          carga {used}/{base}
          {installedCount > 0 ? ` · ${installedCount} peças` : ''}
          {Number.isFinite(remaining) ? ` · livre ${remaining}` : ''}
        </span>
      </header>

      <div
        className={styles.track}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={base}
        aria-valuenow={used}
        aria-valuetext={statusLabel(ratio, inPsycho, severity)}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const on = i < filled;
          const t = (i + 0.5) / SEGMENTS;
          return (
            <span
              key={i}
              className={styles.bar}
              data-on={on ? '1' : '0'}
              style={
                on
                  ? {
                      background: segmentColor(t),
                      boxShadow: `0 0 10px ${segmentColor(t)}88`,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>

      <p
        className={styles.status}
        data-warn={inPsycho ? '1' : '0'}
        data-critical={isCritical ? '1' : '0'}
      >
        {statusLabel(ratio, inPsycho, severity)}
      </p>
    </section>
  );
};

export default CyberpsychosisMeter;
