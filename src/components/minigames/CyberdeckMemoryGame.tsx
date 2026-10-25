'use client';

import { useMemo, useState } from 'react';
import shell from './MinigameShell.module.css';
import styles from './CyberdeckMemoryGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';

type Daemon = {
  id: string;
  name: string;
  w: number;
  h: number;
  color: string;
};

const makeDaemons = (capacity: number): Daemon[] => {
  const sets: Record<number, Omit<Daemon, 'id'>[]> = {
    6: [
      { name: 'ICE', w: 2, h: 2, color: '#ff4d6d' },
      { name: 'Spoof', w: 2, h: 1, color: '#fed33f' },
      { name: 'Ping', w: 1, h: 1, color: '#2be4ea' },
      { name: 'Ping2', w: 1, h: 1, color: '#2bfea0' },
    ],
    8: [
      { name: 'ICE', w: 2, h: 2, color: '#ff4d6d' },
      { name: 'Root', w: 3, h: 1, color: '#8814ff' },
      { name: 'Spoof', w: 2, h: 1, color: '#fed33f' },
      { name: 'Ping', w: 1, h: 1, color: '#2be4ea' },
    ],
    10: [
      { name: 'ICE', w: 2, h: 2, color: '#ff4d6d' },
      { name: 'Root', w: 3, h: 1, color: '#8814ff' },
      { name: 'Spoof', w: 2, h: 1, color: '#fed33f' },
      { name: 'Ping', w: 1, h: 1, color: '#2be4ea' },
    ],
    12: [
      { name: 'ICE', w: 2, h: 2, color: '#ff4d6d' },
      { name: 'Wall', w: 2, h: 2, color: '#2bfea0' },
      { name: 'Root', w: 3, h: 1, color: '#8814ff' },
      { name: 'Ping', w: 1, h: 1, color: '#2be4ea' },
    ],
  };
  const pack = sets[capacity] || sets[8];
  return pack.map((d, i) => ({ ...d, id: `d${i}` }));
};

/** Memória do cyberdeck: empacote daemons na RAM limitada. */
export const CyberdeckMemoryGame = () => {
  const [status, setStatus] = useState<Status>('menu');
  const [capacity, setCapacity] = useState(8);
  const [cols] = useState(4);
  const [daemons, setDaemons] = useState<Daemon[]>([]);
  const [placed, setPlaced] = useState<
    Array<{ id: string; x: number; y: number; w: number; h: number; color: string; name: string }>
  >([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const rows = useMemo(() => Math.ceil(capacity / cols), [capacity, cols]);

  const occupied = useMemo(() => {
    const grid = Array.from({ length: rows * cols }, () => false);
    for (const p of placed) {
      for (let dy = 0; dy < p.h; dy++) {
        for (let dx = 0; dx < p.w; dx++) {
          const i = (p.y + dy) * cols + (p.x + dx);
          if (i < grid.length) grid[i] = true;
        }
      }
    }
    return grid;
  }, [placed, rows, cols]);

  const start = () => {
    setDaemons(makeDaemons(capacity));
    setPlaced([]);
    setSelected(null);
    setMsg('');
    setStatus('playing');
  };

  const canPlace = (x: number, y: number, w: number, h: number) => {
    if (x + w > cols || y + h > rows) return false;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (occupied[(y + dy) * cols + (x + dx)]) return false;
      }
    }
    return true;
  };

  const onCell = (x: number, y: number) => {
    if (status !== 'playing' || !selected) return;
    const d = daemons.find((x) => x.id === selected);
    if (!d) return;
    if (!canPlace(x, y, d.w, d.h)) {
      setMsg('Não cabe / colisão.');
      return;
    }
    const remaining = daemons.filter((row) => row.id !== d.id);
    setPlaced((p) => [
      ...p,
      { id: d.id, x, y, w: d.w, h: d.h, color: d.color, name: d.name },
    ]);
    setDaemons(remaining);
    setSelected(null);
    setMsg(`${d.name} alocado.`);
    if (remaining.length === 0) {
      setStatus('won');
      setMsg('RAM cheia — daemons empacotados.');
    }
  };

  const checkWin = () => {
    if (daemons.length === 0) {
      setStatus('won');
      return;
    }
    setMsg('Ainda há daemons fora da RAM.');
  };

  const used = placed.reduce((acc, p) => acc + p.w * p.h, 0);

  return (
    <div className={shell.wrap}>
      <header className={shell.head}>
        <h3>Memória do Cyberdeck</h3>
        <p>
          Encaixe daemons na grade de RAM. Capacidade espelha o limite da ficha
          — escolha o tamanho do deck.
        </p>
      </header>

      {status === 'menu' && (
        <div className={shell.menu}>
          <label>
            Capacidade (células)
            <select
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            >
              {[6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n} slots
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={shell.start} onClick={start}>
            Boot deck
          </button>
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={shell.hud}>
            <span>
              RAM {used}/{capacity}
            </span>
            <span>FREE {daemons.length}</span>
          </div>
          <div
            className={styles.grid}
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: rows * cols }, (_, i) => {
              const x = i % cols;
              const y = Math.floor(i / cols);
              const cover = placed.find(
                (p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h,
              );
              return (
                <button
                  key={i}
                  type="button"
                  className={styles.cell}
                  style={
                    cover
                      ? { background: cover.color, color: '#0a0a0f' }
                      : undefined
                  }
                  disabled={status !== 'playing'}
                  onClick={() => onCell(x, y)}
                >
                  {cover && x === cover.x && y === cover.y ? cover.name[0] : ''}
                </button>
              );
            })}
          </div>
          <div className={styles.tray}>
            {daemons.map((d) => (
              <button
                key={d.id}
                type="button"
                className={styles.daemon}
                data-sel={selected === d.id ? '1' : '0'}
                style={{ borderColor: d.color, color: d.color }}
                disabled={status !== 'playing'}
                onClick={() => setSelected(d.id)}
              >
                {d.name} ({d.w}×{d.h})
              </button>
            ))}
            {daemons.length === 0 && (
              <span className={shell.hint}>Todos alocados.</span>
            )}
          </div>
          {msg && <p className={shell.hint}>{msg}</p>}
          {status === 'playing' && (
            <button type="button" className={shell.start} onClick={checkWin}>
              Confirmar loadout
            </button>
          )}
          {(status === 'won' || status === 'lost') && (
            <div className={shell.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>
                {status === 'won'
                  ? 'Daemons carregados. Deck pronto pro run.'
                  : 'Falha de alocação.'}
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

export default CyberdeckMemoryGame;
