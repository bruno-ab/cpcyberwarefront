'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
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
const BREACH_TARGET = 400;
const TERM_MAX = 48;
const DEFENDER_MIN_MS = 7000;
const DEFENDER_MAX_MS = 16000;

type Cell = {
  color: GemColor;
  power: number;
  crash?: boolean;
  ice?: boolean;
  iceTimer?: number;
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

type TermKind = 'cmd' | 'ok' | 'warn' | 'err' | 'sys' | 'glitch' | 'progress';

type TermLine = {
  id: number;
  kind: TermKind;
  text: string;
  progress?: number;
  color?: string;
};

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

const bar = (pct: number, width = 16) => {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));
  return `[${'#'.repeat(filled)}${'.'.repeat(width - filled)}] ${Math.min(100, Math.round(pct))}%`;
};

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
        if (a.ice || b.ice || c.ice || d.ice) continue;
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

/** ⚡ da cor X apaga gems dessa cor (ICE cinza não quebra). */
const detonateCrash = (
  g: (Cell | null)[][],
  cx: number,
  cy: number,
): { score: number; color: GemColor | null; cleared: number } => {
  const crash = g[cy][cx];
  if (!crash?.crash) return { score: 0, color: null, cleared: 0 };
  const target = crash.color;
  g[cy][cx] = null;
  let score = 0;
  let cleared = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = g[y][x];
      if (c && c.color === target && !c.crash && !c.ice) {
        score += 10 * c.power * c.power;
        cleared += 1;
        g[y][x] = null;
      }
    }
  }
  return { score, color: target, cleared };
};

const injectIceBlock = (
  g: (Cell | null)[][],
): { ok: boolean; x: number; y: number; ttl: number } => {
  const ttl = 1 + Math.floor(Math.random() * 5);
  const cols = Array.from({ length: COLS }, (_, i) => i).sort(
    () => Math.random() - 0.5,
  );
  for (const x of cols) {
    let drop = ROWS - 1;
    while (drop >= 0 && g[drop][x] != null) drop--;
    if (drop < 0) continue;
    g[drop][x] = {
      color: 'cyan',
      power: 1,
      ice: true,
      iceTimer: ttl,
    };
    return { ok: true, x, y: drop, ttl };
  }
  return { ok: false, x: -1, y: -1, ttl };
};

