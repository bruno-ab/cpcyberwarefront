'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { PhoneShell, Handout } from '../../components/vtt/PhoneShell';
import { BreachProtocol, BreachState } from '../../components/vtt/BreachProtocol';
import {
  DiceGlitchOverlay,
  type DiceReveal,
} from '../../components/vtt/DiceGlitchOverlay';
import { API_BASE_URL, apiUrl, authHeaders } from '../../lib/api';
import { useCampaign } from '../../lib/campaign';
import {
  ATTR_OPTIONS,
  SKILL_OPTIONS,
  computeSheetPool,
  formatStatOption,
} from '../../lib/sheetPool';
import { playCyberSound } from '../../lib/sound/cyberSounds';
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
  characterId?: number;
};

type ChatMsg = {
  id: string;
  name: string;
  text: string;
  kind?: string;
  at?: string;
};

type VttState = {
  version: number;
  campaignId?: number;
  map: {
    width: number;
    height: number;
    gridSize: number;
    name: string;
    backgroundUrl?: string | null;
  };
  tokens: Token[];
  walls: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>;
  fog: Array<{ x: number; y: number; revealed: boolean }>;
  initiative: Array<{ tokenId: string; score: number; name: string }>;
  turnIndex: number;
  presence: Array<{ playerId: number; name: string; role: string }>;
  chat: ChatMsg[];
  handouts: Handout[];
  breach?: BreachState | null;
  radioStation?: string | null;
};

type RosterChar = {
  id: string;
  name: string;
  role?: string;
  playerId?: number;
  vitality?: number;
  vitalityMax?: number;
  sheetSummary?: Record<string, any>;
};

type ToolMode = 'select' | 'fog' | 'wall' | 'pan';

const GRID = 28;
const CHAT_MAX = 500;
const TOKEN_COLORS = [
  '#FCEE0A',
  '#02d7f2',
  '#ff2a6d',
  '#7CFF6B',
  '#c77dff',
  '#ff9f1c',
];

const parseJwt = (token: string) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

