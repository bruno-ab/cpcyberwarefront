'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TERMINAL_MISSIONS,
  TerminalMission,
} from './terminalCommands';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import styles from './TerminalTypingGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';

type LogLine = { text: string; kind?: 'ok' | 'err' | 'info' };

const NEOFETCH_ASCII = `
       /\\
      /  \\
     /\\   \\
    /      \\
   /   ,,   \\
  /   |  |  -\\
 /_-''    ''-_\\
`;

const PROC_ROWS = [
  { pid: '1024', cpu: '12.1', mem: '3.4', cmd: 'icebreakd' },
  { pid: '2048', cpu: '8.0', mem: '2.1', cmd: 'netwatch-shim' },
  { pid: '3110', cpu: '41.2', mem: '9.8', cmd: 'braindance-edit' },
  { pid: '4096', cpu: '2.3', mem: '1.0', cmd: 'ssh-agent' },
  { pid: '5122', cpu: '0.4', mem: '0.6', cmd: 'tmux' },
  { pid: '7781', cpu: '18.7', mem: '4.2', cmd: 'exfil-pipe' },
  { pid: '8800', cpu: '0.1', mem: '0.2', cmd: 'journald' },
];

export const TerminalTypingGame = () => {
  const [mission, setMission] = useState<TerminalMission | null>(null);
  const [status, setStatus] = useState<Status>('menu');
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [errors, setErrors] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [uptime, setUptime] = useState(0);
  const [hotPid, setHotPid] = useState(2);
  const inputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

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
    setUptime(0);
    setLog([
      { text: `[boot] deck online — ${m.id}`, kind: 'info' },
      { text: `[mission] ${m.title}`, kind: 'info' },
      { text: m.blurb, kind: 'info' },
    ]);
    setStatus('playing');
    setGlitch(false);
    setErrorFlash(false);
    playCyberSound('jack');
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  useEffect(() => {
    if (status !== 'playing') return;
    if (remaining <= 0) {
      setStatus('lost');
      playCyberSound('lose');
      setLog((l) => [
        ...l,
        { text: '[alert] TRACE / ICE — link severed', kind: 'err' },
      ]);
      setGlitch(true);
      return;
    }
    const t = setTimeout(() => {
      setRemaining((r) => r - 1);
      setUptime((u) => u + 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [status, remaining]);

  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => {
      if (Math.random() < 0.14) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 100 + Math.random() * 160);
      }
      setHotPid(Math.floor(Math.random() * PROC_ROWS.length));
    }, 850);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const submit = () => {
    if (!mission || status !== 'playing') return;
    if (input === current) {
      setLog((l) => [
        ...l,
        { text: `netrunner@nightcity:~$ ${current}`, kind: 'info' },
        { text: '  ok — packet accepted', kind: 'ok' },
      ]);
      const next = index + 1;
      setInput('');
      playCyberSound('correct');
      if (next >= mission.commands.length) {
        setStatus('won');
        playCyberSound('win');
        setLog((l) => [
          ...l,
          { text: '[done] ALL PACKETS DELIVERED', kind: 'ok' },
          { text: '[jackout] clean disconnect', kind: 'ok' },
        ]);
      } else {
        setIndex(next);
      }
      return;
    }
    setErrors((e) => e + 1);
    setErrorFlash(true);
    setGlitch(true);
    playCyberSound('glitch');
    setLog((l) => [
      ...l,
      { text: `netrunner@nightcity:~$ ${input || '^C'}`, kind: 'err' },
      { text: '  ERROR: syntax / ICE spike (−3s)', kind: 'err' },
    ]);
    setInput('');
    setTimeout(() => setErrorFlash(false), 450);
    setTimeout(() => setGlitch(false), 520);
    setRemaining((r) => Math.max(0, r - 3));
  };

  const mm = String(Math.floor(uptime / 60)).padStart(2, '0');
  const ss = String(uptime % 60).padStart(2, '0');

  return (
    <div
      className={styles.bezel}
      data-error={errorFlash ? '1' : '0'}
      data-status={status}
    >
      <div
        className={styles.screen}
        data-glitch={glitch ? '1' : '0'}
        onClick={() => status === 'playing' && inputRef.current?.focus()}
      >
        <div className={styles.scanlines} aria-hidden />
        <div className={styles.phosphor} aria-hidden />
        <div className={styles.vignette} aria-hidden />

        {status === 'menu' && (
          <div className={styles.menu}>
            <div className={styles.sysPane} style={{ border: 'none', display: 'flex', gap: '1rem' }}>
              <pre className={styles.ascii}>{NEOFETCH_ASCII}</pre>
              <div>
                <p className={styles.paneTitle}>cool-retro-term · night city</p>
                <ul className={styles.sysList}>
                  <li>
                    <strong>user</strong> netrunner
                  </li>
                  <li>
                    <strong>host</strong> bunker-deck
                  </li>
                  <li>
                    <strong>shell</strong> /bin/bash
                  </li>
                  <li>
                    <strong>link</strong> waiting jack-in
                  </li>
                </ul>
              </div>
            </div>
            <p className={styles.menuIntro}>
              Terminal fosforoso. Digite o comando-alvo exatamente e Enter. Typo
              = vermelho + glitch (−3s). Escolha a missão:
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
          <div className={styles.grid}>
            <section className={`${styles.pane} ${styles.sysPane}`}>
              <pre className={styles.ascii}>
                {mission.ascii.trimEnd() || NEOFETCH_ASCII}
              </pre>
              <div>
                <p className={styles.paneTitle}>
                  neofetch
                  <span
                    className={styles.clock}
                    data-low={remaining <= 10 ? '1' : '0'}
                  >
                    {status === 'playing' ? `${remaining}s` : status}
                  </span>
                </p>
                <ul className={styles.sysList}>
                  <li>
                    <strong>user</strong> netrunner
                  </li>
                  <li>
                    <strong>host</strong> bunker-deck
                  </li>
                  <li>
                    <strong>mission</strong> {mission.id}
                  </li>
                  <li>
                    <strong>uptime</strong> {mm}:{ss}
                  </li>
                  <li>
                    <strong>errors</strong> {errors}
                  </li>
                  <li>
                    <strong>ram</strong> 1551 / 7984 MB
                  </li>
                </ul>
              </div>
            </section>

            <section className={`${styles.pane} ${styles.monPane}`}>
              <p className={styles.paneTitle}>top — processes</p>
              <table className={styles.monTable}>
                <thead>
                  <tr>
                    <th>PID</th>
                    <th>%CPU</th>
                    <th>%MEM</th>
                    <th>COMMAND</th>
                  </tr>
                </thead>
                <tbody>
                  {PROC_ROWS.map((row, i) => (
                    <tr key={row.pid} data-hot={hotPid === i ? '1' : '0'}>
                      <td>{row.pid}</td>
                      <td>{row.cpu}</td>
                      <td>{row.mem}</td>
                      <td>{row.cmd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles.paneTitle} style={{ marginTop: '0.75rem' }}>
                queue
              </p>
              <ul className={styles.queue}>
                {mission.commands.map((cmd, i) => (
                  <li
                    key={cmd}
                    data-done={i < index ? '1' : '0'}
                    data-current={i === index ? '1' : '0'}
                  >
                    {i < index ? '✓' : i === index ? '▸' : '·'} {cmd}
                  </li>
                ))}
              </ul>
            </section>

            <section className={`${styles.pane} ${styles.shellPane}`}>
              <p className={styles.paneTitle}>
                bash — [{index + 1}/{mission.commands.length}]
              </p>

              {status === 'playing' && (
                <>
                  <div className={styles.targetBlock}>
                    <div style={{ color: 'var(--term-dim)', fontSize: '0.7rem' }}>
                      # TARGET BUFFER
                    </div>
                    {current}
                  </div>
                  <p className={styles.ghost} aria-hidden>
                    <span className={styles.ok}>
                      {current.slice(0, matchPrefix)}
                    </span>
                    <span className={hasTypo ? styles.bad : styles.rest}>
                      {current.slice(matchPrefix)}
                    </span>
                  </p>
                  <div className={styles.promptLine}>
                    <span className={styles.host}>netrunner@bunker:~$</span>
                    <input
                      ref={inputRef}
                      className={styles.input}
                      value={input}
                      spellCheck={false}
                      autoComplete="off"
                      autoCapitalize="off"
                      onChange={(e) => {
                        setInput(e.target.value);
                        if (e.target.value.length > input.length) {
                          playCyberSound('key', { volume: 0.55 });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submit();
                      }}
                      aria-label="Comando do terminal"
                    />
                    <span className={styles.cursor} aria-hidden />
                  </div>
                </>
              )}

              {(status === 'won' || status === 'lost') && (
                <div className={styles.result}>
                  <pre>
                    {status === 'won'
                      ? `*** LINK SECURE ***\nmission complete — ${mission.id}`
                      : `*** CONNECTION LOST ***\nnetwatch / ice / typo`}
                  </pre>
                  <button type="button" onClick={() => start(mission)}>
                    retry
                  </button>
                  <button type="button" onClick={() => setStatus('menu')}>
                    menu
                  </button>
                </div>
              )}
            </section>

            <section className={`${styles.pane} ${styles.logPane}`}>
              <p className={styles.paneTitle}>
                irssi #nightcity — packet log
              </p>
              <div className={styles.logScroll}>
                {log.map((line, i) => (
                  <div
                    key={`${i}-${line.text}`}
                    className={
                      line.kind === 'err'
                        ? styles.err
                        : line.kind === 'ok'
                          ? styles.okLine
                          : undefined
                    }
                  >
                    {line.text}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalTypingGame;