const tickIceBlocks = (
  g: (Cell | null)[][],
): Array<{ x: number; y: number; kind: 'purge' | 'mutate'; color?: GemColor }> => {
  const events: Array<{
    x: number;
    y: number;
    kind: 'purge' | 'mutate';
    color?: GemColor;
  }> = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = g[y][x];
      if (!c?.ice) continue;
      const next = (c.iceTimer ?? 1) - 1;
      if (next > 0) {
        g[y][x] = { ...c, iceTimer: next };
        continue;
      }
      if (Math.random() < 0.45) {
        g[y][x] = null;
        events.push({ x, y, kind: 'purge' });
      } else {
        const color = randColor();
        g[y][x] = { color, power: 1 };
        events.push({ x, y, kind: 'mutate', color });
      }
    }
  }
  return events;
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
  const [termLines, setTermLines] = useState<TermLine[]>([]);
  const [termGlitch, setTermGlitch] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const lock = useRef(false);
  const termId = useRef(0);
  const termEndRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef(0);
  const defenderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushTerm = useCallback(
    (kind: TermKind, text: string, extra?: Partial<TermLine>) => {
      termId.current += 1;
      const line: TermLine = {
        id: termId.current,
        kind,
        text,
        ...extra,
      };
      setTermLines((prev) => [...prev.slice(-(TERM_MAX - 1)), line]);
    },
    [],
  );

  const triggerGlitch = (color: GemColor | null, hard = false) => {
    setGlitchColor(color);
    setGlitch(true);
    setTermGlitch(true);
    setTimeout(() => setGlitch(false), hard ? 620 : 420);
    setTimeout(() => setTermGlitch(false), hard ? 700 : 480);
  };

  const start = () => {
    setGrid(emptyGrid());
    setPiece(newPiece());
    setScore(0);
    scoreRef.current = 0;
    setCombos(0);
    setMoveCount(0);
    setRemaining(timerSec);
    setStatus('playing');
    setGlitch(false);
    setGlitchColor(null);
    setLastCrash(null);
    setTermGlitch(false);
    termId.current = 4;
    setTermLines([
      {
        id: 1,
        kind: 'sys',
        text: 'NETRUN_SESSION // Puzzle Crash v2.077',
      },
      {
        id: 2,
        kind: 'sys',
        text: `link.open --speed=${speed} --mode=${mode}`,
      },
      {
        id: 3,
        kind: 'ok',
        text: 'shell ready. drop payloads to breach perimeter.',
      },
      { id: 4, kind: 'progress', text: `breach ${bar(0)}`, progress: 0 },
    ]);
  };

  const lockPiece = useCallback((g: (Cell | null)[][], p: Piece) => {
    const next = cloneGrid(g);
    let gained = 0;
    let boomColor: GemColor | null = null;
    let cleared = 0;
    const dropMeta = pieceCells(p)
      .map(({ x, v }) => `${v.crash ? '⚡' : ''}${GEM_LABELS[v.color]}@${x}`)
      .join(',');
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
          const det = detonateCrash(next, x, y);
          gained += det.score;
          cleared += det.cleared;
          if (det.color) boomColor = det.color;
        }
      }
    }
    applyGravity(next);
    mergePowers(next);
    applyGravity(next);
    return { next, gained, boomColor, cleared, dropMeta };
  }, []);

  const softDrop = useCallback(() => {
    if (status !== 'playing' || !piece || lock.current) return;
    const moved = { ...piece, y: piece.y + 1 };
    if (fits(grid, moved)) {
      setPiece(moved);
      return;
    }
    lock.current = true;
    const { next, gained, boomColor, cleared, dropMeta } = lockPiece(
      grid,
      piece,
    );
    setGrid(next);
    setMoveCount((m) => m + 1);
    pushTerm('cmd', `> drop --packet ${dropMeta}`);

    if (gained > 0 && boomColor) {
      const nextScore = scoreRef.current + gained;
      scoreRef.current = nextScore;
      setScore(nextScore);
      setCombos((c) => c + 1);
      setLastCrash(boomColor);
      triggerGlitch(boomColor, gained >= 80);
      const pct = Math.min(100, (nextScore / BREACH_TARGET) * 100);
      const depth =
        gained >= 120
          ? 'ROOT'
          : gained >= 60
            ? 'KERNEL'
            : gained >= 30
              ? 'DAEMON'
              : 'USER';
      pushTerm(
        'ok',
        `exploit --vector ${GEM_LABELS[boomColor]} --blast ${cleared} --dmg ${gained} → ${depth}`,
        { color: GEM_HEX[boomColor] },
      );
      pushTerm('progress', `breach ${bar(pct)}`, {
        progress: pct,
        color: GEM_HEX[boomColor],
      });
      if (pct >= 100) {
        pushTerm('sys', 'PERIMETER COLLAPSED — full system breach.');
      } else if (pct >= 66) {
        pushTerm('warn', 'firewall segment unstable…');
      } else if (pct >= 33) {
        pushTerm('sys', 'lateral movement detected.');
      }
      pushTerm(
        'glitch',
        `░░░░ ${GEM_LABELS[boomColor]}_PURGE ░░░░ // noise=${Math.min(99, gained)}`,
        { color: GEM_HEX[boomColor] },
      );
    } else {
      pushTerm('sys', 'packet settled. no cascade.');
    }

    if (next[0].some(Boolean)) {
      setStatus('lost');
      setPiece(null);
      lock.current = false;
      pushTerm('err', 'FATAL: stack overflow — ICE reclaiming buffer.');
      triggerGlitch('alert', true);
      return;
    }
    setPiece(newPiece(combos > 0 && combos % 4 === 3));
    lock.current = false;
  }, [status, piece, grid, lockPiece, combos, pushTerm]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [termLines]);

  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(softDrop, SPEED_MS[speed]);
    return () => clearInterval(id);
  }, [status, speed, softDrop]);

  useEffect(() => {
    if (status !== 'playing' || mode !== 'timer') return;
    if (remaining <= 0) {
      const win = score >= 200;
      setStatus(win ? 'won' : 'lost');
      setPiece(null);
      pushTerm(
        win ? 'ok' : 'err',
        win
          ? 'timer.expire — objective met. extract ready.'
          : 'timer.expire — incomplete breach. connection dropped.',
      );
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [status, mode, remaining, score, pushTerm]);

  // ICE countdown + network defender spawn
  useEffect(() => {
    if (status !== 'playing') {
      if (defenderTimer.current) clearTimeout(defenderTimer.current);
      return;
    }

    let alive = true;

    const iceTick = setInterval(() => {
      setGrid((prev) => {
        const next = cloneGrid(prev);
        const events = tickIceBlocks(next);
        if (!events.length) return prev;
        applyGravity(next);
        mergePowers(next);
        applyGravity(next);
        queue.then(() => {
          if (!alive) return;
          for (const ev of events) {
            if (ev.kind === 'purge') {
              pushTerm(
                'sys',
                `netdef node@${ev.x},${ev.y} timed out → purged`,
              );
            } else if (ev.color) {
              pushTerm(
                'warn',
                `netdef node@${ev.x},${ev.y} mutated → ${GEM_LABELS[ev.color]}`,
                { color: GEM_HEX[ev.color] },
              );
            }
          }
        });
        return next;
      });
    }, 1000);

    const scheduleDefender = () => {
      const delay =
        DEFENDER_MIN_MS +
        Math.floor(Math.random() * (DEFENDER_MAX_MS - DEFENDER_MIN_MS));
      defenderTimer.current = setTimeout(() => {
        if (!alive) return;
        setGrid((prev) => {
          const next = cloneGrid(prev);
          const inj = injectIceBlock(next);
          queue.then(() => {
            if (!alive) return;
            if (!inj.ok) {
              pushTerm('warn', 'netdef inject failed — grid saturated');
              return;
            }
            pushTerm(
              'err',
              `! NETDEF inject ICE_NODE col=${inj.x} ttl=${inj.ttl}`,
            );
            pushTerm(
              'glitch',
              `▓▒░ DEFENDER_PULSE ░▒▓ scramble=${inj.ttl}${inj.ttl}${inj.ttl}`,
            );
            triggerGlitch(null, true);
          });
          return inj.ok ? next : prev;
        });
        scheduleDefender();
      }, delay);
    };
    scheduleDefender();

    return () => {
      alive = false;
      clearInterval(iceTick);
      if (defenderTimer.current) clearTimeout(defenderTimer.current);
    };
  }, [status, pushTerm]);

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

  useEffect(() => {
    if (status === 'won') {
      pushTerm('ok', 'SESSION CLOSED — netrun successful.');
    }
  }, [status, pushTerm]);

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

  const breachPct = Math.min(100, (score / BREACH_TARGET) * 100);

  return (
    <div
      className={styles.wrap}
      data-glitch={glitch ? '1' : '0'}
      style={
        glitchColor
          ? ({ ['--crash-color' as string]: GEM_HEX[glitchColor] } as CSSProperties)
          : undefined
      }
    >
      <div className={styles.scan} aria-hidden />
      <header className={styles.head}>
        <h3>Puzzle Crash</h3>
        <p>
          Monte power gems 2×2. O <strong>⚡</strong> nasce com uma cor neon e
          apaga <em>todas</em> as peças dessa cor — quanto maior o power, mais
          score. Blocos <strong>cinza</strong> são NETDEF: indestrutíveis até o
          timer acabar.
        </p>
        <div className={styles.legend}>
          {GEM_COLORS.map((c) => (
            <span key={c} style={{ color: GEM_HEX[c], textShadow: GEM_GLOW[c] }}>
              ■ {GEM_LABELS[c]}
            </span>
          ))}
          <span className={styles.legendCrash}>⚡ crash</span>
          <span className={styles.legendIce}>■ NETDEF</span>
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
            <span>PKT {moveCount}</span>
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

          <div className={styles.playArea}>
            <div className={styles.playLeft}>
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
                        data-ice={cell?.ice ? '1' : '0'}
                        data-power={cell?.power || 0}
                        data-empty={cell ? '0' : '1'}
                        style={
                          cell?.ice
                            ? {
                                background:
                                  'linear-gradient(145deg, #6a6e78, #3a3d45)',
                                boxShadow:
                                  '0 0 10px #9aa0aa66, inset 0 0 8px #000',
                                color: '#e8e8e8',
                              }
                            : cell
                              ? {
                                  background: cell.crash
                                    ? `radial-gradient(circle, #0a0a0f 30%, ${GEM_HEX[cell.color]} 100%)`
                                    : GEM_HEX[cell.color],
                                  boxShadow: cell.crash
                                    ? `${GEM_GLOW[cell.color]}, inset 0 0 8px #000`
                                    : `${GEM_GLOW[cell.color]}, inset 0 0 ${3 * cell.power}px rgba(0,0,0,0.45)`,
                                  color: cell.crash
                                    ? GEM_HEX[cell.color]
                                    : '#0a0a0f',
                                }
                              : undefined
                        }
                      >
                        {cell?.ice
                          ? cell.iceTimer
                          : cell?.crash
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
            </div>

            <aside
              className={styles.terminal}
              data-glitch={termGlitch ? '1' : '0'}
              aria-label="Terminal de breach"
            >
              <div className={styles.termHead}>
                <span>root@nightcity:~# breach_tty</span>
                <span className={styles.termMeta}>
                  SYS {Math.round(breachPct)}%
                </span>
              </div>
              <div className={styles.termBreach}>
                <span>INTRUSION</span>
                <div className={styles.termBreachTrack}>
                  <div
                    className={styles.termBreachFill}
                    style={{ width: `${breachPct}%` }}
                  />
                </div>
              </div>
              <div className={styles.termBody}>
                {termLines.map((line) => (
                  <div
                    key={line.id}
                    className={styles.termLine}
                    data-kind={line.kind}
                    style={
                      line.color
                        ? ({ ['--line-color' as string]: line.color } as CSSProperties)
                        : undefined
                    }
                  >
                    {line.kind === 'progress' ? (
                      <code>{line.text}</code>
                    ) : (
                      <span>{line.text}</span>
                    )}
                  </div>
                ))}
                <div ref={termEndRef} />
              </div>
              <div className={styles.termPrompt}>
                <span className={styles.termCursor}>█</span>
              </div>
            </aside>
          </div>

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
