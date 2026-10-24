'use client';

import { useEffect, useState } from 'react';
import styles from './scanner.module.css';

export type ScannerSlot = {
  id: string;
  label: string;
  anchor: { x: number; y: number };
  side: 'left' | 'right';
  installed?: Array<{ name: string; rarity?: string }>;
};

type Props = {
  slots: ScannerSlot[];
  capacityUsed?: number;
  capacityMax?: number;
  humanity?: number;
  onPsychosis?: (payload: { humanity: number }) => void;
};

export const BodyScanner = ({
  slots,
  capacityUsed = 0,
  capacityMax = 10,
  humanity = 7,
  onPsychosis,
}: Props) => {
  const [hover, setHover] = useState<string | null>(null);
  const over = capacityUsed > capacityMax;
  const psycho = humanity < 0;

  useEffect(() => {
    if (psycho && onPsychosis) onPsychosis({ humanity });
  }, [psycho, humanity, onPsychosis]);

  const active = slots.find((s) => s.id === hover);

  return (
    <div className={styles.wrap} data-alert={over || psycho}>
      <svg viewBox="0 0 200 360" className={styles.svg} role="img" aria-label="Body scanner">
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2030" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="40" rx="28" ry="32" fill="url(#bodyGrad)" stroke="#2be4ea" />
        <rect x="70" y="70" width="60" height="100" rx="8" fill="url(#bodyGrad)" stroke="#2be4ea" />
        <rect x="40" y="80" width="28" height="90" rx="6" fill="url(#bodyGrad)" stroke="#2be4ea" />
        <rect x="132" y="80" width="28" height="90" rx="6" fill="url(#bodyGrad)" stroke="#2be4ea" />
        <rect x="75" y="170" width="22" height="110" rx="6" fill="url(#bodyGrad)" stroke="#2be4ea" />
        <rect x="103" y="170" width="22" height="110" rx="6" fill="url(#bodyGrad)" stroke="#2be4ea" />
        {slots.map((s) => (
          <g key={s.id}>
            <circle
              cx={s.anchor.x * 2}
              cy={s.anchor.y * 3.6}
              r={6}
              className={styles.anchor}
              data-filled={(s.installed?.length || 0) > 0}
              onMouseEnter={() => setHover(s.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(s.id)}
              tabIndex={0}
              role="button"
              aria-label={s.label}
            />
            <line
              x1={s.anchor.x * 2}
              y1={s.anchor.y * 3.6}
              x2={s.side === 'left' ? 20 : 180}
              y2={s.anchor.y * 3.6}
              className={styles.callout}
            />
            <text
              x={s.side === 'left' ? 18 : 182}
              y={s.anchor.y * 3.6 - 4}
              textAnchor={s.side === 'left' ? 'start' : 'end'}
              className={styles.label}
            >
              {s.label.split('/')[0].trim().slice(0, 14)}
            </text>
          </g>
        ))}
      </svg>
      <aside className={styles.tooltip} aria-live="polite">
        <p>
          Capacidade {capacityUsed}/{capacityMax}
          {over ? ' — EXCESSO' : ''}
        </p>
        <p>
          Humanidade {humanity}
          {psycho ? ' — PSICOSE' : ''}
        </p>
        {active ? (
          <>
            <h4>{active.label}</h4>
            <ul>
              {(active.installed || []).length === 0 && <li>Vazio</li>}
              {(active.installed || []).map((i) => (
                <li key={i.name}>
                  {i.name} {i.rarity ? `(${i.rarity})` : ''}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Passe o cursor nos âncoras.</p>
        )}
        {psycho && (
          <p className={styles.alert}>Alerta biomonitor: limiar de psicose cruzado.</p>
        )}
      </aside>
    </div>
  );
};
