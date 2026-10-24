'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GemColor,
  GEM_COLORS,
  GEM_HEX,
  PuzzleSpeed,
  SPEED_LABELS,
  SPEED_MS,
} from './puzzleColors';
import styles from './PuzzleCrashGame.module.css';

const COLS = 6;
const ROWS = 12;

type Cell = {
  color: GemColor;
  /** 1 = gem normal; 2+ = power gem (quadrado maior lógico). */
  power: number;
  crash?: boolean;
};

type Piece = {
  x: number;
  y: number;
  a: GemColor | 'crash';
  b: GemColor | 'crash';
  /** 0 = a em cima de b; 1 = a à direita; etc. */
  rot: 0 | 1 | 2 | 3;
};

type Mode = 'timer' | 'endless';
type Status = 'menu' | 'playing' | 'won' | 'lost';

const randColor = (): GemColor =>
  GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];

const emptyGrid = (): (Cell | null)[][] =>
  Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));

const cloneGrid = (g: (Cell | null)[][]) => g.map((row) => row.map((c) => (c ? { ...c } : null)));

const newPiece = (forceCrash = false): Piece => ({
  x: 2,
  y: 0,
  a: forceCrash ? 'crash' : Math.random() < 0.08 ? 'crash' : randColor(),
  b: randColor(),
  rot: 0,
});

const pieceCells = (p: Piece): Array<{ x: number; y: number; v: GemColor | 'crash' }> => {
  const cells = [{ x: p.x, y: p.y, v: p.a }];
  if (p.rot === 0) cells.push({ x: p.x, y: p.y + 1, v: p.b });
  if (p.rot === 1) cells.push({ x: p.x + 1, y: p.y, v: p.b });
  if (p.rot === 2) cells.push({ x: p.x, y: p.y - 1, v: p.b });
  if (p.rot === 3) cells.push({ x: p.x - 1, y: p.y, v: p.b });
  return cells;
};

const fits = (g: (Cell | null)[][], p: Piece) =>
  pieceCells(p).every(
    ({ x, y }) =>
      x >= 0 && x < COLS && y >= 0 && y < ROWS && g[y][x] == null,
  );

/** Detecta blocos 2×2 da mesma cor e sobe power. */
const mergePowers = (g: (Cell | null)[][]) => {
  let changed = true;
  while (changed) {
    changed = false;
    for (let y = 0; y < ROWS - 1; y++) {
      for (let x = 0; x < COLS - 1; x++) {
        const a = g[y][x];
        const b = g[y][x + 1];
        const c = g[y + 1][x];
        const d = g[y + 1][x + 1];
        if (!a || !b || !c || !d) continue;
        if (a.crash || b.crash || c.crash || d.crash) continue;
        if (a.color !== b.color || a.color !== c.color || a.color !== d.color)
          continue;
        const nextPower = Math.min(
          4,
          Math.max(a.power, b.power, c.power, d.power) + 1,
        );
        if (
          a.power === nextPower &&
          b.power === nextPower &&
          c.power === nextPower &&
          d.power === nextPower
        ) {
          continue;
        }
        const cell: Cell = { color: a.color, power: nextPower };
        g[y][x] = cell;
        g[y][x + 1] = { ...cell };
        g[y + 1][x] = { ...cell };
        g[y + 1][x + 1] = { ...cell };
        changed = true;
      }
    }
  }
};

const applyGravity = (g: (Cell | null)[][]) => {
  for (let x = 0; x < COLS; x++) {
    const stack: (Cell | null)[] = [];
    for (let y = ROWS - 1; y >= 0; y--) {
      if (g[y][x]) stack.push(g[y][x]);
    }
    for (let y = ROWS - 1; y >= 0; y--) {
      g[y][x] = stack[ROWS - 1 - y] || null;
    }
  }
};

/** Crash destrói gems da cor adjacente; power maior = mais pontos. */
const detonateCrash = (g: (Cell | null)[][], cx: number, cy: number) => {
  const dirs = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  let target: GemColor | null = null;
  for (const [dx, dy] of dirs) {
    const nx = cx + dx;
    const ny = cy + dy;
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
    const n = g[ny][nx];
    if (n && !n.crash) {
      target = n.color;
      break;
    }
  }
  g[cy][cx] = null;
  if (!target) return 0;
  let score = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = g[y][x];
      if (c && c.color === target && !c.crash) {
        score += 10 * c.power * c.power;
        g[y][x] = null;
      }
    }
  }
  return score;
};