const TablePage = () => {
  const { campaignId, campaign } = useCampaign();
  const sessionId = `campaign-${campaignId}`;

  const [state, setState] = useState<VttState | null>(null);
  const [myRole, setMyRole] = useState<'gm' | 'player'>('player');
  const [myPlayerId, setMyPlayerId] = useState(0);
  const [myName, setMyName] = useState('Runner');
  const [chatText, setChatText] = useState('');
  const [pool, setPool] = useState(5);
  const [difficulty, setDifficulty] = useState(6);
  const [attrKey, setAttrKey] = useState<string>('dexterity');
  const [skillKey, setSkillKey] = useState<string>('firearms');
  const [roster, setRoster] = useState<RosterChar[]>([]);
  const [selectedCharId, setSelectedCharId] = useState('');
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [ruler, setRuler] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const [replay, setReplay] = useState<any[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolMode>('select');
  const [panning, setPanning] = useState(false);
  const [wallDraft, setWallDraft] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [gmTab, setGmTab] = useState<'tokens' | 'map' | 'scene'>('tokens');
  const [handoutBody, setHandoutBody] = useState('');
  const [handoutFrom, setHandoutFrom] = useState('Rogue');
  const [diceOverlay, setDiceOverlay] = useState<{
    active: boolean;
    reveal: DiceReveal | null;
  }>({ active: false, reveal: null });

  const socketRef = useRef<Socket | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chatLogRef = useRef<HTMLDivElement | null>(null);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null,
  );

  const isGm = myRole === 'gm';
  const selectedChar = useMemo(
    () => roster.find((c) => c.id === selectedCharId) || null,
    [roster, selectedCharId],
  );

  const sheetPool = useMemo(() => {
    if (!selectedChar?.sheetSummary) return pool;
    return Math.max(
      1,
      computeSheetPool(selectedChar.sheetSummary, attrKey, skillKey),
    );
  }, [selectedChar, attrKey, skillKey, pool]);

  const intent = useCallback(
    (type: string, payload?: any) => {
      socketRef.current?.emit('vtt:intent', {
        sessionId,
        type,
        baseVersion: state?.version,
        payload,
      });
    },
    [sessionId, state?.version],
  );

  const scrollChat = useCallback(() => {
    const el = chatLogRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollChat();
  }, [state?.chat, scrollChat]);

  useEffect(() => {
    const me = state?.presence?.find(
      (p) => Number(p.playerId) === Number(myPlayerId),
    );
    if (me?.role === 'gm' || me?.role === 'player') {
      setMyRole(me.role);
    }
  }, [state?.presence, myPlayerId]);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token') || ''
        : '';
    const payload = token ? parseJwt(token) : null;
    const playerId = Number(payload?.id || payload?.sub || 0) || 0;
    const name = String(
      payload?.name || payload?.username || 'Runner',
    ).slice(0, 48);
    setMyPlayerId(playerId);
    setMyName(name);

    const socket = io(`${API_BASE_URL}/vtt`, {
      auth: { token },
      query: { name, playerId: String(playerId) },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit(
        'vtt:join',
        { sessionId, campaignId, name },
        (ack: { role?: string } | undefined) => {
          if (ack?.role === 'gm' || ack?.role === 'player') {
            setMyRole(ack.role);
          }
        },
      );
    });
    socket.on('vtt:state', (s: VttState) => setState(s));
    socket.on('vtt:handout', () => setPhoneOpen(true));
    socket.on('vtt:breach', (b: BreachState) =>
      setState((prev) => (prev ? { ...prev, breach: b } : prev)),
    );
    socket.on('vtt:dice', (result: DiceReveal & { rollerName?: string }) => {
      playCyberSound('glitch', { volume: 0.55 });
      setDiceOverlay({
        active: true,
        reveal: {
          id: result.id,
          pool: result.pool,
          difficulty: result.difficulty,
          dice: result.dice,
          successes: result.successes,
          ones: result.ones,
          botch: result.botch,
          label: result.label,
          rollerName: result.rollerName,
        },
      });
      window.setTimeout(() => {
        playCyberSound(result.botch ? 'deny' : 'confirm', { volume: 0.6 });
      }, 1000);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, campaignId]);

  useEffect(() => {
    fetch(apiUrl(`/api/campaigns/${campaignId}/roster`), {
      headers: authHeaders(),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list: RosterChar[] = Array.isArray(data?.characters)
          ? data.characters
          : [];
        setRoster(list);
        if (list[0] && !selectedCharId) setSelectedCharId(list[0].id);
      })
      .catch(() => setRoster([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

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
    const diag = Math.min(dx, dy);
    const straight = Math.abs(dx - dy);
    let cost = straight;
    for (let i = 0; i < diag; i++) cost += i % 2 === 0 ? 1 : 2;
    return cost;
  }, [ruler]);

  const sendChat = () => {
    const text = chatText.trim();
    if (!text) return;
    intent('chat:message', { text });
    setChatText('');
    playCyberSound('ui', { volume: 0.3 });
  };

  const rollDice = (opts?: {
    attr?: string;
    skill?: string;
    label?: string;
  }) => {
    const a = opts?.attr || attrKey;
    const s = opts?.skill || skillKey;
    const useSheet = Boolean(selectedChar?.sheetSummary);
    const rollPool = useSheet
      ? Math.max(
          1,
          computeSheetPool(selectedChar!.sheetSummary, a, s),
        )
      : Math.max(1, pool);
    if (opts?.attr) setAttrKey(opts.attr);
    if (opts?.skill) setSkillKey(opts.skill);
    const label =
      opts?.label ||
      (useSheet
        ? `${formatStatOption(a)}+${formatStatOption(s)}`
        : 'Teste');
    intent('dice:roll', {
      pool: rollPool,
      difficulty,
      label,
      characterId: selectedChar ? Number(selectedChar.id) : undefined,
    });
  };

  const spawnRoster = () => {
    intent('token:spawn-roster', {
      characters: roster.map((c, i) => ({
        id: c.id,
        name: c.name,
        playerId: c.playerId,
        color: TOKEN_COLORS[i % TOKEN_COLORS.length],
        bars: {
          hp: Number(c.vitality) || 7,
          hpMax: Number(c.vitalityMax) || 7,
        },
      })),
    });
    playCyberSound('confirm', { volume: 0.4 });
  };

  const canDragToken = (t: Token) => {
    if (isGm) return true;
    return Number(t.ownerPlayerId) === Number(myPlayerId);
  };

  const fogRevealed = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const f of state?.fog || []) {
      map.set(`${f.x},${f.y}`, !!f.revealed);
    }
    return map;
  }, [state?.fog]);

  const fogActive = (state?.fog?.length || 0) > 0;

  const loadReplay = () => {
    socketRef.current?.emit(
      'vtt:replay',
      { campaignId },
      (res: { events?: any[] }) => {
        setReplay(res?.events || []);
      },
    );
  };

  const mapW = state?.map?.width || 30;
  const mapH = state?.map?.height || 20;

  return (
    <PageFrame>
      <div className={styles.layout}>
        <HudPanel
          title={`Mesa — ${state?.map?.name || '…'} · ${campaign?.name || `Campanha ${campaignId}`}`}
          className={styles.stage}
        >
          <div className={styles.toolbar}>
            <span className={styles.roleBadge} data-role={myRole}>
              {isGm ? 'GM' : 'Player'} · {myName}
            </span>
            {isGm && (
              <div className={styles.gmTabs}>
                {(['tokens', 'map', 'scene'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={styles.gmTab}
                    data-active={gmTab === tab ? '1' : '0'}
                    onClick={() => setGmTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
            {isGm && gmTab === 'tokens' && (
              <>
                <HudButton onClick={spawnRoster}>Spawn roster</HudButton>
                <HudButton
                  variant="ghost"
                  onClick={() =>
                    intent('token:add', {
                      name: 'NPC',
                      x: 8,
                      y: 8,
                      color: '#ff2a6d',
                    })
                  }
                >
                  + NPC
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
              </>
            )}
            {isGm && gmTab === 'map' && (
              <>
                <HudButton
                  variant={tool === 'fog' ? 'primary' : 'ghost'}
                  onClick={() => setTool(tool === 'fog' ? 'select' : 'fog')}
                >
                  Fog brush
                </HudButton>
                <HudButton
                  variant="ghost"
                  onClick={() => intent('fog:blank', {})}
                >
                  Fog fill
                </HudButton>
                <HudButton
                  variant={tool === 'wall' ? 'primary' : 'ghost'}
                  onClick={() => setTool(tool === 'wall' ? 'select' : 'wall')}
                >
                  Wall
                </HudButton>
                <HudButton
                  variant={tool === 'pan' ? 'primary' : 'ghost'}
                  onClick={() => setTool(tool === 'pan' ? 'select' : 'pan')}
                >
                  Pan
                </HudButton>
              </>
            )}
            {isGm && gmTab === 'scene' && (
              <>
                <HudButton
                  variant="ghost"
                  onClick={() => intent('breach:start', {})}
                >
                  Breach
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
                <HudButton
                  variant="ghost"
                  onClick={() => intent('initiative:next')}
                >
                  Próximo turno
                </HudButton>
                <HudButton
                  variant="ghost"
                  onClick={() =>
                    intent('radio:set', { station: 'watson-fm' })
                  }
                >
                  Rádio
                </HudButton>
              </>
            )}
            <HudButton variant="ghost" onClick={() => setPhoneOpen(true)}>
              Celular
              {(state?.handouts?.length || 0) > 0
                ? ` (${state?.handouts.length})`
                : ''}
            </HudButton>
            <HudButton variant="ghost" onClick={loadReplay}>
              Braindance
            </HudButton>
          </div>

          {isGm && gmTab === 'scene' && (
            <div className={styles.handoutRow}>
              <input
                value={handoutFrom}
                onChange={(e) => setHandoutFrom(e.target.value)}
                placeholder="De"
                aria-label="Remetente"
              />
              <input
                value={handoutBody}
                onChange={(e) => setHandoutBody(e.target.value)}
                placeholder="Texto do SMS…"
                aria-label="Corpo do handout"
              />
              <HudButton
                onClick={() => {
                  const body = handoutBody.trim();
                  if (!body) return;
                  intent('handout:push', {
                    channel: 'sms',
                    from: handoutFrom || 'Fixer',
                    title: 'SMS',
                    body,
                    toPlayerId: myPlayerId || 1,
                  });
                  setHandoutBody('');
                }}
              >
                Push SMS
              </HudButton>
            </div>
          )}

          <div className={styles.canvasWrap} onWheel={onWheel}>
            <DiceGlitchOverlay
              active={diceOverlay.active}
              reveal={diceOverlay.reveal}
              onDone={() =>
                setDiceOverlay({ active: false, reveal: null })
              }
            />
            <svg
              ref={svgRef}
              className={styles.canvas}
              width={Math.min(900, mapW * GRID)}
              height={Math.min(560, mapH * GRID)}
              onMouseDown={(e) => {
                if (e.shiftKey) {
                  const c = cellFromEvent(e);
                  setRuler({ x1: c.x, y1: c.y, x2: c.x, y2: c.y });
                  return;
                }
                if (tool === 'pan' || e.button === 1) {
                  setPanning(true);
                  panStart.current = {
                    x: e.clientX,
                    y: e.clientY,
                    panX: pan.x,
                    panY: pan.y,
                  };
                  return;
                }
                if (isGm && tool === 'fog') {
                  const c = cellFromEvent(e);
                  intent('fog:reveal', { cells: [c] });
                  return;
                }
                if (isGm && tool === 'wall') {
                  const c = cellFromEvent(e);
                  if (!wallDraft) setWallDraft(c);
                  else {
                    intent('wall:add', {
                      x1: wallDraft.x,
                      y1: wallDraft.y,
                      x2: c.x,
                      y2: c.y,
                    });
                    setWallDraft(null);
                  }
                }
              }}
              onMouseMove={(e) => {
                if (panning && panStart.current) {
                  setPan({
                    x:
                      panStart.current.panX +
                      (e.clientX - panStart.current.x),
                    y:
                      panStart.current.panY +
                      (e.clientY - panStart.current.y),
                  });
                  return;
                }
                if (ruler && e.buttons === 1) {
                  const c = cellFromEvent(e);
                  setRuler({ ...ruler, x2: c.x, y2: c.y });
                }
                if (isGm && tool === 'fog' && e.buttons === 1) {
                  const c = cellFromEvent(e);
                  intent('fog:reveal', { cells: [c] });
                }
                if (dragging && e.buttons === 1) {
                  const c = cellFromEvent(e);
                  intent('token:move', {
                    tokenId: dragging,
                    x: c.x,
                    y: c.y,
                  });
                }
              }}
              onMouseUp={() => {
                setDragging(null);
                setPanning(false);
                panStart.current = null;
              }}
              onMouseLeave={() => {
                setPanning(false);
                panStart.current = null;
              }}
            >
              <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                {Array.from({ length: mapH }).map((_, y) =>
                  Array.from({ length: mapW }).map((__, x) => (
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
                {fogActive &&
                  Array.from({ length: mapH }).map((_, y) =>
                    Array.from({ length: mapW }).map((__, x) => {
                      const revealed = fogRevealed.get(`${x},${y}`);
                      if (revealed) return null;
                      return (
                        <rect
                          key={`fog-${x}-${y}`}
                          x={x * GRID}
                          y={y * GRID}
                          width={GRID}
                          height={GRID}
                          className={styles.fogDark}
                        />
                      );
                    }),
                  )}
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
                {(state?.tokens || []).map((t) => {
                  const turn =
                    state?.initiative?.[state.turnIndex || 0]?.tokenId ===
                    t.id;
                  return (
                    <g
                      key={t.id}
                      transform={`translate(${t.x * GRID},${t.y * GRID})`}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        if (!canDragToken(t)) return;
                        setDragging(t.id);
                      }}
                      style={{
                        cursor: canDragToken(t) ? 'grab' : 'default',
                      }}
                    >
                      <circle
                        cx={GRID / 2}
                        cy={GRID / 2}
                        r={GRID / 2 - 2}
                        fill={t.color}
                        opacity={t.hidden ? 0.45 : 1}
                        className={turn ? styles.tokenTurn : undefined}
                      />
                      <text x={4} y={GRID - 4} className={styles.tokenLabel}>
                        {t.name.slice(0, 6)}
                      </text>
                      {t.bars && (
                        <rect
                          x={2}
                          y={2}
                          width={
                            (GRID - 4) *
                            (t.bars.hp / Math.max(1, t.bars.hpMax))
                          }
                          height={3}
                          fill="#ff2a6d"
                        />
                      )}
                    </g>
                  );
                })}
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
              zoom {zoom.toFixed(2)} · shift+drag régua · {distance}u
              {tool !== 'select' ? ` · tool:${tool}` : ''}
              {state?.radioStation ? ` · ${state.radioStation}` : ''}
            </div>
          </div>
        </HudPanel>

        <aside className={styles.side}>
          <HudPanel title="Presença">
            <ul className={styles.plainList}>
              {(state?.presence || []).map((p, i) => (
                <li key={`${p.playerId}-${i}`}>
                  {p.name} ({p.role})
                </li>
              ))}
            </ul>
          </HudPanel>
          <HudPanel title="Iniciativa">
            <ol className={styles.plainList}>
              {(state?.initiative || []).map((ini, i) => (
                <li
                  key={ini.tokenId}
                  style={{
                    color:
                      i === state?.turnIndex
                        ? 'var(--cp-yellow)'
                        : undefined,
                  }}
                >
                  {ini.name} ({ini.score})
                </li>
              ))}
            </ol>
          </HudPanel>

          <HudPanel title="Chat / Dice" className={styles.chatPanel}>
            <div className={styles.chatStack}>
              <div className={styles.chat} ref={chatLogRef}>
                {(state?.chat || []).length === 0 ? (
                  <p className={styles.chatEmpty}>Sem tráfego ainda.</p>
                ) : (
                  (state?.chat || []).slice(-40).map((m) => (
                    <p key={m.id} data-kind={m.kind || 'chat'}>
                      <span className={styles.chatMeta}>
                        {m.at ? m.at.slice(11, 19) : ''} {m.name}
                      </span>
                      <span className={styles.chatBody}>{m.text}</span>
                    </p>
                  ))
                )}
              </div>

              <div className={styles.composer}>
                <div className={styles.chatRow}>
                  <input
                    value={chatText}
                    maxLength={CHAT_MAX}
                    onChange={(e) => setChatText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChat();
                      }
                    }}
                    placeholder="Falar na mesa…"
                    aria-label="Mensagem da mesa"
                  />
                  <HudButton
                    onClick={sendChat}
                    disabled={!chatText.trim()}
                  >
                    Enviar
                  </HudButton>
                </div>
                <div className={styles.charCount}>
                  {chatText.length}/{CHAT_MAX}
                </div>

                <div className={styles.diceControls}>
                  {roster.length > 0 && (
                    <label className={styles.diceLabel}>
                      Ficha
                      <select
                        value={selectedCharId}
                        onChange={(e) => setSelectedCharId(e.target.value)}
                      >
                        {roster.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className={styles.diceLabel}>
                    Attr
                    <select
                      value={attrKey}
                      onChange={(e) => setAttrKey(e.target.value)}
                    >
                      {ATTR_OPTIONS.map((k) => (
                        <option key={k} value={k}>
                          {formatStatOption(k)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.diceLabel}>
                    Skill
                    <select
                      value={skillKey}
                      onChange={(e) => setSkillKey(e.target.value)}
                    >
                      {SKILL_OPTIONS.map((k) => (
                        <option key={k} value={k}>
                          {formatStatOption(k)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.diceLabel}>
                    Pool
                    <input
                      type="number"
                      value={selectedChar?.sheetSummary ? sheetPool : pool}
                      min={1}
                      max={20}
                      disabled={Boolean(selectedChar?.sheetSummary)}
                      onChange={(e) => setPool(Number(e.target.value))}
                      aria-label="Pool"
                    />
                  </label>
                  <label className={styles.diceLabel}>
                    Dif
                    <input
                      type="number"
                      value={difficulty}
                      min={2}
                      max={10}
                      onChange={(e) => setDifficulty(Number(e.target.value))}
                      aria-label="Dificuldade"
                    />
                  </label>
                  <HudButton onClick={() => rollDice()}>Rolar</HudButton>
                </div>
                <div className={styles.diceHints}>
                  <HudButton
                    variant="ghost"
                    onClick={() =>
                      rollDice({
                        attr: 'dexterity',
                        skill: 'alertness',
                        label: 'Iniciativa',
                      })
                    }
                  >
                    Iniciativa
                  </HudButton>
                  <HudButton
                    variant="ghost"
                    onClick={() =>
                      rollDice({
                        attr: 'dexterity',
                        skill: 'firearms',
                        label: 'Firearms',
                      })
                    }
                  >
                    Firearms
                  </HudButton>
                </div>
              </div>
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
              onClose={() =>
                setState((s) => (s ? { ...s, breach: null } : s))
              }
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
