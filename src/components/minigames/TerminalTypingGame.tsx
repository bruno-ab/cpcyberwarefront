'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TERMINAL_MISSIONS,
  TerminalMission,
} from './terminalCommands';
import styles from './TerminalTypingGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';

export const TerminalTypingGame = () => {
  const [mission, setMission] = useState<TerminalMission | null>(null);
  const [status, setStatus] = useState<Status>('menu');
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [errors, setErrors] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = mission?.commands[index] || '';

  const matchPrefix = useMemo(() => {
    let i = 0;
    while (i < input.length && i < current.length && input[i] === current[i]) {
      i++;
    }
    return i;
  }, [input, current]);

  const hasTypo = input.length > matchPrefix;

  const start = (m: TerminalMission) => {
    setMission(m);
    setIndex(0);
    setInput('');
    setRemaining(m.timeSec);
    setErrors(0);
    setLog([`> boot ${m.id}`, `> mission: ${m.title}`]);
    setStatus('playing');
    setGlitch(false);
    setErrorFlash(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (status !== 'playing') return;
    if (remaining <= 0) {
      setStatus('lost');
      setLog((l) => [...l, '> TRACE DETECTED — link severed']);
      setGlitch(true);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [status, remaining]);

  // glitches leves durante o jogo; mais fortes no erro
  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => {
      if (Math.random() < 0.12) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 120 + Math.random() * 180);
      }
    }, 900);
    return () => clearInterval(id);
  }, [status]);

  const submit = () => {
    if (!mission || status !== 'playing') return;
    if (input === current) {
      setLog((l) => [...l, `> ${current}`, '  ok']);
      const next = index + 1;
      setInput('');
      if (next >= mission.commands.length) {
        setStatus('won');
        setLog((l) => [...l, '> ALL PACKETS DELIVERED', '> jackout clean']);
      } else {
        setIndex(next);
      }
      return;
    }
    setErrors((e) => e + 1);
    setErrorFlash(true);
    setGlitch(true);
    setLog((l) => [...l, `> ${input || '(empty)'}`, '  ERROR: syntax / ICE spike']);
    setInput('');
    setTimeout(() => setErrorFlash(false), 450);
    setTimeout(() => setGlitch(false), 500);
    // penalidade de tempo
    setRemaining((r) => Math.max(0, r - 3));
  };

  return (
    <div
      className={styles.wrap}
      data-error={errorFlash ? '1' : '0'}
      data-glitch={glitch ? '1' : '0'}
      data-status={status}
    >
      <div className={styles.scanlines} aria-hidden />
      <div className={styles.crt} aria-hidden />

      {status === 'menu' && (
        <div className={styles.menu}>
          <pre className={styles.ascii}>{`
 _______________
| TERMINAL v2.1 |
|_______________|
`}</pre>
          <p className={styles.intro}>
            Digite os comandos exatamente como aparecem. Erro = vermelho + ICE
            (−3s). Aesthetic de terminal antigo — preto e verde.
          </p>
          <ul className={styles.missions}>
            {TERMINAL_MISSIONS.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => start(m)}>
                  <strong>{m.title}</strong>
                  <span>
                    {m.commands.length} cmds · {m.timeSec}s
                  </span>
                  <em>{m.blurb}</em>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status !== 'menu' && mission && (
        <div className={styles.session}>
          <header className={styles.bar}>
            <span>{mission.title}</span>
            <span>
              cmd {index + 1}/{mission.commands.length}
            </span>
            <span className={styles.clock} data-low={remaining <= 10 ? '1' : '0'}>
              {remaining}s
            </span>
            <span>err {errors}</span>
          </header>

          <pre className={styles.ascii}>{mission.ascii}</pre>

          <div className={styles.log}>
            {log.slice(-8).map((line, i) => (
              <div key={`${i}-${line}`}>{line}</div>
            ))}
          </div>

          {status === 'playing' && (
            <>
              <p className={styles.promptLabel}>TARGET:</p>
              <pre className={styles.target}>{current}</pre>
              <div className={styles.inputRow}>
                <span className={styles.prompt}>&gt;</span>
                <input
                  ref={inputRef}
                  className={styles.input}
                  value={input}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submit();
                  }}
                  aria-label="Comando do terminal"
                />
              </div>
              <p className={styles.ghost} aria-hidden>
                <span className={styles.ok}>{current.slice(0, matchPrefix)}</span>
                <span className={hasTypo ? styles.bad : styles.rest}>
                  {current.slice(matchPrefix)}
                </span>
              </p>
            </>
          )}

          {(status === 'won' || status === 'lost') && (
            <div className={styles.result} data-ok={status === 'won' ? '1' : '0'}>
              <pre>
                {status === 'won'
                  ? `
*** LINK SECURE ***
mission complete
`
                  : `
*** CONNECTION LOST ***
netwatch / ice / typo
`}
              </pre>
              <button type="button" onClick={() => start(mission)}>
                retry
              </button>
              <button type="button" onClick={() => setStatus('menu')}>
                menu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TerminalTypingGame;
