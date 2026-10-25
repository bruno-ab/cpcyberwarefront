'use client';

import { useMemo, useState } from 'react';
import shell from './MinigameShell.module.css';
import styles from './PasswordMastermindGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';

const SYMBOLS = ['◆', '▲', '●', '■', '◈', '★', '◇', '▼'] as const;

type Guess = {
  code: string[];
  exact: number;
  near: number;
};

/** Mastermind de senha — teste de Inteligência. */
export const PasswordMastermindGame = () => {
  const [status, setStatus] = useState<Status>('menu');
  const [intel, setIntel] = useState(2);
  const [len, setLen] = useState(4);
  const [secret, setSecret] = useState<string[]>([]);
  const [draft, setDraft] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);

  const maxGuesses = useMemo(() => 6 + intel, [intel]);

  const start = () => {
    const code = Array.from({ length: len }, () =>
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    );
    setSecret(code);
    setDraft([]);
    setGuesses([]);
    setStatus('playing');
  };

  const scoreGuess = (code: string[]): Guess => {
    const exact = code.reduce((acc, s, i) => acc + (s === secret[i] ? 1 : 0), 0);
    const secretCount: Record<string, number> = {};
    const guessCount: Record<string, number> = {};
    secret.forEach((s, i) => {
      if (code[i] === s) return;
      secretCount[s] = (secretCount[s] || 0) + 1;
    });
    code.forEach((s, i) => {
      if (secret[i] === s) return;
      guessCount[s] = (guessCount[s] || 0) + 1;
    });
    let near = 0;
    for (const s of Object.keys(guessCount)) {
      near += Math.min(guessCount[s] || 0, secretCount[s] || 0);
    }
    return { code, exact, near };
  };

  const submit = () => {
    if (status !== 'playing' || draft.length !== len) return;
    const g = scoreGuess(draft);
    const next = [...guesses, g];
    setGuesses(next);
    setDraft([]);
    if (g.exact === len) {
      setStatus('won');
      return;
    }
    if (next.length >= maxGuesses) setStatus('lost');
  };

  return (
    <div className={shell.wrap}>
      <header className={shell.head}>
        <h3>Mastermind de Senha</h3>
        <p>
          Adivinhe o código. ● = certo no lugar · ○ = certo fora do lugar.
          Inteligência aumenta tentativas.
        </p>
      </header>

      {status === 'menu' && (
        <div className={shell.menu}>
          <label>
            Inteligência (0–5)
            <select
              value={intel}
              onChange={(e) => setIntel(Number(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} — {6 + n} tentativas
                </option>
              ))}
            </select>
          </label>
          <label>
            Comprimento
            <select value={len} onChange={(e) => setLen(Number(e.target.value))}>
              {[4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} símbolos
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={shell.start} onClick={start}>
            Iniciar crack
          </button>
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={shell.hud}>
            <span>INT {intel}</span>
            <span>
              TRY {guesses.length}/{maxGuesses}
            </span>
          </div>
          <div className={styles.palette}>
            {SYMBOLS.map((s) => (
              <button
                key={s}
                type="button"
                className={styles.sym}
                disabled={status !== 'playing' || draft.length >= len}
                onClick={() => setDraft((d) => [...d, s])}
              >
                {s}
              </button>
            ))}
          </div>
          <div className={styles.draft}>
            {Array.from({ length: len }, (_, i) => (
              <span key={i} className={styles.slot}>
                {draft[i] || '·'}
              </span>
            ))}
            <button
              type="button"
              className={shell.ghost}
              disabled={!draft.length || status !== 'playing'}
              onClick={() => setDraft((d) => d.slice(0, -1))}
            >
              ⌫
            </button>
            <button
              type="button"
              className={shell.start}
              disabled={draft.length !== len || status !== 'playing'}
              onClick={submit}
            >
              Testar
            </button>
          </div>
          <ul className={styles.history}>
            {guesses.map((g, i) => (
              <li key={i}>
                <span className={styles.code}>{g.code.join(' ')}</span>
                <span className={styles.hints}>
                  {'●'.repeat(g.exact)}
                  {'○'.repeat(g.near)}
                  {!g.exact && !g.near ? '—' : ''}
                </span>
              </li>
            ))}
          </ul>
          {(status === 'won' || status === 'lost') && (
            <div className={shell.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>
                {status === 'won'
                  ? 'Código quebrado.'
                  : `Falhou. Segredo era ${secret.join(' ')}.`}
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

export default PasswordMastermindGame;
