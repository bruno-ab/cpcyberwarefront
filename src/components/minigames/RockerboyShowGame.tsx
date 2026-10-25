'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import shell from './MinigameShell.module.css';
import styles from './RockerboyShowGame.module.css';
import { useCampaign } from '../../lib/campaign';
import { reportMinigameResult } from '../../lib/minigameResult';
import { playCyberSound } from '../../lib/sound/cyberSounds';

type Status = 'menu' | 'playing' | 'won' | 'lost';
type Note = { id: number; lane: number; y: number };

const LANES = 4;
const KEYS = ['d', 'f', 'j', 'k'];

/** Rockerboy: show ao vivo — ritmo em 4 pistas. */
export const RockerboyShowGame = () => {
  const { campaignId, refresh } = useCampaign();
  const [status, setStatus] = useState<Status>('menu');
  const [notes, setNotes] = useState<Note[]>([]);
  const [crowd, setCrowd] = useState(20);
  const [fame, setFame] = useState(0);
  const [combo, setCombo] = useState(0);
  const [remaining, setRemaining] = useState(30);
  const seq = useRef(0);
  const hitZone = 82;
  const reported = useRef(false);

  const start = () => {
    setNotes([]);
    setCrowd(20);
    setFame(0);
    setCombo(0);
    setRemaining(30);
    reported.current = false;
    setStatus('playing');
    playCyberSound('jack');
  };

  useEffect(() => {
    if ((status !== 'won' && status !== 'lost') || reported.current) return;
    reported.current = true;
    reportMinigameResult(campaignId, 'rocker', status, {
      fame,
      crowd,
    }).then(() => refresh());
  }, [status, fame, crowd, campaignId, refresh]);

  useEffect(() => {
    if (status !== 'playing') return;
    const spawn = setInterval(() => {
      const id = ++seq.current;
      setNotes((prev) => [
        ...prev,
        { id, lane: Math.floor(Math.random() * LANES), y: -8 },
      ]);
    }, 520);
    return () => clearInterval(spawn);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return;
    const tick = setInterval(() => {
      setNotes((prev) => {
        const next: Note[] = [];
        let missed = 0;
        for (const n of prev) {
          const y = n.y + 3.2;
          if (y > 105) missed += 1;
          else next.push({ ...n, y });
        }
        if (missed) {
          setCombo(0);
          setCrowd((c) => Math.max(0, c - missed * 4));
        }
        return next;
      });
    }, 50);
    return () => clearInterval(tick);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return;
    if (remaining <= 0) {
      const next = crowd >= 50 ? 'won' : 'lost';
      setStatus(next);
      playCyberSound(next === 'won' ? 'win' : 'lose');
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [status, remaining, crowd]);

  useEffect(() => {
    if (status === 'playing' && crowd <= 0) {
      setStatus('lost');
      playCyberSound('lose');
    }
  }, [crowd, status]);

  const hitLane = useCallback(
    (lane: number) => {
      if (status !== 'playing') return;
      setNotes((prev) => {
        const idx = prev.findIndex(
          (n) => n.lane === lane && Math.abs(n.y - hitZone) < 10,
        );
        if (idx < 0) {
          setCombo(0);
          setCrowd((c) => Math.max(0, c - 3));
          playCyberSound('wrong', { volume: 0.5 });
          return prev;
        }
        const copy = [...prev];
        copy.splice(idx, 1);
        setCombo((c) => c + 1);
        setCrowd((c) => Math.min(100, c + 5));
        setFame((f) => f + 1 + Math.floor(combo / 4));
        playCyberSound('correct', { volume: 0.65 });
        return copy;
      });
    },
    [status, combo],
  );

  useEffect(() => {
    if (status !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      const i = KEYS.indexOf(e.key.toLowerCase());
      if (i >= 0) {
        e.preventDefault();
        hitLane(i);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, hitLane]);

  return (
    <div className={shell.wrap} data-accent="magenta">
      <header className={shell.head}>
        <h3>Rockerboy — Show Ao Vivo</h3>
        <p>
          Notas nas 4 pistas (D F J K). Precisão sobe a multidão e a fama.
          Multidão &lt; 0 = vaias; ≥50 no fim = show lendário.
        </p>
      </header>

      {status === 'menu' && (
        <div className={shell.menu}>
          <button type="button" className={shell.start} onClick={start}>
            Subir no palco
          </button>
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={shell.hud}>
            <span>CROWD {crowd}%</span>
            <span>FAME {fame}</span>
            <span>COMBO ×{combo}</span>
            <span className={shell.timer}>{remaining}s</span>
          </div>
          <div className={styles.stage}>
            {Array.from({ length: LANES }, (_, lane) => (
              <button
                key={lane}
                type="button"
                className={styles.lane}
                onClick={() => hitLane(lane)}
              >
                {notes
                  .filter((n) => n.lane === lane)
                  .map((n) => (
                    <span
                      key={n.id}
                      className={styles.note}
                      style={{ top: `${n.y}%` }}
                    />
                  ))}
                <span className={styles.zone} />
                <span className={styles.key}>{KEYS[lane].toUpperCase()}</span>
              </button>
            ))}
          </div>
          {(status === 'won' || status === 'lost') && (
            <div className={shell.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>
                {status === 'won'
                  ? `Encore! Fama +${fame}. Narrador: reputação de Rockerboy sobe.`
                  : 'Show esfriou. Multidão foi embora.'}
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

export default RockerboyShowGame;
