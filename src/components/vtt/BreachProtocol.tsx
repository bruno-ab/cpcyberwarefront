'use client';

import { HudButton } from '../ui/HudButton';
import styles from './breach.module.css';

export type BreachState = {
  id: string;
  grid: string[][];
  buffer: string[];
  bufferSize: number;
  sequences: Array<{ id: string; name: string; seq: string[]; completed: boolean }>;
  status: string;
  daemonsApplied: string[];
};

type Props = {
  state: BreachState;
  onPick: (x: number, y: number) => void;
  onClose?: () => void;
};

export const BreachProtocol = ({ state, onPick, onClose }: Props) => (
  <div className={styles.wrap} role="dialog" aria-label="Breach Protocol">
    <header className={styles.head}>
      <strong>BREACH PROTOCOL</strong>
      {onClose && (
        <HudButton variant="ghost" onClick={onClose}>
          Fechar
        </HudButton>
      )}
    </header>
    <p>
      Buffer {state.buffer.length}/{state.bufferSize}: [{state.buffer.join(' ')}] — {state.status}
    </p>
    <div
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${state.grid.length}, 1fr)` }}
    >
      {state.grid.map((row, y) =>
        row.map((cell, x) => (
          <button
            key={`${x}-${y}`}
            type="button"
            className={styles.cell}
            disabled={state.status !== 'active'}
            onClick={() => onPick(x, y)}
          >
            {cell}
          </button>
        )),
      )}
    </div>
    <ul className={styles.seq}>
      {state.sequences.map((s) => (
        <li key={s.id} data-done={s.completed}>
          {s.name}: {s.seq.join(' → ')} {s.completed ? '✓' : ''}
        </li>
      ))}
    </ul>
    {state.daemonsApplied?.length > 0 && (
      <p className={styles.daemons}>Daemons: {state.daemonsApplied.join(', ')}</p>
    )}
  </div>
);
