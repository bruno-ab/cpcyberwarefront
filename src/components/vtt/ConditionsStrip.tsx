'use client';

import { HudButton } from '../ui/HudButton';
import styles from './conditionsStrip.module.css';

export type ConditionRow = {
  id: string;
  tokenId: string;
  kind: string;
  label: string;
  roundsLeft: number;
};

const PRESETS = [
  { kind: 'stunned', label: 'Atordoado', rounds: 1 },
  { kind: 'suppressed', label: 'Suprimido', rounds: 2 },
  { kind: 'bleeding', label: 'Sangrando', rounds: 3 },
  { kind: 'hacked', label: 'Hackeado', rounds: 2 },
] as const;

type Props = {
  tokenId: string | null;
  tokenName?: string;
  conditions: ConditionRow[];
  isGm: boolean;
  onAdd: (kind: string, label: string, roundsLeft: number) => void;
  onRemove: (id: string) => void;
};

export const ConditionsStrip = ({
  tokenId,
  tokenName,
  conditions,
  isGm,
  onAdd,
  onRemove,
}: Props) => {
  if (!tokenId) return null;
  const mine = conditions.filter((c) => c.tokenId === tokenId);

  return (
    <div className={styles.wrap} aria-label="Condições do token">
      <div className={styles.head}>
        Condições{tokenName ? ` · ${tokenName}` : ''}
      </div>
      {mine.length === 0 ? (
        <p className={styles.empty}>Nenhuma condição ativa</p>
      ) : (
        <ul className={styles.list}>
          {mine.map((c) => (
            <li key={c.id}>
              <span>
                {c.label} <em>{c.roundsLeft}r</em>
              </span>
              {isGm ? (
                <button
                  type="button"
                  className={styles.x}
                  onClick={() => onRemove(c.id)}
                  aria-label={`Remover ${c.label}`}
                >
                  ×
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {isGm ? (
        <div className={styles.presets}>
          {PRESETS.map((p) => (
            <HudButton
              key={p.kind}
              variant="ghost"
              onClick={() => onAdd(p.kind, p.label, p.rounds)}
            >
              + {p.label}
            </HudButton>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ConditionsStrip;
