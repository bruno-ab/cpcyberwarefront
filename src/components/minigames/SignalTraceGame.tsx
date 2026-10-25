'use client';

import { useMemo, useRef, useState, type CSSProperties } from 'react';
import styles from './SignalTraceGame.module.css';

type Status = 'menu' | 'playing' | 'won';

type Pair = { id: string; color: string; a: [number, number]; b: [number, number] };

type Puzzle = {
  id: string;
  name: string;
  size: number;
  pairs: Pair[];
};

/** Puzzles hand-authored to be solvable (Flow/Numberlink). */
const PUZZLES: Puzzle[] = [
  {
    id: 'relay',
    name: 'Relay Watson',
    size: 5,
    pairs: [
      { id: 'A', color: '#2be4ea', a: [0, 0], b: [4, 0] },
      { id: 'B', color: '#ff2bd6', a: [0, 4], b: [4, 4] },
      { id: 'C', color: '#fed33f', a: [2, 1], b: [2, 3] },
    ],
  },
  {
    id: 'backbone',
    name: 'Backbone Japantown',
    size: 6,
    pairs: [
      { id: 'A', color: '#2be4ea', a: [0, 0], b: [5, 0] },
      { id: 'B', color: '#ff2bd6', a: [0, 5], b: [5, 5] },
      { id: 'C', color: '#fed33f', a: [0, 2], b: [5, 2] },
      { id: 'D', color: '#b14cff', a: [2, 1], b: [2, 4] },
    ],
  },
  {
    id: 'blackwall',
    name: 'Blackwall Echo',
    size: 6,
    pairs: [
      { id: 'A', color: '#2be4ea', a: [0, 0], b: [0, 5] },
      { id: 'B', color: '#ff2bd6', a: [5, 0], b: [5, 5] },
      { id: 'C', color: '#fed33f', a: [1, 1], b: [4, 1] },
      { id: 'D', color: '#b14cff', a: [1, 4], b: [4, 4] },
      { id: 'E', color: '#ff4d6d', a: [2, 2], b: [3, 3] },
    ],
  },
];

const keyOf = (x: number, y: number) => `${x},${y}`;

const isAdj = (a: [number, number], b: [number, number]) =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

