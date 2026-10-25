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
import { FogCanvas } from '../../components/vtt/FogCanvas';
import { API_BASE_URL, apiUrl, authHeaders } from '../../lib/api';
import { useCampaign } from '../../lib/campaign';
import { characterImageSrc, resolveMediaSrc } from '../../lib/media';
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
  portraitUrl?: string | null;
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
  image?: string | null;
  vitality?: number;
  vitalityMax?: number;
  sheetSummary?: Record<string, any>;
};

type ToolMode = 'select' | 'fog' | 'wall' | 'pan';
type FogMode = 'reveal' | 'hide';

type CtxMenu = {
  x: number;
  y: number;
  tokenId: string;
};

const GRID = 36;
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
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
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
  const [fogMode, setFogMode] = useState<FogMode>('reveal');
  const [fogRadius, setFogRadius] = useState(1);
  const [panning, setPanning] = useState(false);
  const [wallDraft, setWallDraft] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [gmTab, setGmTab] = useState<'tokens' | 'map' | 'scene'>('tokens');
  const [handoutBody, setHandoutBody] = useState('');
  const [handoutFrom, setHandoutFrom] = useState('Rogue');
  const [uploadingBg, setUploadingBg] = useState(false);
  const [diceOverlay, setDiceOverlay] = useState<{
    active: boolean;
    reveal: DiceReveal | null;
  }>({ active: false, reveal: null });

  const socketRef = useRef<Socket | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const bgInputRef = useRef<HTMLInputElement | null>(null);
  const chatLogRef = useRef<HTMLDivElement | null>(null);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null,
  );
  const lastFogCell = useRef<string | null>(null);

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCtxMenu(null);
        setSelectedTokenId(null);
        setRuler(null);
      }
    };
    const onClick = () => setCtxMenu(null);
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
    };
  }, []);

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
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
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
      ? Math.max(1, computeSheetPool(selectedChar!.sheetSummary, a, s))
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
        portraitUrl: characterImageSrc(c),
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

  const fogActive = (state?.fog?.length || 0) > 0;

  const mapBgSrc = useMemo(() => {
    const url = state?.map?.backgroundUrl;
    if (!url) return null;
    return resolveMediaSrc(url) || url;
  }, [state?.map?.backgroundUrl]);

  const uploadBackground = async (file: File) => {
    if (!isGm || !file) return;
    setUploadingBg(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const key = `maps/campaign-${campaignId}-${Date.now()}.${
        file.name.split('.').pop()?.toLowerCase() || 'jpg'
      }`;
      const res = await fetch(apiUrl('/api/media/upload'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          key,
          data: dataUrl,
          contentType: file.type || 'image/jpeg',
          credit: `map:${campaignId}`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.url) throw new Error(json?.error || 'upload failed');
      intent('map:background', { url: json.url });
      playCyberSound('confirm', { volume: 0.4 });
    } catch {
      playCyberSound('deny', { volume: 0.4 });
    } finally {
      setUploadingBg(false);
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  const paintFog = (e: React.MouseEvent) => {
    if (!isGm || tool !== 'fog') return;
    const c = cellFromEvent(e);
    const key = `${c.x},${c.y}`;
    if (lastFogCell.current === key) return;
    lastFogCell.current = key;
    intent('fog:brush', {
      x: c.x,
      y: c.y,
      radius: fogRadius,
      mode: e.altKey || fogMode === 'hide' ? 'hide' : 'reveal',
    });
  };

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
  const stageW = mapW * GRID;
  const stageH = mapH * GRID;

  const selectedToken = state?.tokens?.find((t) => t.id === selectedTokenId);

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
                <label className={styles.inlineLabel}>
                  Raio
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={fogRadius}
                    onChange={(e) =>
                      setFogRadius(
                        Math.min(5, Math.max(0, Number(e.target.value) || 0)),
                      )
                    }
                    aria-label="Raio do fog"
                  />
                </label>
                <HudButton
                  variant={fogMode === 'reveal' ? 'primary' : 'ghost'}
                  onClick={() => setFogMode('reveal')}
                >
                  Reveal
                </HudButton>
                <HudButton
                  variant={fogMode === 'hide' ? 'primary' : 'ghost'}
                  onClick={() => setFogMode('hide')}
                >
                  Hide
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
                <HudButton
                  variant="ghost"
                  disabled={uploadingBg}
                  onClick={() => bgInputRef.current?.click()}
                >
                  {uploadingBg ? 'Upload…' : 'Background'}
                </HudButton>
                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadBackground(f);
                  }}
                />
                {mapBgSrc && (
                  <HudButton
                    variant="ghost"
                    onClick={() => intent('map:background', { url: null })}
                  >
                    Limpar BG
                  </HudButton>
                )}
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

          {selectedToken && (
            <div className={styles.selectionBar}>
              Selecionado: <strong>{selectedToken.name}</strong>
              {selectedToken.hidden ? ' · oculto' : ''}
              {isGm && (
                <>
                  <HudButton
                    variant="ghost"
                    onClick={() =>
                      intent('token:update', {
                        tokenId: selectedToken.id,
                        hidden: !selectedToken.hidden,
                      })
                    }
                  >
                    {selectedToken.hidden ? 'Revelar' : 'Ocultar'}
                  </HudButton>
                  <HudButton
                    variant="ghost"
                    onClick={() => {
                      intent('token:remove', { tokenId: selectedToken.id });
                      setSelectedTokenId(null);
                    }}
                  >
                    Remover
                  </HudButton>
                </>
              )}
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
            <div
              ref={stageRef}
              className={styles.mapStage}
              style={{
                width: Math.min(900, stageW),
                height: Math.min(560, stageH),
              }}
              onContextMenu={(e) => e.preventDefault()}
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
                  lastFogCell.current = null;
                  paintFog(e);
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
                  return;
                }
                if (e.target === e.currentTarget || (e.target as HTMLElement).dataset?.layer === 'board') {
                  setSelectedTokenId(null);
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
                  paintFog(e);
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
                lastFogCell.current = null;
              }}
              onMouseLeave={() => {
                setPanning(false);
                panStart.current = null;
                lastFogCell.current = null;
              }}
            >
              <div
                className={styles.mapWorld}
                data-layer="board"
                style={{
                  width: stageW,
                  height: stageH,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
              >
                {mapBgSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mapBgSrc}
                    alt=""
                    className={styles.mapBackground}
                    draggable={false}
                  />
                )}
                <svg
                  className={styles.gridSvg}
                  width={stageW}
                  height={stageH}
                  data-layer="board"
                >
                  {Array.from({ length: mapH }).map((_, y) =>
                    Array.from({ length: mapW }).map((__, x) => (
                      <rect
                        key={`${x}-${y}`}
                        x={x * GRID}
                        y={y * GRID}
                        width={GRID}
                        height={GRID}
                        className={
                          mapBgSrc ? styles.cellOverBg : styles.cell
                        }
                      />
                    )),
                  )}
                  {(state?.walls || []).map((w) => (
                    <line
                      key={w.id}
                      x1={w.x1 * GRID + GRID / 2}
                      y1={w.y1 * GRID + GRID / 2}
                      x2={w.x2 * GRID + GRID / 2}
                      y2={w.y2 * GRID + GRID / 2}
                      className={styles.wall}
                    />
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
                </svg>
                <FogCanvas
                  width={mapW}
                  height={mapH}
                  cellSize={GRID}
                  fog={state?.fog || []}
                  active={fogActive}
                  gmView={isGm}
                />
                <div className={styles.tokenLayer}>
                  {(state?.tokens || []).map((t) => {
                    const turn =
                      state?.initiative?.[state.turnIndex || 0]?.tokenId ===
                      t.id;
                    const selected = selectedTokenId === t.id;
                    const portrait =
                      resolveMediaSrc(t.portraitUrl) || t.portraitUrl || null;
                    const mine = canDragToken(t);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        className={styles.token}
                        data-turn={turn ? '1' : '0'}
                        data-selected={selected ? '1' : '0'}
                        data-mine={mine ? '1' : '0'}
                        data-hidden={t.hidden ? '1' : '0'}
                        style={{
                          left: t.x * GRID,
                          top: t.y * GRID,
                          width: GRID,
                          height: GRID,
                          ['--token-color' as string]: t.color,
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (e.button !== 0) return;
                          setSelectedTokenId(t.id);
                          setCtxMenu(null);
                          if (!mine || tool !== 'select') return;
                          setDragging(t.id);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedTokenId(t.id);
                          setCtxMenu({
                            x: e.clientX,
                            y: e.clientY,
                            tokenId: t.id,
                          });
                        }}
                        aria-label={t.name}
                      >
                        {portrait ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={portrait} alt="" draggable={false} />
                        ) : (
                          <span className={styles.tokenInitial}>
                            {t.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className={styles.tokenName}>{t.name.slice(0, 8)}</span>
                        {t.bars && (
                          <span
                            className={styles.tokenBar}
                            style={{
                              width: `${
                                (t.bars.hp / Math.max(1, t.bars.hpMax)) * 100
                              }%`,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className={styles.hudOverlay}>
              zoom {zoom.toFixed(2)} · shift+drag régua · {distance}u
              {tool !== 'select' ? ` · tool:${tool}` : ''}
              {tool === 'fog' ? ` · fog:${fogMode} r${fogRadius}` : ''}
              {state?.radioStation ? ` · ${state.radioStation}` : ''}
              {mapBgSrc ? ' · bg' : ''}
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

      {ctxMenu && (
        <div
          className={styles.ctxMenu}
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedTokenId(ctxMenu.tokenId);
              setCtxMenu(null);
            }}
          >
            Selecionar
          </button>
          {isGm && (
            <>
              <button
                type="button"
                onClick={() => {
                  const t = state?.tokens?.find(
                    (x) => x.id === ctxMenu.tokenId,
                  );
                  intent('token:update', {
                    tokenId: ctxMenu.tokenId,
                    hidden: !t?.hidden,
                  });
                  setCtxMenu(null);
                }}
              >
                Toggle oculto
              </button>
              <button
                type="button"
                onClick={() => {
                  intent('token:remove', { tokenId: ctxMenu.tokenId });
                  setSelectedTokenId(null);
                  setCtxMenu(null);
                }}
              >
                Remover
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = state?.tokens?.find(
                    (x) => x.id === ctxMenu.tokenId,
                  );
                  if (!t) return;
                  const order = [
                    {
                      tokenId: t.id,
                      name: t.name,
                      score: 99,
                    },
                    ...(state?.initiative || []).filter(
                      (i) => i.tokenId !== t.id,
                    ),
                  ];
                  intent('initiative:set', { order });
                  setCtxMenu(null);
                }}
              >
                Destacar turno
              </button>
            </>
          )}
        </div>
      )}
    </PageFrame>
  );
};

export default TablePage;