export const PuzzleCrashGame = () => {
  const [status, setStatus] = useState<Status>('menu');
  const [speed, setSpeed] = useState<PuzzleSpeed>('rua');
  const [mode, setMode] = useState<Mode>('endless');
  const [timerSec, setTimerSec] = useState(90);
  const [grid, setGrid] = useState(emptyGrid);
  const [piece, setPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [combos, setCombos] = useState(0);
  const [remaining, setRemaining] = useState(90);
  const [flash, setFlash] = useState(false);
  const lock = useRef(false);

  const start = () => {
    setGrid(emptyGrid());
    setPiece(newPiece());
    setScore(0);
    setCombos(0);
    setRemaining(timerSec);
    setStatus('playing');
    setFlash(false);
  };

  const lockPiece = useCallback((g: (Cell | null)[][], p: Piece) => {
    const next = cloneGrid(g);
    let gained = 0;
    for (const { x, y, v } of pieceCells(p)) {
      if (v === 'crash') {
        next[y][x] = { color: 'cyan', power: 1, crash: true };
      } else {
        next[y][x] = { color: v, power: 1 };
      }
    }
    // Detona crashes que acabaram de cair
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (next[y][x]?.crash) {
          gained += detonateCrash(next, x, y);
        }
      }
    }
    applyGravity(next);
    mergePowers(next);
    applyGravity(next);
    return { next, gained };
  }, []);

  const softDrop = useCallback(() => {
    if (status !== 'playing' || !piece || lock.current) return;
    const moved = { ...piece, y: piece.y + 1 };
    if (fits(grid, moved)) {
      setPiece(moved);
      return;
    }
    lock.current = true;
    const { next, gained } = lockPiece(grid, piece);
    setGrid(next);
    if (gained > 0) {
      setScore((s) => s + gained);
      setCombos((c) => c + 1);
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
    }
    // game over?
    if (next[0].some(Boolean) || next[1].some(Boolean)) {
      const topBlocked = next[0].some(Boolean);
      if (topBlocked) {
        setStatus('lost');
        setPiece(null);
        lock.current = false;
        return;
      }
    }
    setPiece(newPiece(combos > 0 && combos % 5 === 4));
    lock.current = false;
  }, [status, piece, grid, lockPiece, combos]);

  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(softDrop, SPEED_MS[speed]);
    return () => clearInterval(id);
  }, [status, speed, softDrop]);

  useEffect(() => {
    if (status !== 'playing' || mode !== 'timer') return;
    if (remaining <= 0) {
      setStatus(score >= 200 ? 'won' : 'lost');
      setPiece(null);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [status, mode, remaining, score]);

  useEffect(() => {
    if (status !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (!piece) return;
      if (e.key === 'ArrowLeft') {
        const m = { ...piece, x: piece.x - 1 };
        if (fits(grid, m)) setPiece(m);
      } else if (e.key === 'ArrowRight') {
        const m = { ...piece, x: piece.x + 1 };
        if (fits(grid, m)) setPiece(m);
      } else if (e.key === 'ArrowDown') {
        softDrop();
      } else if (e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        const m = { ...piece, rot: ((piece.rot + 1) % 4) as Piece['rot'] };
        if (fits(grid, m)) setPiece(m);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, piece, grid, softDrop]);

  const display = cloneGrid(grid);
  if (piece && status === 'playing') {
    for (const { x, y, v } of pieceCells(piece)) {
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        display[y][x] =
          v === 'crash'
            ? { color: 'yellow', power: 1, crash: true }
            : { color: v, power: 1 };
      }
    }
  }

  return (
    <div className={styles.wrap} data-flash={flash ? '1' : '0'}>
      <header className={styles.head}>
        <h3>Puzzle Crash</h3>
        <p>
          Combine 2×2 da mesma cor pra formar power gems. O gem com{' '}
          <strong>⚡</strong> destrói a cor adjacente — power gems valem mais.
        </p>
      </header>

      {status === 'menu' && (
        <div className={styles.menu}>
          <label>
            Velocidade
            <select
              value={speed}
              onChange={(e) => setSpeed(e.target.value as PuzzleSpeed)}
            >
              {(Object.keys(SPEED_LABELS) as PuzzleSpeed[]).map((k) => (
                <option key={k} value={k}>
                  {SPEED_LABELS[k]} ({SPEED_MS[k]}ms)
                </option>
              ))}
            </select>
          </label>
          <label>
            Modo
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
            >
              <option value="endless">Sem timer (até lotar)</option>
              <option value="timer">Com timer</option>
            </select>
          </label>
          {mode === 'timer' && (
            <label>
              Tempo (s)
              <select
                value={timerSec}
                onChange={(e) => setTimerSec(Number(e.target.value))}
              >
                <option value={60}>60</option>
                <option value={90}>90</option>
                <option value={120}>120</option>
              </select>
            </label>
          )}
          <button type="button" className={styles.start} onClick={start}>
            Jackar puzzle
          </button>
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={styles.hud}>
            <span>Score {score}</span>
            <span>Crashes {combos}</span>
            <span>{SPEED_LABELS[speed]}</span>
            {mode === 'timer' && <span className={styles.timer}>{remaining}s</span>}
          </div>
          <div
            className={styles.board}
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {display.flatMap((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={styles.cell}
                  data-crash={cell?.crash ? '1' : '0'}
                  data-power={cell?.power || 0}
                  style={
                    cell
                      ? {
                          background: cell.crash
                            ? '#111'
                            : GEM_HEX[cell.color],
                          boxShadow: cell.crash
                            ? '0 0 10px #fed33f'
                            : `inset 0 0 ${4 * cell.power}px rgba(0,0,0,0.35)`,
                        }
                      : undefined
                  }
                >
                  {cell?.crash ? '⚡' : cell && cell.power > 1 ? cell.power : ''}
                </div>
              )),
            )}
          </div>
          <p className={styles.controls}>
            ← → mover · ↑/Espaço girar · ↓ acelerar
          </p>
          {(status === 'won' || status === 'lost') && (
            <div className={styles.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>{status === 'won' ? 'Puzzle limpo — bom netrun.' : 'Stack overflow — ICE venceu.'}</p>
              <p>Score final: {score}</p>
              <button type="button" className={styles.start} onClick={start}>
                De novo
              </button>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => setStatus('menu')}
              >
                Menu
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PuzzleCrashGame;
