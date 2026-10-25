'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import styles from './HotwireCircuitGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';
type CellKind = 'empty' | 'start' | 'end' | 'hot' | 'block';

type Level = {
  id: string;
  name: string;
  blurb: string;
  cols: number;
  rows: number;
  cells: CellKind[];
  timeSec: number;
};

const LEVELS: Level[] = [
  {
    id: 'alley',
    name: 'Maglock de beco',
    blurb: 'Ligue a bateria ao maglock. Evite o fio vivo (vermelho).',
    cols: 5,
    rows: 5,
    timeSec: 45,
    cells: [
      'start', 'empty', 'empty', 'hot', 'empty',
      'empty', 'block', 'empty', 'empty', 'empty',
      'empty', 'empty', 'hot', 'block', 'empty',
      'empty', 'block', 'empty', 'empty', 'empty',
      'empty', 'empty', 'empty', 'hot', 'end',
    ],
  },
  {
    id: 'garage',
    name: 'Portão de garagem',
    blurb: 'Circuito apertado — um toque no vivo e o alarme dispara.',
    cols: 6,
    rows: 5,
    timeSec: 40,
    cells: [
      'start', 'empty', 'hot', 'empty', 'block', 'empty',
      'empty', 'block', 'empty', 'empty', 'empty', 'hot',
      'empty', 'empty', 'empty', 'hot', 'block', 'empty',
      'hot', 'block', 'empty', 'empty', 'empty', 'empty',
      'empty', 'empty', 'block', 'empty', 'hot', 'end',
    ],
  },
  {
    id: 'arasaka',
    name: 'Painel Arasaka',
    blurb: 'ICE elétrico: poucos caminhos seguros.',
    cols: 6,
    rows: 6,
    timeSec: 50,
    cells: [
      'start', 'empty', 'hot', 'empty', 'hot', 'empty',
      'empty', 'block', 'empty', 'block', 'empty', 'empty',
      'hot', 'empty', 'empty', 'hot', 'block', 'empty',
      'empty', 'block', 'hot', 'empty', 'empty', 'hot',
      'empty', 'empty', 'block', 'empty', 'block', 'empty',
      'hot', 'empty', 'empty', 'hot', 'empty', 'end',
    ],
  },
];

const idx = (x: number, y: number, cols: number) => y * cols + x;

export const HotwireCircuitGame = () => {
  const [level, setLevel] = useState<Level>(LEVELS[0]);
  const [status, setStatus] = useState<Status>('menu');
  const [path, setPath] = useState<number[]>([]);
  const [remaining, setRemaining] = useState(45);
  const [glitch, setGlitch] = useState(false);
  const [msg, setMsg] = useState('');

  const endPos = useMemo(() => level.cells.findIndex((c) => c === 'end'), [level]);

  const start = (lv: Level) => {
    setLevel(lv);
    setPath([lv.cells.findIndex((c) => c === 'start')]);
    setRemaining(lv.timeSec);
    setStatus('playing');
    setGlitch(false);
    setMsg('Circuito aberto — trace o fio.');
    playCyberSound('jack');
  };

  useEffect(() => {
    if (status !== 'playing') return;
    if (remaining <= 0) {
      setStatus('lost');
      playCyberSound('alarm');
      setMsg('Timeout — maglock travou e alertou a NetWatch.');
      setGlitch(true);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [status, remaining]);

  const neighbors = useCallback(
    (i: number) => {
      const x = i % level.cols;
      const y = Math.floor(i / level.cols);
      const out: number[] = [];
      const push = (nx: number, ny: number) => {
        if (nx < 0 || ny < 0 || nx >= level.cols || ny >= level.rows) return;
        out.push(idx(nx, ny, level.cols));
      };
      push(x + 1, y);
      push(x - 1, y);
      push(x, y + 1);
      push(x, y - 1);
      return out;
    },
    [level],
  );

  const onCell = (i: number) => {
    if (status !== 'playing') return;
    const kind = level.cells[i];
    if (kind === 'block') return;

    const head = path[path.length - 1];
    if (path.includes(i) && i !== head) {
      // rewind to clicked cell
      const cut = path.indexOf(i);
      setPath(path.slice(0, cut + 1));
      setMsg('Fio recolhido.');
      return;
    }
    if (i === head) return;
    if (!neighbors(head).includes(i)) {
      setMsg('Só células adjacentes.');
      return;
    }
    if (kind === 'hot') {
      setStatus('lost');
      setGlitch(true);
      playCyberSound('surge');
      setMsg('CHOQUE — fio vivo. Alarme disparado.');
      setPath((p) => [...p, i]);
      return;
    }
    const next = [...path, i];
    setPath(next);
    playCyberSound('pick', { volume: 0.6 });
    if (i === endPos) {
      setStatus('won');
      playCyberSound('lock');
      setMsg('Circuito fechado. Maglock liberado.');
      return;
    }
    setMsg(`Traço ${next.length - 1} nós…`);
  };

  return (
    <div className={styles.wrap} data-glitch={glitch ? '1' : '0'}>
      <header className={styles.head}>
        <h3>Hotwire Circuit</h3>
        <p>
          Clique células adjacentes da <strong>bateria</strong> até o{' '}
          <strong>maglock</strong>. Vermelho = vivo. Clique no próprio fio para
          recolher.
        </p>
      </header>

      {status === 'menu' && (
        <div className={styles.menu}>
          {LEVELS.map((lv) => (
            <button
              key={lv.id}
              type="button"
              className={styles.card}
              onClick={() => start(lv)}
            >
              <strong>{lv.name}</strong>
              <span>
                {lv.cols}×{lv.rows} · {lv.timeSec}s
              </span>
              <p>{lv.blurb}</p>
            </button>
          ))}
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={styles.hud}>
            <span>{level.name.toUpperCase()}</span>
            <span className={styles.timer}>{remaining}s</span>
          </div>
          <div
            className={styles.grid}
            style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)` }}
          >
            {level.cells.map((kind, i) => {
              const onPath = path.includes(i);
              const isHead = path[path.length - 1] === i;
              return (
                <button
                  key={i}
                  type="button"
                  className={styles.cell}
                  data-kind={kind}
                  data-path={onPath ? '1' : '0'}
                  data-head={isHead ? '1' : '0'}
                  disabled={status !== 'playing'}
                  onClick={() => onCell(i)}
                >
                  {kind === 'start' ? '⚡' : kind === 'end' ? '🔒' : kind === 'hot' ? '!' : kind === 'block' ? '■' : onPath ? '·' : ''}
                </button>
              );
            })}
          </div>
          <p className={styles.msg}>{msg}</p>
          {(status === 'won' || status === 'lost') && (
            <div className={styles.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>{status === 'won' ? 'Acesso físico OK.' : 'Falha no hotwire.'}</p>
              <button type="button" className={styles.start} onClick={() => start(level)}>
                De novo
              </button>
              <button type="button" className={styles.ghost} onClick={() => setStatus('menu')}>
                Menu
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HotwireCircuitGame;
