'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import {
  BreachProtocol,
  BreachState,
} from '../../components/vtt/BreachProtocol';
import { PuzzleCrashGame } from '../../components/minigames/PuzzleCrashGame';
import { TerminalTypingGame } from '../../components/minigames/TerminalTypingGame';
import { HotwireCircuitGame } from '../../components/minigames/HotwireCircuitGame';
import { PacketSnifferGame } from '../../components/minigames/PacketSnifferGame';
import { SignalTraceGame } from '../../components/minigames/SignalTraceGame';
import { CrowdDodgeGame } from '../../components/minigames/CrowdDodgeGame';
import { apiUrl, authHeaders } from '../../lib/api';
import styles from './breach.module.css';

type Challenge = {
  id: string;
  difficulty: string;
  name: string;
  blurb: string;
  size: number;
  bufferSize: number;
  sequenceCount: number;
  timeLimitSec: number;
  rewardHint: string;
};

type Difficulties = Record<string, string>;
type Mode =
  | 'protocol'
  | 'puzzle'
  | 'terminal'
  | 'hotwire'
  | 'sniffer'
  | 'trace'
  | 'dodge';

const DIFF_ORDER = ['treino', 'rua', 'corpo', 'arasaka', 'blackwall'];

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'protocol', label: 'Breach Protocol' },
  { id: 'puzzle', label: 'Puzzle Crash' },
  { id: 'terminal', label: 'Terminal Jack' },
  { id: 'hotwire', label: 'Hotwire Circuit' },
  { id: 'sniffer', label: 'Packet Sniffer' },
  { id: 'trace', label: 'Signal Trace' },
  { id: 'dodge', label: 'Crowd Dodge' },
];

const BreachPage = () => {
  const [mode, setMode] = useState<Mode>('protocol');
  const [difficulties, setDifficulties] = useState<Difficulties>({});
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [tab, setTab] = useState('treino');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [state, setState] = useState<BreachState | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/vtt/breach/challenges'), { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        setDifficulties(d.difficulties || {});
        const list = Array.isArray(d.challenges) ? d.challenges : [];
        setChallenges(list);
        if (list[0]) setSelectedId(list[0].id);
      })
      .catch(() => {
        setMsg('Não foi possível carregar os desafios. API offline?');
      });
  }, []);

  const tabs = useMemo(() => {
    const keys = Object.keys(difficulties);
    const ordered = DIFF_ORDER.filter((k) => keys.includes(k));
    const rest = keys.filter((k) => !DIFF_ORDER.includes(k));
    return [...ordered, ...rest];
  }, [difficulties]);

  const filtered = useMemo(
    () => challenges.filter((c) => c.difficulty === tab),
    [challenges, tab],
  );

  const selected = challenges.find((c) => c.id === selectedId) || null;

  const startChallenge = useCallback(async (challengeId: string) => {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(apiUrl('/api/vtt/breach'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ challengeId }),
      });
      if (!res.ok) throw new Error('Falha ao iniciar breach');
      const next = await res.json();
      setState(next);
      setSelectedId(challengeId);
    } catch (e: any) {
      setMsg(e.message || 'Erro ao jackar o protocolo');
    } finally {
      setBusy(false);
    }
  }, []);

  const pick = async (x: number, y: number) => {
    if (!state || state.status !== 'active' || busy) return;
    setBusy(true);
    try {
      const res = await fetch(apiUrl(`/api/vtt/breach/${state.id}/pick`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ state, x, y }),
      });
      if (!res.ok) throw new Error('Pick rejeitado');
      setState(await res.json());
    } catch (e: any) {
      setMsg(e.message || 'Falha na transmissão');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageFrame>
      <div className={styles.page}>
        <HudPanel title="Netrunning · Minigames">
          <p className={styles.intro}>
            Kit de jack: hex protocol, puzzle de cores, terminal CRT, hotwire
            físico, sniffer de pacotes, trace de sinal e fuga na rua. O Narrador
            pode tratar vitória/fracasso como acesso, loot ou ICE.
          </p>

          <div className={styles.tabs} role="tablist" aria-label="Minigame">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                className={styles.tab}
                data-active={mode === m.id}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'protocol' && (
            <>
              <div
                className={styles.tabs}
                role="tablist"
                aria-label="Dificuldade"
              >
                {tabs.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    className={styles.tab}
                    data-active={tab === key}
                    onClick={() => setTab(key)}
                  >
                    {difficulties[key] || key}
                  </button>
                ))}
              </div>

              <div className={styles.layout}>
                <div className={styles.list}>
                  {filtered.length === 0 && (
                    <p className={styles.empty}>Nenhum desafio nesta faixa.</p>
                  )}
                  {filtered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={styles.card}
                      data-active={selectedId === c.id}
                      disabled={busy}
                      onClick={() => {
                        setSelectedId(c.id);
                        startChallenge(c.id);
                      }}
                    >
                      <strong>{c.name}</strong>
                      <span className={styles.meta}>
                        Grade {c.size}×{c.size} · buffer {c.bufferSize} ·{' '}
                        {c.sequenceCount} daemon
                        {c.sequenceCount > 1 ? 's' : ''}
                        {c.timeLimitSec
                          ? ` · ${c.timeLimitSec}s`
                          : ' · sem timer'}
                      </span>
                      <p className={styles.blurb}>{c.blurb}</p>
                      <p className={styles.reward}>{c.rewardHint}</p>
                    </button>
                  ))}
                </div>

                <aside className={styles.play}>
                  {state ? (
                    <BreachProtocol
                      state={state}
                      onPick={pick}
                      onRetry={() =>
                        selectedId ? startChallenge(selectedId) : undefined
                      }
                      onClose={() => setState(null)}
                    />
                  ) : (
                    <div className={styles.empty}>
                      <p>
                        {selected
                          ? `Clique de novo em “${selected.name}” ou inicie abaixo.`
                          : 'Escolha um desafio à esquerda.'}
                      </p>
                      {selected && (
                        <button
                          type="button"
                          className={styles.tab}
                          data-active="true"
                          disabled={busy}
                          style={{ marginTop: '0.75rem' }}
                          onClick={() => startChallenge(selected.id)}
                        >
                          Iniciar breach
                        </button>
                      )}
                    </div>
                  )}
                  {msg && <p className={styles.statusMsg}>{msg}</p>}
                </aside>
              </div>
            </>
          )}

          {mode === 'puzzle' && <PuzzleCrashGame />}
          {mode === 'terminal' && <TerminalTypingGame />}
          {mode === 'hotwire' && <HotwireCircuitGame />}
          {mode === 'sniffer' && <PacketSnifferGame />}
          {mode === 'trace' && <SignalTraceGame />}
          {mode === 'dodge' && <CrowdDodgeGame />}
        </HudPanel>
      </div>
    </PageFrame>
  );
};

export default BreachPage;
