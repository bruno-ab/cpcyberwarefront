'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { HudButton } from '../ui/HudButton';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import styles from './breach.module.css';

export type BreachState = {
  id: string;
  challengeId?: string;
  challengeName?: string;
  difficulty?: string;
  grid: string[][];
  size?: number;
  buffer: string[];
  bufferSize: number;
  used?: string[];
  nextAxis?: 'row' | 'col' | null;
  lockedIndex?: number | null;
  sequences: Array<{ id: string; name: string; seq: string[]; completed: boolean }>;
  status: string;
  daemonsApplied: string[];
  timeLimitSec?: number;
  startedAt?: number;
  rewardHint?: string;
};

type Props = {
  state: BreachState;
  onPick: (x: number, y: number) => void;
  onClose?: () => void;
  onRetry?: () => void;
};

const cellKey = (x: number, y: number) => `${y},${x}`;

const statusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Em andamento';
    case 'success':
      return 'Breach completo';
    case 'partial':
      return 'Sucesso parcial';
    case 'fail':
      return 'ICE — falha';
    default:
      return status;
  }
};

export const BreachProtocol = ({ state, onPick, onClose, onRetry }: Props) => {
  const [now, setNow] = useState(Date.now());
  const lastStatus = useRef(state.status);
  const lastBuf = useRef(state.buffer?.length || 0);

  useEffect(() => {
    if (!state.timeLimitSec || state.status !== 'active') return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [state.timeLimitSec, state.status, state.id]);

  useEffect(() => {
    if (state.status === 'active' && lastStatus.current !== 'active') {
      playCyberSound('jack');
    }
    if (state.status !== lastStatus.current) {
      if (state.status === 'success' || state.status === 'partial') {
        playCyberSound('win');
      } else if (state.status === 'fail') {
        playCyberSound('lose');
      }
      lastStatus.current = state.status;
    }
  }, [state.status]);

  useEffect(() => {
    const len = state.buffer?.length || 0;
    if (state.status === 'active' && len > lastBuf.current) {
      playCyberSound('pick');
    }
    lastBuf.current = len;
  }, [state.buffer, state.status]);

  const remainingSec = useMemo(() => {
    if (!state.timeLimitSec || !state.startedAt) return null;
    return Math.max(
      0,
      Math.ceil(
        (state.timeLimitSec * 1000 - (now - state.startedAt)) / 1000,
      ),
    );
  }, [state.timeLimitSec, state.startedAt, now]);

  const isLegal = (x: number, y: number) => {
    if (state.status !== 'active') return false;
    if (state.used?.includes(cellKey(x, y))) return false;
    if (state.nextAxis == null) return true;
    if (state.nextAxis === 'row') return y === state.lockedIndex;
    if (state.nextAxis === 'col') return x === state.lockedIndex;
    return false;
  };

  const size = state.grid.length;

  return (
    <div className={styles.wrap} role="dialog" aria-label="Breach Protocol">
      <header className={styles.head}>
        <div>
          <strong>BREACH PROTOCOL</strong>
          {state.challengeName && (
            <div className={styles.sub}>
              {state.challengeName}
              {state.difficulty ? ` · ${state.difficulty}` : ''}
            </div>
          )}
        </div>
        <div className={styles.headActions}>
          {onRetry && (
            <HudButton variant="ghost" onClick={onRetry}>
              Reiniciar
            </HudButton>
          )}
          {onClose && (
            <HudButton variant="ghost" onClick={onClose}>
              Fechar
            </HudButton>
          )}
        </div>
      </header>

      <div className={styles.meta}>
        <span>
          Buffer {state.buffer.length}/{state.bufferSize}
        </span>
        <span data-status={state.status}>{statusLabel(state.status)}</span>
        {remainingSec != null && (
          <span
            className={styles.timer}
            data-critical={remainingSec <= 10 ? '1' : '0'}
          >
            {remainingSec}s
          </span>
        )}
      </div>

      <p className={styles.bufferLine}>
        [{state.buffer.length ? state.buffer.join(' ') : '—'}]
      </p>
      <p className={styles.hint}>
        {state.nextAxis == null
          ? 'Escolha qualquer célula para iniciar.'
          : state.nextAxis === 'col'
            ? `Próximo: mesma coluna (${(state.lockedIndex ?? 0) + 1}).`
            : `Próximo: mesma linha (${(state.lockedIndex ?? 0) + 1}).`}
      </p>

      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {state.grid.map((row, y) =>
          row.map((cell, x) => {
            const used = state.used?.includes(cellKey(x, y));
            const legal = isLegal(x, y);
            return (
              <button
                key={`${x}-${y}`}
                type="button"
                className={styles.cell}
                data-used={used ? '1' : '0'}
                data-legal={legal ? '1' : '0'}
                disabled={!legal}
                onClick={() => onPick(x, y)}
              >
                {cell}
              </button>
            );
          }),
        )}
      </div>

      <ul className={styles.seq}>
        {state.sequences.map((s) => (
          <li key={s.id} data-done={s.completed}>
            <span>{s.name}</span>
            <code>{s.seq.join(' → ')}</code>
            {s.completed ? ' ✓' : ''}
          </li>
        ))}
      </ul>

      {state.status !== 'active' && (
        <div className={styles.result} data-status={state.status}>
          <p>{statusLabel(state.status)}</p>
          {state.daemonsApplied?.length > 0 && (
            <p className={styles.daemons}>
              Daemons: {state.daemonsApplied.join(', ')}
            </p>
          )}
          {state.rewardHint && state.status !== 'fail' && (
            <p className={styles.reward}>Recompensa: {state.rewardHint}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BreachProtocol;
