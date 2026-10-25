'use client';

import { useState } from 'react';
import shell from './MinigameShell.module.css';
import styles from './BarGambleGame.module.css';

type Status = 'menu' | 'playing' | 'round' | 'done';
type Choice = 'high' | 'low' | 'bluff';

const roll = () => 1 + Math.floor(Math.random() * 6);

/** Jogo rápido de bar: dados + blefe por eddies. */
export const BarGambleGame = () => {
  const [status, setStatus] = useState<Status>('menu');
  const [eddies, setEddies] = useState(100);
  const [bet, setBet] = useState(10);
  const [you, setYou] = useState(0);
  const [npc, setNpc] = useState(0);
  const [msg, setMsg] = useState('');
  const [rounds, setRounds] = useState(0);

  const start = () => {
    setEddies(100);
    setBet(10);
    setRounds(0);
    setMsg('Aposte eddies. High / Low vs NPC, ou Blefe.');
    setStatus('playing');
  };

  const play = (choice: Choice) => {
    if (status !== 'playing' || bet > eddies || bet < 1) return;
    const y = roll();
    const n = roll();
    setYou(y);
    setNpc(n);
    setRounds((r) => r + 1);

    let delta = 0;
    if (choice === 'bluff') {
      const npcCalls = Math.random() < 0.45;
      if (!npcCalls) {
        delta = bet;
        setMsg(`Blefe cola. NPC passa. +¤${bet}`);
      } else if (y >= n) {
        delta = Math.floor(bet * 1.5);
        setMsg(`Blefe chamado — você cobre (${y}≥${n}). +¤${delta}`);
      } else {
        delta = -bet * 2;
        setMsg(`Blefe chamado e falhou (${y}<${n}). ${delta}¤`);
      }
    } else if (choice === 'high') {
      delta = y > n ? bet : -bet;
      setMsg(y > n ? `High hit ${y}>${n}. +¤${bet}` : `High miss ${y}≤${n}. −¤${bet}`);
    } else {
      delta = y < n ? bet : -bet;
      setMsg(y < n ? `Low hit ${y}<${n}. +¤${bet}` : `Low miss ${y}≥${n}. −¤${bet}`);
    }

    const next = eddies + delta;
    setEddies(next);
    setStatus('round');
    if (next <= 0 || rounds + 1 >= 8) {
      setTimeout(() => setStatus('done'), 600);
    }
  };

  return (
    <div className={shell.wrap} data-accent="yellow">
      <header className={shell.head}>
        <h3>Dados do Bar</h3>
        <p>
          Apostas rápidas com eddies entre missões. High/Low ou blefe contra o
          NPC da mesa.
        </p>
      </header>

      {status === 'menu' && (
        <div className={shell.menu}>
          <button type="button" className={shell.start} onClick={start}>
            Sentar na mesa
          </button>
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={shell.hud}>
            <span>¤ {eddies}</span>
            <span>ROUND {rounds}/8</span>
          </div>
          <label className={styles.bet}>
            Aposta
            <input
              type="range"
              min={5}
              max={Math.max(5, eddies)}
              step={5}
              value={Math.min(bet, eddies || 5)}
              disabled={status !== 'playing'}
              onChange={(e) => setBet(Number(e.target.value))}
            />
            <em>¤{bet}</em>
          </label>
          <div className={styles.dice}>
            <div>
              <span>VOCÊ</span>
              <strong>{you || '—'}</strong>
            </div>
            <div>
              <span>NPC</span>
              <strong>{npc || '—'}</strong>
            </div>
          </div>
          {status === 'playing' && (
            <div className={styles.actions}>
              <button type="button" className={shell.action} onClick={() => play('high')}>
                High
              </button>
              <button type="button" className={shell.action} onClick={() => play('low')}>
                Low
              </button>
              <button type="button" className={shell.action} onClick={() => play('bluff')}>
                Blefe
              </button>
            </div>
          )}
          {status === 'round' && (
            <button type="button" className={shell.start} onClick={() => setStatus('playing')}>
              Próxima mão
            </button>
          )}
          {msg && <p className={shell.hint}>{msg}</p>}
          {status === 'done' && (
            <div className={shell.result} data-ok={eddies > 100 ? '1' : '0'}>
              <p>
                {eddies > 100
                  ? `Saiu no lucro: ¤${eddies}.`
                  : eddies <= 0
                    ? 'Zerou a banca. Conta fica com o bar.'
                    : `Saiu com ¤${eddies}.`}
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

export default BarGambleGame;