export const SignalTraceGame = () => {
  const [puzzle, setPuzzle] = useState<Puzzle>(PUZZLES[0]);
  const [status, setStatus] = useState<Status>('menu');
  const [active, setActive] = useState<string | null>(null);
  const [paths, setPaths] = useState<Record<string, Array<[number, number]>>>({});
  const [msg, setMsg] = useState('');
  const dragging = useRef(false);

  const terminals = useMemo(() => {
    const map = new Map<string, { id: string; color: string }>();
    for (const p of puzzle.pairs) {
      map.set(keyOf(...p.a), { id: p.id, color: p.color });
      map.set(keyOf(...p.b), { id: p.id, color: p.color });
    }
    return map;
  }, [puzzle]);

  const occupied = useMemo(() => {
    const map = new Map<string, string>();
    for (const [id, path] of Object.entries(paths)) {
      for (const [x, y] of path) map.set(keyOf(x, y), id);
    }
    return map;
  }, [paths]);

  const start = (pz: Puzzle) => {
    setPuzzle(pz);
    setPaths({});
    setActive(null);
    setStatus('playing');
    setMsg('Conecte pares da mesma cor sem cruzar sinais.');
  };

  const checkWin = (next: Record<string, Array<[number, number]>>) => {
    const ok = puzzle.pairs.every((p) => {
      const path = next[p.id];
      if (!path || path.length < 2) return false;
      const startK = keyOf(...path[0]);
      const endK = keyOf(...path[path.length - 1]);
      const ends = new Set([keyOf(...p.a), keyOf(...p.b)]);
      return ends.has(startK) && ends.has(endK);
    });
    if (ok) {
      setStatus('won');
      setMsg('Trace completo — sinal estabilizado.');
      setActive(null);
    }
  };

  const onCell = (x: number, y: number) => {
    if (status !== 'playing') return;
    const k = keyOf(x, y);
    const term = terminals.get(k);

    if (!active) {
      if (!term) {
        setMsg('Comece num terminal (letra).');
        return;
      }
      setActive(term.id);
      setPaths((prev) => ({ ...prev, [term.id]: [[x, y]] }));
      setMsg(`Traçando canal ${term.id}…`);
      return;
    }

    const path = paths[active] || [];
    const head = path[path.length - 1];
    if (!head) return;

    // click same terminal pair end / extend
    if (path.length === 1 && term?.id === active && (x !== head[0] || y !== head[1])) {
      // started on other end somehow - reset to this terminal
      setPaths((prev) => ({ ...prev, [active]: [[x, y]] }));
      return;
    }

    // rewind
    const existing = path.findIndex(([px, py]) => px === x && py === y);
    if (existing >= 0) {
      const cut = path.slice(0, existing + 1);
      const next = { ...paths, [active]: cut };
      setPaths(next);
      return;
    }

    if (!isAdj(head, [x, y])) {
      setMsg('Só células ortogonais.');
      return;
    }

    const owner = occupied.get(k);
    if (owner && owner !== active) {
      setMsg('Sinal cruzado — canal ocupado.');
      return;
    }

    if (term && term.id !== active) {
      setMsg('Terminal de outro canal.');
      return;
    }

    const nextPath: Array<[number, number]> = [...path, [x, y]];
    const next = { ...paths, [active]: nextPath };
    setPaths(next);

    if (term && term.id === active) {
      setMsg(`Canal ${active} fechado.`);
      setActive(null);
      checkWin(next);
      return;
    }
  };

  const clearActive = () => {
    if (!active) return;
    setPaths((prev) => {
      const copy = { ...prev };
      delete copy[active];
      return copy;
    });
    setActive(null);
    setMsg(`Canal limpo.`);
  };

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h3>Signal Trace</h3>
        <p>
          Conecte cada par de terminais sem cruzar linhas (estilo Numberlink /
          Flow). Clique/arraste da letra até o par.
        </p>
      </header>

      {status === 'menu' && (
        <div className={styles.menu}>
          {PUZZLES.map((pz) => (
            <button key={pz.id} type="button" className={styles.card} onClick={() => start(pz)}>
              <strong>{pz.name}</strong>
              <span>
                {pz.size}×{pz.size} · {pz.pairs.length} canais
              </span>
            </button>
          ))}
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={styles.hud}>
            <span>{puzzle.name.toUpperCase()}</span>
            <span>
              {Object.keys(paths).filter((id) => {
                const p = puzzle.pairs.find((x) => x.id === id);
                const path = paths[id];
                if (!p || !path || path.length < 2) return false;
                const ends = new Set([keyOf(...p.a), keyOf(...p.b)]);
                return (
                  ends.has(keyOf(...path[0])) &&
                  ends.has(keyOf(...path[path.length - 1]))
                );
              }).length}
              /{puzzle.pairs.length}
            </span>
            {active && (
              <button type="button" className={styles.ghost} onClick={clearActive}>
                Limpar {active}
              </button>
            )}
          </div>
          <div
            className={styles.grid}
            style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }}
            onPointerUp={() => {
              dragging.current = false;
            }}
            onPointerLeave={() => {
              dragging.current = false;
            }}
            onPointerCancel={() => {
              dragging.current = false;
            }}
          >
            {Array.from({ length: puzzle.size * puzzle.size }, (_, i) => {
              const x = i % puzzle.size;
              const y = Math.floor(i / puzzle.size);
              const k = keyOf(x, y);
              const term = terminals.get(k);
              const owner = occupied.get(k);
              const pair = puzzle.pairs.find((p) => p.id === (term?.id || owner));
              const color = pair?.color;
              const isHead =
                active &&
                paths[active] &&
                paths[active][paths[active].length - 1][0] === x &&
                paths[active][paths[active].length - 1][1] === y;
              return (
                <button
                  key={k}
                  type="button"
                  className={styles.cell}
                  data-term={term ? '1' : '0'}
                  data-wire={owner ? '1' : '0'}
                  data-head={isHead ? '1' : '0'}
                  data-active-pair={active === (term?.id || owner) ? '1' : '0'}
                  style={
                    color
                      ? ({ ['--c' as string]: color } as CSSProperties)
                      : undefined
                  }
                  disabled={status !== 'playing'}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    dragging.current = true;
                    onCell(x, y);
                  }}
                  onPointerEnter={() => {
                    if (dragging.current) onCell(x, y);
                  }}
                >
                  {term ? term.id : owner ? '·' : ''}
                </button>
              );
            })}
          </div>
          <p className={styles.msg}>{msg}</p>
          {status === 'won' && (
            <div className={styles.result} data-ok="1">
              <p>Trace OK — rota exfiltrada.</p>
              <button type="button" className={styles.start} onClick={() => start(puzzle)}>
                De novo
              </button>
              <button type="button" className={styles.ghost} onClick={() => setStatus('menu')}>
                Menu
              </button>
            </div>
          )}
          {status === 'playing' && (
            <button type="button" className={styles.ghost} onClick={() => setStatus('menu')}>
              Menu
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default SignalTraceGame;
