'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { PhoneShell, Handout } from '../../components/vtt/PhoneShell';
import { BreachProtocol, BreachState } from '../../components/vtt/BreachProtocol';
import { API_BASE_URL } from '../../lib/api';
import styles from './table.module.css';

type Token = {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  hidden?: boolean;
  bars?: { hp: number; hpMax: number };
  ownerPlayerId?: number;
};

type VttState = {
  version: number;
  map: { width: number; height: number; gridSize: number; name: string };
  tokens: Token[];
  walls: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>;
  fog: Array<{ x: number; y: number; revealed: boolean }>;
  initiative: Array<{ tokenId: string; score: number; name: string }>;
  turnIndex: number;
  presence: Array<{ playerId: number; name: string; role: string }>;
  chat: Array<{ id: string; name: string; text: string; kind?: string }>;
  handouts: Handout[];
  breach?: BreachState | null;
  radioStation?: string | null;
};

const SESSION = 'default';
const GRID = 28;

const TablePage = () => {
  const [state, setState] = useState<VttState | null>(null);
  const [role, setRole] = useState<'gm' | 'player'>('player');
  const [chatText, setChatText] = useState('');
  const [pool, setPool] = useState(5);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [ruler, setRuler] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [replay, setReplay] = useState<any[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const intent = useCallback((type: string, payload?: any) => {
    socketRef.current?.emit('vtt:intent', {
      sessionId: SESSION,
      type,
      baseVersion: state?.version,
      payload,
    });
  }, [state?.version]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const socket = io(`${API_BASE_URL}/vtt`, {
      auth: { token },
      query: {
        name: role === 'gm' ? 'Narrador' : 'V',
        role,
        playerId: role === 'gm' ? 2 : 1,
      },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('vtt:join', { sessionId: SESSION, campaignId: 1, asGm: role === 'gm' });
    });
    socket.on('vtt:state', (s: VttState) => setState(s));
    socket.on('vtt:handout', () => setPhoneOpen(true));
    socket.on('vtt:breach', (b: BreachState) =>
      setState((prev) => (prev ? { ...prev, breach: b } : prev)),
    );
    return () => {
      socket.disconnect();
    };
  }, [role]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(2.5, Math.max(0.5, z - e.deltaY * 0.001)));
  };

  const cellFromEvent = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / (GRID * zoom);
    const y = (e.clientY - rect.top - pan.y) / (GRID * zoom);
    return { x: Math.floor(x), y: Math.floor(y) };
  };

  const distance = useMemo(() => {
    if (!ruler) return 0;
    const dx = Math.abs(ruler.x2 - ruler.x1);
    const dy = Math.abs(ruler.y2 - ruler.y1);
    // 1-2-1-2 diagonal
    const diag = Math.min(dx, dy);
    const straight = Math.abs(dx - dy);
    let cost = straight;
    for (let i = 0; i < diag; i++) cost += i % 2 === 0 ? 1 : 2;
    return cost;
  }, [ruler]);

  const loadReplay = () => {
    socketRef.current?.emit('vtt:replay', { campaignId: 1 }, (res: any) => {
      setReplay(res?.events || []);
    });
  };

  return (
    <PageFrame>
      <div className={styles.layout}>
        <HudPanel title={`Mesa — ${state?.map?.name || 'carregando…'}`} className={styles.stage}>
          <div className={styles.toolbar}>
            <HudButton
              variant={role === 'gm' ? 'primary' : 'ghost'}
              onClick={() => setRole('gm')}
            >
              GM
            </HudButton>
            <HudButton
              variant={role === 'player' ? 'primary' : 'ghost'}
              onClick={() => setRole('player')}
            >
              Player
            </HudButton>
            {role === 'gm' && (
              <>
                <HudButton
                  onClick={() =>
                    intent('token:add', {
                      name: 'Runner',
                      x: 5,
                      y: 5,
                      ownerPlayerId: 1,
                      color: '#FCEE0A',
                    })
                  }
                >
                  + Token
                </HudButton>
                <HudButton
                  variant="ghost"
                  onClick={() =>
                    intent('token:add', {
                      name: 'ICE',
                      x: 12,
                      y: 8,
                      hidden: true,
                      color: '#FF2A6D',
                    })
                  }
                >
                  + Hidden
                </HudButton>
                <HudButton variant="ghost" onClick={() => intent('breach:start', {})}>
                  Breach
                </HudButton>
                <HudButton
                  variant="ghost"
                  onClick={() =>
                    intent('handout:push', {
                      channel: 'sms',
                      from: 'Rogue',
                      title: 'SMS',
                      body: 'O pacote mudou de mãos. Watson. Não atrase.',
                      toPlayerId: 1,
                    })
                  }
                >
                  Enviar SMS
                </HudButton>
                <HudButton
                  variant="ghost"
                  onClick={() =>
                    intent('fog:reveal', {
                      cells: [
                        { x: 5, y: 5 },
                        { x: 6, y: 5 },
                        { x: 5, y: 6 },
                      ],
                    })
                  }
                >
                  Revelar fog
                </HudButton>
                <HudButton
                  variant="ghost"
                  onClick={() =>
                    intent('initiative:set', {
                      order: (state?.tokens || []).map((t, i) => ({
                        tokenId: t.id,
                        name: t.name,
                        score: 10 - i,
                      })),
                    })
                  }
                >
                  Iniciativa
                </HudButton>
                <HudButton variant="ghost" onClick={() => intent('initiative:next')}>
                  Próximo turno
                </HudButton>
                <HudButton
                  variant="ghost"
                  onClick={() => intent('radio:set', { station: 'watson-fm' })}
                >
                  Rádio
                </HudButton>
              </>
            )}
            <HudButton variant="ghost" onClick={() => setPhoneOpen(true)}>
              Celular
              {(state?.handouts?.length || 0) > 0 ? ` (${state?.handouts.length})` : ''}
            </HudButton>
            <HudButton variant="ghost" onClick={loadReplay}>
              Braindance
            </HudButton>
          </div>

          <div className={styles.canvasWrap} onWheel={onWheel}>
            <svg
              ref={svgRef}
              className={styles.canvas}
              width={800}
              height={520}
              onMouseDown={(e) => {
                if (e.shiftKey) {
                  const c = cellFromEvent(e);
                  setRuler({ x1: c.x, y1: c.y, x2: c.x, y2: c.y });
                }
              }}
              onMouseMove={(e) => {
                if (ruler && e.buttons === 1) {
                  const c = cellFromEvent(e);
                  setRuler({ ...ruler, x2: c.x, y2: c.y });
                }
                if (dragging && e.buttons === 1) {
                  const c = cellFromEvent(e);
                  intent('token:move', { tokenId: dragging, x: c.x, y: c.y });
                }
              }}
              onMouseUp={() => setDragging(null)}
            >
              <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                {Array.from({ length: state?.map?.height || 20 }).map((_, y) =>
                  Array.from({ length: state?.map?.width || 30 }).map((__, x) => (
                    <rect
                      key={`${x}-${y}`}
                      x={x * GRID}
                      y={y * GRID}
                      width={GRID}
                      height={GRID}
                      className={styles.cell}
                    />
                  )),
                )}
                {(state?.fog || [])
                  .filter((f) => f.revealed)
                  .map((f) => (
                    <rect
                      key={`fog-${f.x}-${f.y}`}
                      x={f.x * GRID}
                      y={f.y * GRID}
                      width={GRID}
                      height={GRID}
                      className={styles.fog}
                    />
                  ))}
                {(state?.walls || []).map((w) => (
                  <line
                    key={w.id}
                    x1={w.x1 * GRID}
                    y1={w.y1 * GRID}
                    x2={w.x2 * GRID}
                    y2={w.y2 * GRID}
                    className={styles.wall}
                  />
                ))}
                {(state?.tokens || []).map((t) => (
                  <g
                    key={t.id}
                    transform={`translate(${t.x * GRID},${t.y * GRID})`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDragging(t.id);
                    }}
                    style={{ cursor: 'grab' }}
                  >
                    <circle
                      cx={GRID / 2}
                      cy={GRID / 2}
                      r={GRID / 2 - 2}
                      fill={t.color}
                      opacity={t.hidden ? 0.5 : 1}
                    />
                    <text x={4} y={GRID - 4} className={styles.tokenLabel}>
                      {t.name.slice(0, 6)}
                    </text>
                    {t.bars && (
                      <rect
                        x={2}
                        y={2}
                        width={(GRID - 4) * (t.bars.hp / Math.max(1, t.bars.hpMax))}
                        height={3}
                        fill="#ff2a6d"
                      />
                    )}
                  </g>
                ))}
                {ruler && (
                  <line
                    x1={ruler.x1 * GRID + GRID / 2}
                    y1={ruler.y1 * GRID + GRID / 2}
                    x2={ruler.x2 * GRID + GRID / 2}
                    y2={ruler.y2 * GRID + GRID / 2}
                    className={styles.ruler}
                  />
                )}
              </g>
            </svg>
            <div className={styles.hudOverlay}>
              zoom {zoom.toFixed(2)} · pan shift+drag régua · {distance}u
              {state?.radioStation ? ` · 📻 ${state.radioStation}` : ''}
            </div>
          </div>
        </HudPanel>

        <aside className={styles.side}>
          <HudPanel title="Presença">
            <ul>
              {(state?.presence || []).map((p, i) => (
                <li key={`${p.playerId}-${i}`}>
                  {p.name} ({p.role})
                </li>
              ))}
            </ul>
          </HudPanel>
          <HudPanel title="Iniciativa">
            <ol>
              {(state?.initiative || []).map((ini, i) => (
                <li key={ini.tokenId} style={{ color: i === state?.turnIndex ? 'var(--cp-yellow)' : undefined }}>
                  {ini.name} ({ini.score})
                </li>
              ))}
            </ol>
          </HudPanel>
          <HudPanel title="Chat / Dice">
            <div className={styles.chat}>
              {(state?.chat || []).slice(-30).map((m) => (
                <p key={m.id} data-kind={m.kind}>
                  <strong>{m.name}:</strong> {m.text}
                </p>
              ))}
            </div>
            <div className={styles.chatRow}>
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Mensagem"
              />
              <HudButton
                onClick={() => {
                  intent('chat:message', { text: chatText });
                  setChatText('');
                }}
              >
                Enviar
              </HudButton>
            </div>
            <div className={styles.chatRow}>
              <input
                type="number"
                value={pool}
                min={1}
                max={20}
                onChange={(e) => setPool(Number(e.target.value))}
                aria-label="Pool"
              />
              <HudButton onClick={() => intent('dice:roll', { pool, difficulty: 6, label: 'Teste' })}>
                Rolar
              </HudButton>
            </div>
          </HudPanel>
          {phoneOpen && (
            <PhoneShell
              handouts={state?.handouts || []}
              onClose={() => setPhoneOpen(false)}
            />
          )}
          {state?.breach && (
            <BreachProtocol
              state={state.breach}
              onPick={(x, y) => intent('breach:pick', { x, y })}
              onClose={() => setState((s) => (s ? { ...s, breach: null } : s))}
            />
          )}
          {replay.length > 0 && (
            <HudPanel title="Braindance replay">
              <ul className={styles.replay}>
                {replay.slice(-40).map((e) => (
                  <li key={e.id}>
                    {e.at?.slice(11, 19)} — {e.type}
                  </li>
                ))}
              </ul>
            </HudPanel>
          )}
        </aside>
      </div>
    </PageFrame>
  );
};

export default TablePage;
