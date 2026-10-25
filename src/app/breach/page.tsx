'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { ElectronicLockGame } from '../../components/minigames/ElectronicLockGame';
import { RipperSurgeryGame } from '../../components/minigames/RipperSurgeryGame';
import { ImplantCalibrationGame } from '../../components/minigames/ImplantCalibrationGame';
import { CyberpsychosisSurgeGame } from '../../components/minigames/CyberpsychosisSurgeGame';
import { BarGambleGame } from '../../components/minigames/BarGambleGame';
import { RockerboyShowGame } from '../../components/minigames/RockerboyShowGame';
import { BraindanceEditGame } from '../../components/minigames/BraindanceEditGame';
import { PasswordMastermindGame } from '../../components/minigames/PasswordMastermindGame';
import { CyberdeckMemoryGame } from '../../components/minigames/CyberdeckMemoryGame';
import { apiUrl, authHeaders } from '../../lib/api';
import { useCampaign } from '../../lib/campaign';
import { reportMinigameResult } from '../../lib/minigameResult';
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
  | 'dodge'
  | 'lock'
  | 'surgery'
  | 'calibrate'
  | 'psycho'
  | 'bar'
  | 'rocker'
  | 'media'
  | 'mastermind'
  | 'deckram';

type GroupId = 'netrun' | 'chrome' | 'role' | 'street';

const DIFF_ORDER = ['treino', 'rua', 'corpo', 'arasaka', 'blackwall'];

const GROUPS: Array<{
  id: GroupId;
  label: string;
  modes: Array<{ id: Mode; label: string }>;
}> = [
  {
    id: 'netrun',
    label: 'Netrun',
    modes: [
      { id: 'protocol', label: 'Breach Protocol' },
      { id: 'puzzle', label: 'Puzzle Crash' },
      { id: 'terminal', label: 'Terminal Jack' },
      { id: 'sniffer', label: 'Packet Sniffer' },
      { id: 'trace', label: 'Signal Trace' },
      { id: 'mastermind', label: 'Mastermind' },
      { id: 'deckram', label: 'Deck RAM' },
    ],
  },
  {
    id: 'chrome',
    label: 'Chrome / ICE',
    modes: [
      { id: 'lock', label: 'Arrombamento' },
      { id: 'hotwire', label: 'Hotwire' },
      { id: 'surgery', label: 'Cirurgia' },
      { id: 'calibrate', label: 'Calibragem' },
      { id: 'psycho', label: 'Cyberpsicose' },
    ],
  },
  {
    id: 'role',
    label: 'Role',
    modes: [
      { id: 'rocker', label: 'Rockerboy Show' },
      { id: 'media', label: 'Braindance Media' },
    ],
  },
  {
    id: 'street',
    label: 'Rua / Bar',
    modes: [
      { id: 'dodge', label: 'Crowd Dodge' },
      { id: 'bar', label: 'Dados do Bar' },
    ],
  },
];

const BreachPage = () => {
  const { campaignId, refresh } = useCampaign();
  const [group, setGroup] = useState<GroupId>('netrun');
  const [mode, setMode] = useState<Mode>('protocol');
  const [difficulties, setDifficulties] = useState<Difficulties>({});
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [tab, setTab] = useState('treino');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [state, setState] = useState<BreachState | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const reportedBreach = useRef<string | null>(null);

  const activeGroup = GROUPS.find((g) => g.id === group) || GROUPS[0];

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

  useEffect(() => {
    if (!state || state.status === 'active') return;
    const key = `${state.id}:${state.status}`;
    if (reportedBreach.current === key) return;
    reportedBreach.current = key;
    const outcome =
      state.status === 'success' || state.status === 'partial' ? 'won' : 'lost';
    reportMinigameResult(campaignId, 'breach', outcome, {
      difficulty: state.difficulty,
      challengeName: state.challengeName,
      rewardHint: state.rewardHint,
      status: state.status,
    }).then(() => refresh());
  }, [state, campaignId, refresh]);

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

  const selectGroup = (id: GroupId) => {
    setGroup(id);
    const g = GROUPS.find((x) => x.id === id);
    if (g?.modes[0]) setMode(g.modes[0].id);
  };

  return (
    <PageFrame>
      <div className={styles.page}>
        <HudPanel title="Netrunning · Minigames">
          <p className={styles.intro}>
            Kit completo: netrun, arrombamento, chrome/humanidade, roles
            (Rockerboy / Media) e mesa de bar. Vitória/fracasso viram acesso,
            reputação, Humanidade ou eddies na mesa.
          </p>

          <div className={styles.tabs} role="tablist" aria-label="Categoria">
            {GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={group === g.id}
                className={styles.tab}
                data-active={group === g.id}
                onClick={() => selectGroup(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Minigame">
            {activeGroup.modes.map((m) => (
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
          {mode === 'lock' && <ElectronicLockGame />}
          {mode === 'surgery' && <RipperSurgeryGame />}
          {mode === 'calibrate' && <ImplantCalibrationGame />}
          {mode === 'psycho' && <CyberpsychosisSurgeGame />}
          {mode === 'bar' && <BarGambleGame />}
          {mode === 'rocker' && <RockerboyShowGame />}
          {mode === 'media' && <BraindanceEditGame />}
          {mode === 'mastermind' && <PasswordMastermindGame />}
          {mode === 'deckram' && <CyberdeckMemoryGame />}
        </HudPanel>
      </div>
    </PageFrame>
  );
};

export default BreachPage;
