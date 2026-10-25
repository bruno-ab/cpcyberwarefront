'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './PacketSnifferGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';
type PktType = 'SAFE' | 'MALWARE' | 'BAIT';

type Packet = {
  id: number;
  type: PktType;
  y: number;
  lane: number;
};

type Diff = {
  id: string;
  name: string;
  spawnMs: number;
  speed: number;
  goal: number;
  lives: number;
  timeSec: number;
};

const DIFFS: Diff[] = [
  { id: 'rua', name: 'Rua', spawnMs: 1100, speed: 0.018, goal: 18, lives: 3, timeSec: 60 },
  { id: 'corpo', name: 'Corpo', spawnMs: 850, speed: 0.026, goal: 25, lives: 3, timeSec: 55 },
  { id: 'blackwall', name: 'Blackwall', spawnMs: 650, speed: 0.034, goal: 32, lives: 2, timeSec: 50 },
];

const TYPES: PktType[] = ['SAFE', 'MALWARE', 'BAIT'];
const KEY_MAP: Record<string, PktType> = {
  a: 'SAFE',
  A: 'SAFE',
  s: 'MALWARE',
  S: 'MALWARE',
  d: 'BAIT',
  D: 'BAIT',
  '1': 'SAFE',
  '2': 'MALWARE',
  '3': 'BAIT',
};

const randType = (): PktType => TYPES[Math.floor(Math.random() * TYPES.length)];

export const PacketSnifferGame = () => {
  const [diff, setDiff] = useState<Diff>(DIFFS[0]);
  const [status, setStatus] = useState<Status>('menu');
  const [packets, setPackets] = useState<Packet[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setHits] = useState(3);
  const [remaining, setRemaining] = useState(60);
  const [log, setLog] = useState<string[]>([]);
  const [flash, setFlash] = useState<PktType | null>(null);
  const idRef = useRef(0);
  const packetsRef = useRef<Packet[]>([]);

  const pushLog = (line: string) =>
    setLog((l) => [...l.slice(-10), line]);

  const start = (d: Diff) => {
    setDiff(d);
    setPackets([]);
    packetsRef.current = [];
    setScore(0);
    setHits(d.lives);
    setRemaining(d.timeSec);
    setLog([`sniffer --iface eth0 --profile ${d.id}`]);
    setStatus('playing');
    setFlash(null);
  };

  const classify = useCallback(
    (type: PktType) => {
      if (status !== 'playing') return;
      const list = packetsRef.current;
      // lowest packet (closest to bottom / highest y)
      const sorted = [...list].sort((a, b) => b.y - a.y);
      const target = sorted[0];
      if (!target) {
        pushLog('> sniff: buffer empty');
        return;
      }
      setFlash(type);
      setTimeout(() => setFlash(null), 120);
      if (target.type === type) {
        setScore((s) => {
          const nextScore = s + 1;
          pushLog(`ok  ${type}  +1  (${nextScore}/${diff.goal})`);
          if (nextScore >= diff.goal) {
            setStatus('won');
            pushLog('BREACH — filter chain clean.');
          }
          return nextScore;
        });
        const next = list.filter((p) => p.id !== target.id);
        packetsRef.current = next;
        setPackets(next);
      } else {
        pushLog(`err misclass ${target.type} as ${type}`);
        const next = list.filter((p) => p.id !== target.id);
        packetsRef.current = next;
        setPackets(next);
        setHits((h) => {
          const left = h - 1;
          if (left <= 0) {
            setStatus('lost');
            pushLog('ICE dump — link flooded.');
          }
          return left;
        });
      }
    },
    [status, diff.goal],
  );

  useEffect(() => {
    if (status !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      const t = KEY_MAP[e.key];
      if (t) {
        e.preventDefault();
        classify(t);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, classify]);

  useEffect(() => {
    if (status !== 'playing') return;
    if (remaining <= 0) {
      setStatus(score >= diff.goal ? 'won' : 'lost');
      pushLog(score >= diff.goal ? 'timer ok' : 'timer fail — incomplete');
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [status, remaining, score, diff.goal]);

  useEffect(() => {
    if (status !== 'playing') return;
    const spawn = setInterval(() => {
      idRef.current += 1;
      const pkt: Packet = {
        id: idRef.current,
        type: randType(),
        y: 0,
        lane: Math.floor(Math.random() * 3),
      };
      const next = [...packetsRef.current, pkt].slice(-12);
      packetsRef.current = next;
      setPackets(next);
    }, diff.spawnMs);

    const tick = setInterval(() => {
      let leaked = 0;
      const moved = packetsRef.current
        .map((p) => ({ ...p, y: p.y + diff.speed }))
        .filter((p) => {
          if (p.y >= 1) {
            leaked += 1;
            return false;
          }
          return true;
        });
      packetsRef.current = moved;
      setPackets(moved);
      if (leaked > 0) {
        setHits((h) => {
          const left = h - leaked;
          pushLog(`leak ×${leaked} — packet escaped`);
          if (left <= 0) {
            setStatus('lost');
            pushLog('buffer overflow');
          }
          return Math.max(0, left);
        });
      }
    }, 50);

    return () => {
      clearInterval(spawn);
      clearInterval(tick);
    };
  }, [status, diff]);

  return (
    <div className={styles.wrap} data-flash={flash || ''}>
      <header className={styles.head}>
        <h3>Packet Sniffer</h3>
        <p>
          Classifique o pacote mais baixo:{' '}
          <kbd>A</kbd> SAFE · <kbd>S</kbd> MALWARE · <kbd>D</kbd> BAIT. Não deixe
          vazar.
        </p>
      </header>

      {status === 'menu' && (
        <div className={styles.menu}>
          {DIFFS.map((d) => (
            <button key={d.id} type="button" className={styles.card} onClick={() => start(d)}>
              <strong>{d.name}</strong>
              <span>
                meta {d.goal} · vidas {d.lives} · {d.timeSec}s
              </span>
            </button>
          ))}
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={styles.hud}>
            <span>OK {score}/{diff.goal}</span>
            <span>HP {lives}</span>
            <span className={styles.timer}>{remaining}s</span>
          </div>
          <div className={styles.play}>
            <div className={styles.laneBox}>
              {[0, 1, 2].map((lane) => (
                <div key={lane} className={styles.lane}>
                  {packets
                    .filter((p) => p.lane === lane)
                    .map((p) => (
                      <div
                        key={p.id}
                        className={styles.pkt}
                        data-type={p.type}
                        style={{ top: `${p.y * 100}%` }}
                      >
                        {p.type.slice(0, 3)}
                      </div>
                    ))}
                </div>
              ))}
              <div className={styles.danger} />
            </div>
            <aside className={styles.term}>
              <div className={styles.termHead}>tcpdump · live</div>
              <div className={styles.termBody}>
                {log.map((l, i) => (
                  <div key={`${i}-${l.slice(0, 12)}`}>{l}</div>
                ))}
              </div>
              <div className={styles.keys}>
                <button type="button" data-type="SAFE" onClick={() => classify('SAFE')}>
                  A SAFE
                </button>
                <button type="button" data-type="MALWARE" onClick={() => classify('MALWARE')}>
                  S MAL
                </button>
                <button type="button" data-type="BAIT" onClick={() => classify('BAIT')}>
                  D BAIT
                </button>
              </div>
            </aside>
          </div>
          {(status === 'won' || status === 'lost') && (
            <div className={styles.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>{status === 'won' ? 'Filtro estável.' : 'Rede comprometida.'}</p>
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

export default PacketSnifferGame;
