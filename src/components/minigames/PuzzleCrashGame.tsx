'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GemColor,
  GEM_COLORS,
  GEM_GLOW,
  GEM_HEX,
  GEM_LABELS,
  PuzzleSpeed,
  SPEED_LABELS,
  SPEED_MS,
} from './puzzleColors';
import styles from './PuzzleCrashGame.module.css';

const COLS = 6;
const ROWS = 12;

type Cell = {
  color: GemColor;
  power: number;
  crash?: boolean;
};

type GemKind = { color: GemColor; crash?: boolean };

type Piece = {
  x: number;
  y: number;
  a: GemKind;
  b: GemKind;
  rot: 0 | 1 | 2 | 3;
};

type Mode = 'timer' | 'endless';
type Status = 'menu' | 'playing' | 'won' | 'lost';

const randColor = (): GemColor =>
  GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];

const emptyGrid = (): (Cell | null)[][] =>
  Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));

const cloneGrid = (g: (Cell | null)[][]) =>
  g.map((row) => row.map((c) => (c ? { ...c } : null)));

const makeCrash = (): GemKind => ({ color: randColor(), crash: true });
const makeGem = (): GemKind => ({ color: randColor() });

const newPiece = (forceCrash = false): Piece => ({
  x: 2,
  y: 0,
  a: forceCrash || Math.random() < 0.12 ? makeCrash() : makeGem(),
  b: makeGem(),
  rot: 0,
});

const pieceCells = (
  p: Piece,
): Array<{ x: number; y: number; v: GemKind }> => {
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

/** ⚡ da cor X apaga todas as gems da cor X. */
const detonateCrash = (
  g: (Cell | null)[][],
  cx: number,
  cy: number,
): { score: number; color: GemColor | null } => {
  const crash = g[cy][cx];
  if (!crash?.crash) return { score: 0, color: null };
  const target = crash.color;
  g[cy][cx] = null;
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
  return { score, color: target };
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
  const [glitch, setGlitch] = useState(false);
  const [glitchColor, setGlitchColor] = useState<GemColor | null>(null);
  const [lastCrash, setLastCrash] = useState<GemColor | null>(null);
  const lock = useRef(false);

  const start = () => {
    setGrid(emptyGrid());
    setPiece(newPiece());
    setScore(0);
    setCombos(0);
    setRemaining(timerSec);
    setStatus('playing');
    setGlitch(false);
    setGlitchColor(null);
    setLastCrash(null);
  };

  const triggerGlitch = (color: GemColor | null) => {
    setGlitchColor(color);
    setGlitch(true);
    setTimeout(() => setGlitch(false), 420);
  };

  const lockPiece = useCallback((g: (Cell | null)[][], p: Piece) => {
    const next = cloneGrid(g);
    let gained = 0;
    let boomColor: GemColor | null = null;
    for (const { x, y, v } of pieceCells(p)) {
      next[y][x] = {
        color: v.color,
        power: 1,
        crash: Boolean(v.crash),
      };
    }
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (next[y][x]?.crash) {
          const { score: s, color } = detonateCrash(next, x, y);
          gained += s;
          if (color) boomColor = color;
        }
      }
    }
    applyGravity(next);
    mergePowers(next);
    applyGravity(next);
    return { next, gained, boomColor };
  }, []);

  const softDrop = useCallback(() => {
    if (status !== 'playing' || !piece || lock.current) return;
    const moved = { ...piece, y: piece.y + 1 };
    if (fits(grid, moved)) {
      setPiece(moved);
      return;
    }
    lock.current = true;
    const { next, gained, boomColor } = lockPiece(grid, piece);
    setGrid(next);
    if (gained > 0) {
      setScore((s) => s + gained);
      setCombos((c) => c + 1);
      if (boomColor) {
        setLastCrash(boomColor);
        triggerGlitch(boomColor);
      }
    }
    if (next[0].some(Boolean)) {
      setStatus('lost');
      setPiece(null);
      lock.current = false;
      return;
    }
    setPiece(newPiece(combos > 0 && combos % 4 === 3));
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
        display[y][x] = {
          color: v.color,
          power: 1,
          crash: Boolean(v.crash),
        };
      }
    }
  }

  return (
    <div
      className={styles.wrap}
      data-glitch={glitch ? '1' : '0'}
      style={
        glitchColor
          ? ({ ['--crash-color' as string]: GEM_HEX[glitchColor] } as any)
          : undefined
      }
    >
      <div className={styles.scan} aria-hidden />
      <header className={styles.head}>
        <h3>Puzzle Crash</h3>
        <p>
          Monte power gems 2×2. O <strong>⚡</strong> nasce com uma cor neon e
          apaga <em>todas</em> as peças dessa cor — quanto maior o power, mais
          score.
        </p>
        <div className={styles.legend}>
          {GEM_COLORS.map((c) => (
            <span key={c} style={{ color: GEM_HEX[c], textShadow: GEM_GLOW[c] }}>
              ■ {GEM_LABELS[c]}
            </span>
          ))}
          <span className={styles.legendCrash}>⚡ crash</span>
        </div>
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
            <span>SCORE {score}</span>
            <span>CRASH {combos}</span>
            <span>{SPEED_LABELS[speed].toUpperCase()}</span>
            {lastCrash && (
              <span style={{ color: GEM_HEX[lastCrash] }}>
                LAST ⚡ {GEM_LABELS[lastCrash]}
              </span>
            )}
            {mode === 'timer' && (
              <span className={styles.timer}>{remaining}s</span>
            )}
          </div>
          <div className={styles.boardFrame}>
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
                    data-empty={cell ? '0' : '1'}
                    style={
                      cell
                        ? {
                            background: cell.crash
                              ? `radial-gradient(circle, #0a0a0f 30%, ${GEM_HEX[cell.color]} 100%)`
                              : GEM_HEX[cell.color],
                            boxShadow: cell.crash
                              ? `${GEM_GLOW[cell.color]}, inset 0 0 8px #000`
                              : `${GEM_GLOW[cell.color]}, inset 0 0 ${3 * cell.power}px rgba(0,0,0,0.45)`,
                            color: cell.crash ? GEM_HEX[cell.color] : '#0a0a0f',
                          }
                        : undefined
                    }
                  >
                    {cell?.crash
                      ? '⚡'
                      : cell && cell.power > 1
                        ? cell.power
                        : ''}
                  </div>
                )),
              )}
            </div>
          </div>
          <p className={styles.controls}>
            ← → mover · ↑/Espaço girar · ↓ acelerar
          </p>
          {(status === 'won' || status === 'lost') && (
            <div
              className={styles.result}
              data-ok={status === 'won' ? '1' : '0'}
            >
              <p>
                {status === 'won'
                  ? 'Puzzle limpo — bom netrun.'
                  : 'Stack overflow — ICE venceu.'}
              </p>
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
