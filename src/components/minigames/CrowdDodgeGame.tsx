'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './CrowdDodgeGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';

type Obstacle = {
  id: number;
  lane: number;
  y: number;
  kind: 'drone' | 'ncpd' | 'civ';
};

type Diff = {
  id: string;
  name: string;
  spawnMs: number;
  speed: number;
  goalDist: number;
  timeSec: number;
};

const DIFFS: Diff[] = [
  { id: 'vicario', name: 'Vicário stroll', spawnMs: 900, speed: 0.022, goalDist: 40, timeSec: 45 },
  { id: 'watson', name: 'Watson rush', spawnMs: 700, speed: 0.03, goalDist: 55, timeSec: 50 },
  { id: 'corpo', name: 'Corpo chase', spawnMs: 520, speed: 0.04, goalDist: 70, timeSec: 55 },
];

const KINDS: Obstacle['kind'][] = ['drone', 'ncpd', 'civ'];
const LABELS: Record<Obstacle['kind'], string> = {
  drone: '◉',
  ncpd: '▲',
  civ: '□',
};

export const CrowdDodgeGame = () => {
  const [diff, setDiff] = useState<Diff>(DIFFS[0]);
  const [status, setStatus] = useState<Status>('menu');
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [dist, setDist] = useState(0);
  const [remaining, setRemaining] = useState(45);
  const [glitch, setGlitch] = useState(false);
  const idRef = useRef(0);
  const obsRef = useRef<Obstacle[]>([]);
  const laneRef = useRef(1);
  const distRef = useRef(0);

  const start = (d: Diff) => {
    setDiff(d);
    setLane(1);
    laneRef.current = 1;
    setObstacles([]);
    obsRef.current = [];
    setDist(0);
    distRef.current = 0;
    setRemaining(d.timeSec);
    setStatus('playing');
    setGlitch(false);
  };

  const hit = useCallback(() => {
    setStatus('lost');
    setGlitch(true);
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        const next = Math.max(0, laneRef.current - 1);
        laneRef.current = next;
        setLane(next);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        const next = Math.min(2, laneRef.current + 1);
        laneRef.current = next;
        setLane(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return;
    if (remaining <= 0) {
      setStatus(distRef.current >= diff.goalDist ? 'won' : 'lost');
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [status, remaining, diff.goalDist]);

  useEffect(() => {
    if (status !== 'playing') return;

    const spawn = setInterval(() => {
      idRef.current += 1;
      const obs: Obstacle = {
        id: idRef.current,
        lane: Math.floor(Math.random() * 3),
        y: 0,
        kind: KINDS[Math.floor(Math.random() * KINDS.length)],
      };
      // avoid same-lane double spawn too close
      if (obsRef.current.some((o) => o.lane === obs.lane && o.y < 0.15)) return;
      const next = [...obsRef.current, obs].slice(-20);
      obsRef.current = next;
      setObstacles(next);
    }, diff.spawnMs);

    const tick = setInterval(() => {
      distRef.current += diff.speed * 8;
      setDist(Math.floor(distRef.current));

      if (distRef.current >= diff.goalDist) {
        setStatus('won');
        return;
      }

      let crashed = false;
      const moved = obsRef.current
        .map((o) => ({ ...o, y: o.y + diff.speed }))
        .filter((o) => {
          if (o.y > 1.05) return false;
          // player hitbox near bottom
          if (o.lane === laneRef.current && o.y > 0.78 && o.y < 0.96) {
            crashed = true;
          }
          return true;
        });
      obsRef.current = moved;
      setObstacles(moved);
      if (crashed) hit();
    }, 40);

    return () => {
      clearInterval(spawn);
      clearInterval(tick);
    };
  }, [status, diff, hit]);

  return (
    <div className={styles.wrap} data-glitch={glitch ? '1' : '0'}>
      <header className={styles.head}>
        <h3>Crowd Dodge</h3>
        <p>
          Fuja pela multidão de Night City. ← → (ou A/D) mudam de faixa. Evite
          drones, NCPD e civis até a meta de distância.
        </p>
      </header>

      {status === 'menu' && (
        <div className={styles.menu}>
          {DIFFS.map((d) => (
            <button key={d.id} type="button" className={styles.card} onClick={() => start(d)}>
              <strong>{d.name}</strong>
              <span>
                {d.goalDist}m · {d.timeSec}s
              </span>
            </button>
          ))}
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={styles.hud}>
            <span>
              DIST {dist}/{diff.goalDist}m
            </span>
            <span className={styles.timer}>{remaining}s</span>
          </div>
          <div className={styles.street}>
            <div className={styles.scan} aria-hidden />
            {[0, 1, 2].map((l) => (
              <div key={l} className={styles.lane} data-player={lane === l ? '1' : '0'}>
                {obstacles
                  .filter((o) => o.lane === l)
                  .map((o) => (
                    <div
                      key={o.id}
                      className={styles.obs}
                      data-kind={o.kind}
                      style={{ top: `${o.y * 100}%` }}
                    >
                      {LABELS[o.kind]}
                    </div>
                  ))}
                {lane === l && <div className={styles.player}>◆</div>}
              </div>
            ))}
          </div>
          <div className={styles.mobile}>
            <button type="button" onClick={() => { const n = Math.max(0, lane - 1); laneRef.current = n; setLane(n); }}>
              ←
            </button>
            <button type="button" onClick={() => { const n = Math.min(2, lane + 1); laneRef.current = n; setLane(n); }}>
              →
            </button>
          </div>
          <p className={styles.legend}>
            <span data-kind="drone">◉ drone</span>
            <span data-kind="ncpd">▲ NCPD</span>
            <span data-kind="civ">□ civil</span>
          </p>
          {(status === 'won' || status === 'lost') && (
            <div className={styles.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>
                {status === 'won'
                  ? 'Escapou — Street Cred +.'
                  : 'Pegaram você — ICE / NCPD.'}
              </p>
              <button type="button" className={styles.start} onClick={() => start(diff)}>
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

export default CrowdDodgeGame;
