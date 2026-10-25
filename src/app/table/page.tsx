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
import { parseRollKind } from '../../components/vtt/diceDecodeUtils';
import { useDiceRollQueue } from '../../components/vtt/useDiceRollQueue';
import { FogCanvas } from '../../components/vtt/FogCanvas';
import {
  LayersPanel,
  type VttLayer,
  type VttLayerId,
} from '../../components/vtt/LayersPanel';
import {
  SceneBar,
  type VttSceneSummary,
} from '../../components/vtt/SceneBar';
import { CombatHud } from '../../components/vtt/CombatHud';
import { type ViewMode } from '../../components/vtt/NightCityBar';
import {
  FloatingHudPanel,
  readHudPanelPref,
  writeHudPanelPref,
  HUD_PREF_LEFT,
  HUD_PREF_RIGHT,
} from '../../components/vtt/FloatingHudPanel';
import { TableTopHud } from '../../components/vtt/TableTopHud';
import { GmToolBar } from '../../components/vtt/GmToolBar';
import {
  GmTokenSpawnList,
  parseSpawnDragPayload,
  VTT_SPAWN_DRAG_MIME,
  type SpawnDragPayload,
} from '../../components/vtt/GmTokenSpawnList';
import {
  fetchCampaignNpcs,
  type CampaignNpc,
} from '../../lib/campaignsApi';
import { CombatHotbar } from '../../components/vtt/CombatHotbar';
import { InitiativeTimeline } from '../../components/vtt/InitiativeTimeline';
import {
  BoardNavToolbar,
  type BoardNavTool,
} from '../../components/vtt/BoardNavToolbar';
import {
  ReactionBar,
  type ReactionId,
} from '../../components/vtt/ReactionBar';
import {
  EmoteToasts,
  type EmoteToast,
} from '../../components/vtt/EmoteToasts';
import {
  TokenEmoteBubbles,
  type TokenEmoteBubble,
} from '../../components/vtt/TokenEmoteBubbles';
import {
  TokenEmotePicker,
  TOKEN_EMOTE_COOLDOWN_MS,
} from '../../components/vtt/TokenEmotePicker';
import {
  TOKEN_EMOTE_GLYPH,
  type TokenEmoteId,
} from '../../lib/vttTokenEmotes';
import { GmNotesPanel } from '../../components/vtt/GmNotesPanel';
import {
  QuickhackMenu,
  type NetMenuPayload,
} from '../../components/vtt/QuickhackMenu';
import { DroneHud } from '../../components/vtt/DroneHud';
import { AimOverlay } from '../../components/vtt/AimOverlay';
import { RunnerPanel } from '../../components/vtt/RunnerPanel';
import { RunnerSheetPopup } from '../../components/vtt/RunnerSheetPopup';
import { API_BASE_URL, apiUrl, authHeaders } from '../../lib/api';
import {
  buildAimPreview,
  chebyshev,
  rangeBandLabel,
  type AimPreview,
} from '../../lib/vttAim';
import { useCampaign } from '../../lib/campaign';
import { useTranslations } from '../../i18n/useTranslations';
import {
  characterImageSrc,
  npcImageSrc,
  resolveMediaSrc,
} from '../../lib/media';
import {
  ATTR_OPTIONS,
  SKILL_OPTIONS,
  computeSheetPool,
  formatStatOption,
} from '../../lib/sheetPool';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import { ChromeBootSequence } from '../../components/vtt/ChromeBootSequence';
import { TokenArHud } from '../../components/vtt/TokenArHud';
import { isArTargetToken, tokenShowsNameplate } from '../../lib/vttAr';
import styles from './table.module.css';

type Token = {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  hidden?: boolean;
  bars?: {
    hp: number;
    hpMax: number;
    humanity?: number;
    edges?: number;
    battery?: number;
    batteryMax?: number;
    signal?: number;
    ram?: number;
    ramMax?: number;
  };
  ownerPlayerId?: number;
  controllerPlayerId?: number;
  parentTokenId?: string;
  characterId?: number | string;
  portraitUrl?: string | null;
  kind?: string;
  floor?: number;
  auras?: string[];
  affiliation?: string;
  arIntel?: {
    name: string;
    affiliation?: string;
    threat?: 'low' | 'med' | 'high';
    weapons?: string[];
  };
  gmNotes?: string;
  signalJammed?: boolean;
  droneSheet?: {
    profileId?: string;
    label?: string;
    role?: string;
    physical?: Record<string, number>;
    mental?: Record<string, number>;
    skills?: Record<string, number>;
    weapons?: string[];
    notes?: string;
  };
};

type VttDevice = {
  id: string;
  kind: string;
  name: string;
  x: number;
  y: number;
  floor?: number;
  hackable: boolean;
  threat?: string;
  accessLevel?: number;
  linkedTo?: string[];
  fov?: number;
  jammed?: boolean;
  open?: boolean;
  iceStacks?: number;
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
  sceneId?: string | null;
  published?: boolean;
  floor?: number;
  viewMode?: ViewMode;
  map: {
    width: number;
    height: number;
    gridSize: number;
    name: string;
    backgroundUrl?: string | null;
    backgroundScale?: number;
  };
  tokens: Token[];
  walls: Array<{
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    door?: boolean;
    open?: boolean;
  }>;
  lights?: Array<{
    id: string;
    x: number;
    y: number;
    radius: number;
    color?: string;
    intensity?: number;
  }>;
  fog: Array<{ x: number; y: number; revealed: boolean }>;
  devices?: VttDevice[];
  zones?: Array<{
    id: string;
    kind: string;
    label: string;
    cells: Array<{ x: number; y: number }>;
    floor?: number;
  }>;
  threatClocks?: Array<{ id: string; label: string; value: number; max: number }>;
  objectives?: Array<{ id: string; text: string; done: boolean }>;
  conditions?: Array<{
    id: string;
    tokenId: string;
    kind: string;
    label: string;
    roundsLeft: number;
  }>;
  combat?: { active: boolean; round: number; phase: string } | null;
  turnEconomy?: {
    tokenId: string;
    mainUsed: boolean;
    moveUsed: boolean;
    reactionUsed: boolean;
    extraActions: number;
  } | null;
  initiative: Array<{
    tokenId: string;
    name: string;
    score: number;
    delayed?: boolean;
    holding?: boolean;
    extraTurns?: number;
  }>;
  turnIndex: number;
  presence: Array<{ playerId: number; name: string; role: string }>;
  chat: ChatMsg[];
  handouts: Handout[];
  breach?: BreachState | null;
  radioStation?: string | null;
  radioJammed?: boolean;
  sceneGmNotes?: string;
  pendingRolls?: Array<{
    id: string;
    toPlayerId: number;
    attr: string;
    skill: string;
    label: string;
    fromName: string;
  }>;
  layers?: VttLayer[];
  activeLayer?: VttLayerId;
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

type ScanIntelTag = {
  id: string;
  tier: number;
  tag?: string;
  threat?: string;
  accessLevel?: number;
  name?: string;
  kind?: string;
  hp?: string;
};

type ScanResult = {
  ok: boolean;
  tier: number;
  optics?: string[];
  devices: ScanIntelTag[];
  tokens: ScanIntelTag[];
  error?: string;
  message?: string;
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
const INITIATIVE_TIMELINE_PREF = 'cp-vtt-initiative-timeline';
const TOKEN_COLORS = [
  '#FCEE0A',
  '#02d7f2',
  '#ff2a6d',
  '#7CFF6B',
  '#c77dff',
  '#ff9f1c',
];

const DEFAULT_LAYERS: VttLayer[] = [
  { id: 'background', name: 'Background', visible: true, locked: false },
  { id: 'grid', name: 'Grid', visible: true, locked: true },
  { id: 'walls', name: 'Walls', visible: true, locked: false },
  { id: 'tokens', name: 'Tokens', visible: true, locked: false },
  { id: 'fog', name: 'Fog', visible: true, locked: false },
];

const normalizeLayers = (input?: VttLayer[] | null): VttLayer[] => {
  const byId = new Map((input || []).map((l) => [l.id, l]));
  return DEFAULT_LAYERS.map((def) => {
    const row = byId.get(def.id);
    if (!row) return { ...def };
    return {
      ...def,
      visible: row.visible != null ? !!row.visible : def.visible,
      locked: row.locked != null ? !!row.locked : def.locked,
    };
  });
};

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
  const { t: tAr } = useTranslations('vtt.ar');
  const { t: tTokenEmote } = useTranslations('vtt.tokenEmote');

  const [scenes, setScenes] = useState<VttSceneSummary[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(`campaign-${campaignId}`);
  const [scenesBusy, setScenesBusy] = useState(false);

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
  const [campaignNpcs, setCampaignNpcs] = useState<CampaignNpc[]>([]);
  const [spawnPlacement, setSpawnPlacement] =
    useState<SpawnDragPayload | null>(null);
  const rosterRef = useRef<RosterChar[]>([]);
  rosterRef.current = roster;
  const [rosterHydrated, setRosterHydrated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [chromeBootOpen, setChromeBootOpen] = useState(false);
  const tableBootShownRef = useRef(false);
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
  const [boardNavTool, setBoardNavTool] = useState<BoardNavTool>('select');
  const [initiativeTimelineVisible, setInitiativeTimelineVisible] =
    useState(true);
  const [netWireMode, setNetWireMode] = useState(false);
  const [netLinkFrom, setNetLinkFrom] = useState<string | null>(null);
  const [selectedNetLink, setSelectedNetLink] = useState<{
    a: string;
    b: string;
  } | null>(null);
  const spaceHeldRef = useRef(false);
  const spacePanUsedRef = useRef(false);
  const [fogMode, setFogMode] = useState<FogMode>('reveal');
  const [fogRadius, setFogRadius] = useState(1);
  const [panning, setPanning] = useState(false);
  const [wallDraft, setWallDraft] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [gmTab, setGmTab] = useState<'tokens' | 'map' | 'scene'>('tokens');
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ w: 900, h: 560 });
  const [leftHudCollapsed, setLeftHudCollapsed] = useState(false);
  const [rightHudCollapsed, setRightHudCollapsed] = useState(false);
  const [handoutBody, setHandoutBody] = useState('');
  const [handoutFrom, setHandoutFrom] = useState('Rogue');
  const [uploadingBg, setUploadingBg] = useState(false);
  const [importingUvtt, setImportingUvtt] = useState(false);
  const [aimMode, setAimMode] = useState(false);
  const [aimHoverId, setAimHoverId] = useState<string | null>(null);
  const [sheetPopupOpen, setSheetPopupOpen] = useState(false);
  const [safeVision, setSafeVision] = useState(false);
  const [localViewMode, setLocalViewMode] = useState<ViewMode | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanBusy, setScanBusy] = useState(false);
  const [scanToast, setScanToast] = useState<string | null>(null);
  const [netMenu, setNetMenu] = useState<NetMenuPayload | null>(null);
  const [netBusy, setNetBusy] = useState(false);
  const [sandyFx, setSandyFx] = useState(false);
  const [pendingRoll, setPendingRoll] = useState<{
    id: string;
    attr: string;
    skill: string;
    label: string;
    fromName: string;
  } | null>(null);
  const [lastAttack, setLastAttack] = useState<any>(null);
  const [emoteToasts, setEmoteToasts] = useState<EmoteToast[]>([]);
  const [tokenEmoteBubbles, setTokenEmoteBubbles] = useState<
    TokenEmoteBubble[]
  >([]);
  const [tokenEmoteCooldownUntil, setTokenEmoteCooldownUntil] = useState(0);
  const [presenceMood, setPresenceMood] = useState<
    Record<number, string>
  >({});
  const [sceneNotesDraft, setSceneNotesDraft] = useState('');
  const [tokenNotesDraft, setTokenNotesDraft] = useState('');
  const {
    state: diceOverlay,
    enqueue: enqueueDiceRoll,
    completeCurrent: completeDiceRoll,
  } = useDiceRollQueue();

  const socketRef = useRef<Socket | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const bgInputRef = useRef<HTMLInputElement | null>(null);
  const uvttInputRef = useRef<HTMLInputElement | null>(null);
  const chatLogRef = useRef<HTMLDivElement | null>(null);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null,
  );
  const lastFogCell = useRef<string | null>(null);

  const isGm = myRole === 'gm';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(INITIATIVE_TIMELINE_PREF);
    if (raw === '0') setInitiativeTimelineVisible(false);
  }, []);

  const toggleInitiativeTimeline = useCallback(() => {
    setInitiativeTimelineVisible((v) => {
      const next = !v;
      if (typeof window !== 'undefined') {
        localStorage.setItem(INITIATIVE_TIMELINE_PREF, next ? '1' : '0');
      }
      return next;
    });
  }, []);

  const [spaceHeld, setSpaceHeld] = useState(false);
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

  const pushTokenEmoteBubble = useCallback((bubble: TokenEmoteBubble) => {
    setTokenEmoteBubbles((prev) => [...prev.slice(-12), bubble]);
    window.setTimeout(() => {
      setTokenEmoteBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
    }, 2800);
  }, []);

  const fireTokenEmote = useCallback(
    (tokenId: string, emote: TokenEmoteId) => {
      if (Date.now() < tokenEmoteCooldownUntil) return;
      intent('token:emote', { tokenId, emote });
      setTokenEmoteCooldownUntil(Date.now() + TOKEN_EMOTE_COOLDOWN_MS);
      playCyberSound('ui', { volume: 0.28 });
      const tok = state?.tokens?.find((t) => t.id === tokenId);
      if (tok) {
        pushTokenEmoteBubble({
          id: `te_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          tokenId,
          glyph: TOKEN_EMOTE_GLYPH[emote],
          label: tTokenEmote(`${emote}.short`),
          x: tok.x,
          y: tok.y,
          floor: tok.floor ?? 0,
        });
      }
    },
    [
      intent,
      pushTokenEmoteBubble,
      state?.tokens,
      tTokenEmote,
      tokenEmoteCooldownUntil,
    ],
  );

  const applySceneList = useCallback(
    (data: {
      scenes?: VttSceneSummary[];
      activeSceneId?: string | null;
    }) => {
      const list = Array.isArray(data?.scenes) ? data.scenes : [];
      setScenes(list);
      const active =
        data?.activeSceneId || list.find((s) => s.active)?.id || list[0]?.id || null;
      setActiveSceneId(active);
      return { list, active };
    },
    [],
  );

  const loadScenes = useCallback(
    async (opts?: { selectPreferred?: boolean }) => {
      try {
        const res = await fetch(
          apiUrl(`/api/vtt/campaigns/${campaignId}/scenes`),
          { headers: authHeaders() },
        );
        if (!res.ok) return null;
        const data = await res.json();
        const { list, active } = applySceneList(data);
        if (opts?.selectPreferred !== false) {
          let stored: string | null = null;
          try {
            stored = localStorage.getItem(`cp-vtt-scene-${campaignId}`);
          } catch {
            stored = null;
          }
          const preferred =
            (stored && list.find((s) => s.id === stored)) ||
            list.find((s) => s.id === active) ||
            list[0] ||
            null;
          if (preferred) {
            setSceneId(preferred.id);
            setSessionId(preferred.sessionId);
          }
        }
        return { list, active };
      } catch {
        return null;
      }
    },
    [campaignId, applySceneList],
  );

  const switchToScene = useCallback(
    (id: string, opts?: { activate?: boolean }) => {
      const scene = scenes.find((s) => s.id === id);
      if (!scene) return;
      setSceneId(scene.id);
      setSessionId(scene.sessionId);
      setState(null);
      setSelectedTokenId(null);
      setPan({ x: 0, y: 0 });
      if (opts?.activate && isGm) {
        socketRef.current?.emit('vtt:scene-activate', {
          campaignId,
          sceneId: scene.id,
        });
        setActiveSceneId(scene.id);
      }
      try {
        localStorage.setItem(`cp-vtt-scene-${campaignId}`, scene.id);
      } catch {
        /* ignore */
      }
    },
    [scenes, isGm, campaignId],
  );

  const createScene = async (name: string, copyFrom: boolean) => {
    if (!isGm) return;
    setScenesBusy(true);
    try {
      const res = await fetch(
        apiUrl(`/api/vtt/campaigns/${campaignId}/scenes`),
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            name,
            copyFromSceneId: copyFrom && sceneId ? sceneId : undefined,
          }),
        },
      );
      if (!res.ok) throw new Error('create failed');
      const created = await res.json();
      await loadScenes({ selectPreferred: false });
      if (created?.id && created?.sessionId) {
        setSceneId(created.id);
        setSessionId(created.sessionId);
        setState(null);
        try {
          localStorage.setItem(`cp-vtt-scene-${campaignId}`, created.id);
        } catch {
          /* ignore */
        }
      }
      playCyberSound('confirm', { volume: 0.4 });
    } catch {
      playCyberSound('deny', { volume: 0.4 });
    } finally {
      setScenesBusy(false);
    }
  };

  const renameScene = async (id: string, name: string) => {
    if (!isGm) return;
    setScenesBusy(true);
    try {
      const res = await fetch(
        apiUrl(`/api/vtt/campaigns/${campaignId}/scenes/${id}`),
        {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ name }),
        },
      );
      if (!res.ok) throw new Error('rename failed');
      await loadScenes({ selectPreferred: false });
    } catch {
      playCyberSound('deny', { volume: 0.35 });
    } finally {
      setScenesBusy(false);
    }
  };

  const activateScene = async (id: string) => {
    if (!isGm) return;
    setScenesBusy(true);
    try {
      const res = await fetch(
        apiUrl(`/api/vtt/campaigns/${campaignId}/scenes/${id}/activate`),
        { method: 'POST', headers: authHeaders() },
      );
      if (!res.ok) throw new Error('activate failed');
      switchToScene(id, { activate: true });
      await loadScenes({ selectPreferred: false });
      playCyberSound('confirm', { volume: 0.4 });
    } catch {
      playCyberSound('deny', { volume: 0.35 });
    } finally {
      setScenesBusy(false);
    }
  };

  const deleteScene = async (id: string) => {
    if (!isGm) return;
    setScenesBusy(true);
    try {
      const res = await fetch(
        apiUrl(`/api/vtt/campaigns/${campaignId}/scenes/${id}`),
        { method: 'DELETE', headers: authHeaders() },
      );
      if (!res.ok) throw new Error('delete failed');
      const data = await res.json();
      const { list, active } = applySceneList(data);
      const next = list.find((s) => s.id === active) || list[0];
      if (next) {
        setSceneId(next.id);
        setSessionId(next.sessionId);
      }
      playCyberSound('confirm', { volume: 0.35 });
    } catch {
      playCyberSound('deny', { volume: 0.35 });
    } finally {
      setScenesBusy(false);
    }
  };

  const scrollChat = useCallback(() => {
    const el = chatLogRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollChat();
  }, [state?.chat, scrollChat]);

  useEffect(() => {
    document.documentElement.dataset.safeVision = safeVision ? 'on' : 'off';
    return () => {
      delete document.documentElement.dataset.safeVision;
    };
  }, [safeVision]);

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
        setAimMode(false);
        setAimHoverId(null);
        setSheetPopupOpen(false);
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
    setSceneId(null);
    setSessionId(`campaign-${campaignId}`);
    setScenes([]);
    setActiveSceneId(null);
    void loadScenes();
  }, [campaignId, loadScenes]);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token') || ''
        : '';
    const payload = token ? parseJwt(token) : null;
    const playerId = Number(payload?.id || payload?.sub || 0) || 0;
    if (playerId) setMyPlayerId(playerId);
    const name = String(
      payload?.name || payload?.username || '',
    ).slice(0, 48);
    if (name) setMyName(name);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    setRosterHydrated(false);
    tableBootShownRef.current = false;
    setChromeBootOpen(false);
  }, [campaignId]);

  useEffect(() => {
    if (!sceneId) return;

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

    const join = () => {
      socket.emit(
        'vtt:join',
        { sessionId, campaignId, sceneId, name },
        (
          ack:
            | { role?: string; sessionId?: string; sceneId?: string }
            | undefined,
        ) => {
          if (ack?.role === 'gm' || ack?.role === 'player') {
            setMyRole(ack.role);
          }
          if (ack?.sessionId) setSessionId(ack.sessionId);
          if (ack?.sceneId) setSceneId(ack.sceneId);
        },
      );
    };

    socket.on('connect', join);
    socket.on('vtt:state', (s: VttState) => setState(s));
    socket.on('vtt:handout', () => setPhoneOpen(true));
    socket.on('vtt:breach', (b: BreachState) =>
      setState((prev) => (prev ? { ...prev, breach: b } : prev)),
    );
    socket.on(
      'vtt:scene-switch',
      (payload: {
        sceneId?: string;
        sessionId?: string;
        name?: string;
      }) => {
        if (!payload?.sceneId || !payload?.sessionId) return;
        setActiveSceneId(payload.sceneId);
        setSceneId(payload.sceneId);
        setSessionId(payload.sessionId);
        setState(null);
        setSelectedTokenId(null);
        try {
          localStorage.setItem(
            `cp-vtt-scene-${campaignId}`,
            payload.sceneId,
          );
        } catch {
          /* ignore */
        }
        void loadScenes({ selectPreferred: false });
        playCyberSound('ui', { volume: 0.35 });
      },
    );
    socket.on(
      'vtt:dice',
      (result: DiceReveal & { rollerName?: string; characterId?: number }) => {
        playCyberSound('glitch', { volume: 0.55 });
        const rollChar =
          result.characterId != null
            ? rosterRef.current.find(
                (c) => Number(c.id) === Number(result.characterId),
              )
            : undefined;
        enqueueDiceRoll({
          id: result.id,
          pool: result.pool,
          difficulty: result.difficulty,
          dice: result.dice,
          successes: result.successes,
          ones: result.ones,
          botch: result.botch,
          label: result.label,
          rollerName: result.rollerName,
          characterId: result.characterId,
          characterRole:
            rollChar?.role || rollChar?.sheetSummary?.role || undefined,
          rollKind: parseRollKind(result.label),
        });
      },
    );
    socket.on('vtt:fx', (fx: { type?: string; tokenId?: string }) => {
      if (fx?.type === 'sandevistan') {
        setSandyFx(true);
        window.setTimeout(() => setSandyFx(false), 2200);
        playCyberSound('glitch', { volume: 0.45 });
      }
      if (fx?.type === 'damage') {
        playCyberSound('deny', { volume: 0.35 });
      }
    });
    socket.on('vtt:view-mode', (p: { mode?: ViewMode }) => {
      if (p?.mode) setLocalViewMode(p.mode);
    });
    socket.on('vtt:scan', (payload: ScanResult) => {
      setScanBusy(false);
      if (!payload?.ok) {
        setScanResult(null);
        setScanToast(payload?.message || 'Scan falhou');
        playCyberSound('deny', { volume: 0.45 });
        window.setTimeout(() => setScanToast(null), 3200);
        return;
      }
      setScanResult({
        ok: true,
        tier: Number(payload.tier) || 0,
        optics: payload.optics || [],
        devices: Array.isArray(payload.devices) ? payload.devices : [],
        tokens: Array.isArray(payload.tokens) ? payload.tokens : [],
      });
      setLocalViewMode('scan');
      playCyberSound('scan', { volume: 0.4 });
      setScanToast(
        payload.tier <= 0
          ? 'NOISE — scan sem leitura útil'
          : `Kiroshi online · tier ${payload.tier}`,
      );
      window.setTimeout(() => setScanToast(null), 2800);
    });
    socket.on('vtt:net-menu', (payload: NetMenuPayload) => {
      setNetBusy(false);
      setNetMenu(payload);
      if (payload?.ok) playCyberSound('ui', { volume: 0.35 });
      else playCyberSound('deny', { volume: 0.4 });
    });
    socket.on(
      'vtt:net-hack',
      (payload: {
        ok?: boolean;
        outcome?: string;
        error?: string;
        name?: string;
      }) => {
        setNetBusy(false);
        playCyberSound(payload?.ok ? 'confirm' : 'deny', { volume: 0.45 });
        setScanToast(
          payload?.ok
            ? `${payload.name || 'Hack'} · ${payload.outcome || 'ok'}`
            : payload?.error || payload?.outcome || 'Hack falhou',
        );
        window.setTimeout(() => setScanToast(null), 2800);
      },
    );
    socket.on(
      'vtt:drone',
      (payload: {
        ok?: boolean;
        error?: string;
        message?: string;
        action?: string;
        band?: string;
      }) => {
        if (!payload?.ok) {
          playCyberSound('deny', { volume: 0.4 });
          setScanToast(payload?.message || payload?.error || 'Drone offline');
          window.setTimeout(() => setScanToast(null), 2800);
          return;
        }
        if (payload.action === 'spawn' || payload.action === 'jam') {
          playCyberSound('ui', { volume: 0.35 });
        }
      },
    );
    socket.on('vtt:attack', (card: any) => setLastAttack(card));
    socket.on(
      'vtt:roll-request',
      (req: {
        id: string;
        toPlayerId: number;
        attr: string;
        skill: string;
        label: string;
        fromName: string;
      }) => {
        if (Number(req.toPlayerId) !== Number(playerId) && req.toPlayerId !== 0) {
          return;
        }
        setPendingRoll(req);
        playCyberSound('ui', { volume: 0.4 });
      },
    );
    socket.on(
      'vtt:token-emote',
      (payload: {
        tokenId?: string;
        emote?: string;
        label?: string;
        glyph?: string;
        x?: number;
        y?: number;
        floor?: number;
        playerId?: number;
      }) => {
        if (!payload.tokenId) return;
        if (
          payload.playerId != null &&
          Number(payload.playerId) === Number(playerId)
        ) {
          return;
        }
        playCyberSound('ui', { volume: 0.2 });
        pushTokenEmoteBubble({
          id: `te_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          tokenId: payload.tokenId,
          glyph: payload.glyph || '·',
          label: payload.label || payload.emote || '…',
          x: Number(payload.x) || 0,
          y: Number(payload.y) || 0,
          floor: Number(payload.floor) || 0,
        });
      },
    );
    socket.on(
      'vtt:emote',
      (payload: {
        playerId?: number;
        name?: string;
        emote?: string;
        label?: string;
      }) => {
        playCyberSound('ui', { volume: 0.25 });
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const toast: EmoteToast = {
          id,
          name: payload.name || 'Runner',
          emote: payload.emote || 'concordo',
          label: payload.label || payload.emote || '…',
        };
        setEmoteToasts((prev) => [...prev.slice(-4), toast]);
        if (payload.playerId != null) {
          setPresenceMood((prev) => ({
            ...prev,
            [Number(payload.playerId)]: toast.label,
          }));
        }
        window.setTimeout(() => {
          setEmoteToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4200);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [
    sessionId,
    campaignId,
    sceneId,
    loadScenes,
    pushTokenEmoteBubble,
    enqueueDiceRoll,
  ]);

  useEffect(() => {
    setSceneNotesDraft(state?.sceneGmNotes || '');
  }, [state?.sceneGmNotes, sceneId]);

  useEffect(() => {
    const tok = state?.tokens?.find((t) => t.id === selectedTokenId);
    setTokenNotesDraft(tok?.gmNotes || '');
  }, [selectedTokenId, state?.tokens, state?.version]);

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
        const mine =
          list.find((c) => Number(c.playerId) === Number(myPlayerId)) ||
          list[0];
        if (mine && (!selectedCharId || !list.some((c) => c.id === selectedCharId))) {
          setSelectedCharId(mine.id);
        }
      })
      .catch(() => setRoster([]))
      .finally(() => setRosterHydrated(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, myPlayerId]);

  useEffect(() => {
    if (!isGm || !campaignId) {
      setCampaignNpcs([]);
      return;
    }
    fetchCampaignNpcs(campaignId)
      .then(setCampaignNpcs)
      .catch(() => setCampaignNpcs([]));
  }, [campaignId, isGm]);

  useEffect(() => {
    if (!authReady || !rosterHydrated || tableBootShownRef.current) return;
    tableBootShownRef.current = true;
    setChromeBootOpen(true);
  }, [authReady, rosterHydrated]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(2.5, Math.max(0.5, z - e.deltaY * 0.001)));
  };

  const cellFromClient = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / (GRID * zoom);
    const y = (clientY - rect.top - pan.y) / (GRID * zoom);
    return { x: Math.floor(x), y: Math.floor(y) };
  };

  const cellFromEvent = (e: React.MouseEvent) =>
    cellFromClient(e.clientX, e.clientY);

  const onTableCharacterIds = useMemo(() => {
    const ids = new Set<number>();
    for (const t of state?.tokens || []) {
      if (t.characterId != null) ids.add(Number(t.characterId));
    }
    return ids;
  }, [state?.tokens]);

  const mapNpcThreat = (raw?: string): 'low' | 'med' | 'high' | undefined => {
    const s = String(raw || '').toLowerCase();
    if (s.includes('low') || s.includes('baix')) return 'low';
    if (s.includes('high') || s.includes('alt')) return 'high';
    if (s.includes('med') || s.includes('méd') || s.includes('mod')) return 'med';
    return undefined;
  };

  const placeSpawnToken = useCallback(
    (payload: SpawnDragPayload, x: number, y: number) => {
      if (!isGm) return;
      if (payload.kind === 'character') {
        const c = roster.find((r) => r.id === payload.id);
        if (!c) return;
        const cid = Number(c.id);
        if (onTableCharacterIds.has(cid)) return;
        const idx = roster.findIndex((r) => r.id === c.id);
        intent('token:add', {
          name: c.name,
          kind: 'runner',
          x,
          y,
          characterId: cid,
          ownerPlayerId:
            c.playerId != null ? Number(c.playerId) : undefined,
          portraitUrl: characterImageSrc(c),
          color: TOKEN_COLORS[(idx >= 0 ? idx : 0) % TOKEN_COLORS.length],
          bars: {
            hp: Number(c.vitality) || 7,
            hpMax: Number(c.vitalityMax) || 7,
          },
        });
      } else {
        const npc = campaignNpcs.find((n) => n.id === payload.id);
        if (!npc) return;
        intent('token:add', {
          name: npc.name,
          kind: 'npc',
          x,
          y,
          affiliation: npc.affiliation || undefined,
          arThreat: mapNpcThreat(npc.threat),
          portraitUrl: npcImageSrc({ id: npc.id }),
          color: '#ff2a6d',
          bars: { hp: 7, hpMax: 7 },
        });
      }
      playCyberSound('confirm', { volume: 0.35 });
      setSpawnPlacement(null);
    },
    [isGm, roster, campaignNpcs, onTableCharacterIds, intent],
  );

  const distance = useMemo(() => {
    if (!ruler) return 0;
    return chebyshev(ruler.x1, ruler.y1, ruler.x2, ruler.y2);
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

  const layers = useMemo(
    () => normalizeLayers(state?.layers),
    [state?.layers],
  );
  const activeLayer: VttLayerId = state?.activeLayer || 'tokens';

  const layerVisible = useCallback(
    (id: VttLayerId) => layers.find((l) => l.id === id)?.visible !== false,
    [layers],
  );
  const layerLocked = useCallback(
    (id: VttLayerId) => !!layers.find((l) => l.id === id)?.locked,
    [layers],
  );

  const activateLayer = (id: VttLayerId) => {
    intent('layer:active', { id });
    if (id === 'fog' && isGm && !layerLocked('fog')) setTool('fog');
    else if (id === 'walls' && isGm && !layerLocked('walls')) setTool('wall');
    else if (id === 'background') setTool('pan');
    else setTool('select');
    playCyberSound('ui', { volume: 0.25 });
  };

  const canDragToken = (t: Token) => {
    if (layerLocked('tokens')) return false;
    if (!layerVisible('tokens')) return false;
    if (isGm) return true;
    return (
      Number(t.ownerPlayerId) === Number(myPlayerId) ||
      Number(t.controllerPlayerId) === Number(myPlayerId)
    );
  };

  const canEmitTokenEmoteOn = (t: Token) =>
    isGm || Number(t.ownerPlayerId) === Number(myPlayerId);

  const fogActive =
    (state?.fog?.length || 0) > 0 && layerVisible('fog');

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
      intent('layer:update', { id: 'background', visible: true });
      intent('layer:active', { id: 'background' });
      setTool('pan');
      playCyberSound('confirm', { volume: 0.4 });
    } catch {
      playCyberSound('deny', { volume: 0.4 });
    } finally {
      setUploadingBg(false);
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  const importUvtt = async (file: File) => {
    if (!isGm || !file) return;
    setImportingUvtt(true);
    try {
      const content = await file.text();
      const res = await fetch(apiUrl('/api/vtt/import/uvtt'), {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          content,
          name: file.name.replace(/\.(dd2vtt|df2vtt|uvtt)$/i, ''),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || json?.error || 'uvtt import failed');
      }
      intent('map:import-uvtt', {
        map: json.map,
        walls: json.walls,
        lights: json.lights,
        stats: json.stats,
        replaceWalls: true,
        replaceLights: true,
        resetFog: true,
      });
      setScanToast(
        `UVTT · ${json.map?.width}×${json.map?.height} · ${json.stats?.wallSegments ?? 0} paredes · ${json.stats?.lights ?? 0} luzes`,
      );
      window.setTimeout(() => setScanToast(null), 3600);
      playCyberSound('confirm', { volume: 0.45 });
    } catch {
      playCyberSound('deny', { volume: 0.45 });
      setScanToast('Falha ao importar Universal VTT');
      window.setTimeout(() => setScanToast(null), 2800);
    } finally {
      setImportingUvtt(false);
      if (uvttInputRef.current) uvttInputRef.current.value = '';
    }
  };

  const paintFog = (e: React.MouseEvent) => {
    if (!isGm || tool !== 'fog' || layerLocked('fog')) return;
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

  const mapW = Math.max(10, Math.min(80, Number(state?.map?.width) || 30));
  const mapH = Math.max(10, Math.min(80, Number(state?.map?.height) || 20));
  const stageW = mapW * GRID;
  const stageH = mapH * GRID;
  const currentFloor = state?.floor ?? 0;
  const viewMode: ViewMode =
    localViewMode || state?.viewMode || 'normal';

  const netEditLinks = useMemo(
    () => isGm && viewMode === 'net' && gmTab === 'map' && netWireMode,
    [isGm, viewMode, gmTab, netWireMode],
  );

  const myRosterChar = useMemo(() => {
    if (selectedChar) return selectedChar;
    return (
      roster.find((c) => Number(c.playerId) === Number(myPlayerId)) || null
    );
  }, [selectedChar, roster, myPlayerId]);

  const hasOptics = !!(
    myRosterChar?.sheetSummary?.hasOptics ||
    (Array.isArray(myRosterChar?.sheetSummary?.opticsChrome) &&
      (myRosterChar?.sheetSummary?.opticsChrome?.length ?? 0) > 0)
  );
  const hasNetDeck = useMemo(() => {
    if (myRosterChar?.sheetSummary?.hasNetDeck) return true;
    if (
      Array.isArray(myRosterChar?.sheetSummary?.deckChrome) &&
      (myRosterChar?.sheetSummary?.deckChrome?.length ?? 0) > 0
    ) {
      return true;
    }
    const chrome = Array.isArray(myRosterChar?.sheetSummary?.chrome)
      ? myRosterChar!.sheetSummary!.chrome
      : [];
    if (
      chrome.some((n: string) =>
        /deck|cyberdeck|netrunning|ram\s*manager|interface/i.test(String(n)),
      )
    ) {
      return true;
    }
    const role = String(
      myRosterChar?.role || myRosterChar?.sheetSummary?.role || '',
    ).toLowerCase();
    return role.includes('net');
  }, [myRosterChar]);
  const showArHud = isGm || hasOptics;

  const canSpawnDrone = useMemo(() => {
    if (isGm) return true;
    const role = String(
      myRosterChar?.role || myRosterChar?.sheetSummary?.role || '',
    ).toLowerCase();
    return (
      role.includes('net') ||
      role.includes('tech') ||
      role.includes('runner')
    );
  }, [isGm, myRosterChar]);

  const spawnDrone = useCallback(
    (profileId: string) => {
      const parent =
        selectedTokenId &&
        state?.tokens?.find(
          (t) =>
            t.id === selectedTokenId &&
            t.kind !== 'drone' &&
            t.kind !== 'summon',
        );
      const anchor =
        parent ||
        state?.tokens?.find(
          (t) =>
            Number(t.ownerPlayerId) === Number(myPlayerId) &&
            t.kind !== 'drone' &&
            t.kind !== 'summon',
        );
      intent('drone:spawn', {
        profileId,
        x: (anchor?.x ?? 6) + 1,
        y: anchor?.y ?? 6,
        floor: currentFloor,
        parentTokenId: anchor?.id,
        characterId: myRosterChar?.id,
        role: myRosterChar?.role,
        ownerPlayerId: myPlayerId,
        controllerPlayerId: myPlayerId,
      });
      playCyberSound('ui', { volume: 0.3 });
    },
    [
      intent,
      selectedTokenId,
      state?.tokens,
      myPlayerId,
      currentFloor,
      myRosterChar,
    ],
  );

  const scanDeviceById = useMemo(() => {
    const map = new Map<string, ScanIntelTag>();
    for (const d of scanResult?.devices || []) map.set(d.id, d);
    return map;
  }, [scanResult]);

  const scanTokenById = useMemo(() => {
    const map = new Map<string, ScanIntelTag>();
    for (const t of scanResult?.tokens || []) map.set(t.id, t);
    return map;
  }, [scanResult]);

  const activateKiroshi = useCallback(
    (opts?: { bypass?: boolean }) => {
      setScanBusy(true);
      window.setTimeout(() => setScanBusy(false), 8000);
      intent('scan:activate', {
        characterId: myRosterChar?.id,
        floor: state?.floor ?? 0,
        difficulty,
        bypass: opts?.bypass === true,
      });
    },
    [intent, myRosterChar?.id, state?.floor, difficulty],
  );

  const clearScan = useCallback(() => {
    setScanResult(null);
    setLocalViewMode('normal');
    intent('view:mode', { mode: 'normal', force: isGm });
  }, [intent, isGm]);

  const openNetNode = useCallback(
    (opts: { deviceId?: string; targetTokenId?: string }) => {
      setNetBusy(true);
      window.setTimeout(() => setNetBusy(false), 8000);
      setLocalViewMode('net');
      intent('view:mode', { mode: 'net', force: isGm });
      intent('net:menu', {
        ...opts,
        tokenId: selectedTokenId || undefined,
        floor: currentFloor,
      });
    },
    [intent, isGm, selectedTokenId, currentFloor],
  );

  const onNetDevicePress = useCallback(
    (deviceId: string) => {
      if (netEditLinks) {
        if (!netLinkFrom) {
          setNetLinkFrom(deviceId);
          setSelectedNetLink(null);
          return;
        }
        if (netLinkFrom === deviceId) {
          setNetLinkFrom(null);
          return;
        }
        intent('device:link', { fromId: netLinkFrom, toId: deviceId });
        setNetLinkFrom(null);
        return;
      }
      openNetNode({ deviceId });
    },
    [netEditLinks, netLinkFrom, intent, openNetNode],
  );

  const castQuickhack = useCallback(
    (hackId: string) => {
      if (!netMenu?.ok) return;
      setNetBusy(true);
      intent('net:quickhack', {
        hackId,
        deviceId: netMenu.deviceId,
        targetTokenId: netMenu.targetTokenId,
        tokenId: netMenu.runnerTokenId,
      });
      window.setTimeout(() => {
        intent('net:menu', {
          deviceId: netMenu.deviceId,
          targetTokenId: netMenu.targetTokenId,
          tokenId: netMenu.runnerTokenId,
          floor: currentFloor,
        });
      }, 400);
    },
    [intent, netMenu, currentFloor],
  );

  const selectedToken = state?.tokens?.find((t) => t.id === selectedTokenId);
  const floorTokens = (state?.tokens || []).filter(
    (t) => (t.floor ?? 0) === currentFloor,
  );
  const floorDevices = (state?.devices || []).filter(
    (d) => (d.floor ?? 0) === currentFloor,
  );
  const netDeviceKinds = useMemo(
    () => new Set(['camera', 'terminal', 'door', 'turret', 'drone-dock']),
    [],
  );
  const visibleDevices = useMemo(() => {
    if (viewMode !== 'net') return floorDevices;
    return floorDevices.filter(
      (d) => d.hackable && netDeviceKinds.has(d.kind),
    );
  }, [viewMode, floorDevices, netDeviceKinds]);

  const netLinks = useMemo(() => {
    if (viewMode !== 'net') return [] as Array<{ a: VttDevice; b: VttDevice }>;
    const byId = new Map(visibleDevices.map((d) => [d.id, d]));
    const seen = new Set<string>();
    const links: Array<{ a: VttDevice; b: VttDevice }> = [];
    for (const d of visibleDevices) {
      for (const lid of d.linkedTo || []) {
        const other = byId.get(lid);
        if (!other) continue;
        const key = d.id < lid ? `${d.id}|${lid}` : `${lid}|${d.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        links.push({ a: d, b: other });
      }
    }
    return links;
  }, [viewMode, visibleDevices]);

  const myTokenIds = (state?.tokens || [])
    .filter(
      (t) =>
        Number(t.ownerPlayerId) === Number(myPlayerId) ||
        Number(t.controllerPlayerId) === Number(myPlayerId),
    )
    .map((t) => t.id);

  const myHumanity = selectedToken?.bars?.humanity;
  const attackerToken = useMemo(() => {
    const tid =
      state?.turnEconomy?.tokenId ||
      (selectedTokenId && myTokenIds.includes(selectedTokenId)
        ? selectedTokenId
        : null) ||
      myTokenIds[0] ||
      null;
    return (state?.tokens || []).find((t) => t.id === tid) || null;
  }, [state?.turnEconomy?.tokenId, state?.tokens, selectedTokenId, myTokenIds]);

  const aimTargetId =
    aimHoverId ||
    (selectedTokenId &&
    attackerToken &&
    selectedTokenId !== attackerToken.id
      ? selectedTokenId
      : null);
  const aimTarget = useMemo(
    () =>
      (state?.tokens || []).find((t) => t.id === aimTargetId) || null,
    [state?.tokens, aimTargetId],
  );

  const aimPreview: AimPreview | null = useMemo(() => {
    if (!aimMode || !attackerToken || !aimTarget) return null;
    return buildAimPreview(
      state?.walls || [],
      attackerToken.x,
      attackerToken.y,
      aimTarget.x,
      aimTarget.y,
    );
  }, [aimMode, attackerToken, aimTarget, state?.walls]);

  const fireAttack = useCallback(() => {
    if (!attackerToken) return;
    const targetId = aimTarget?.id || selectedTokenId;
    if (!targetId || targetId === attackerToken.id) return;
    if (aimPreview && !aimPreview.canShoot) {
      setScanToast('Fora de alcance');
      window.setTimeout(() => setScanToast(null), 2200);
      playCyberSound('deny', { volume: 0.4 });
      return;
    }
    intent('attack:macro', {
      attackerTokenId: attackerToken.id,
      targetTokenId: targetId,
      skill: 'firearms',
      label: 'Firearms',
    });
    playCyberSound('ui', { volume: 0.35 });
    setAimMode(false);
    setAimHoverId(null);
  }, [
    attackerToken,
    aimTarget,
    selectedTokenId,
    aimPreview,
    intent,
  ]);

  const rangeLabel = !ruler
    ? ''
    : (() => {
        const rb = buildAimPreview([], ruler!.x1, ruler!.y1, ruler!.x2, ruler!.y2)
          .range;
        return rangeBandLabel(rb.band, rb.penalty);
      })();

  const runnerForPanel = myRosterChar;

  useEffect(() => {
    setLeftHudCollapsed(readHudPanelPref(HUD_PREF_LEFT, false));
    setRightHudCollapsed(readHudPanelPref(HUD_PREF_RIGHT, false));
  }, []);

  const toggleLeftHud = useCallback(() => {
    setLeftHudCollapsed((v) => {
      const next = !v;
      writeHudPanelPref(HUD_PREF_LEFT, next);
      return next;
    });
  }, []);

  const toggleRightHud = useCallback(() => {
    setRightHudCollapsed((v) => {
      const next = !v;
      writeHudPanelPref(HUD_PREF_RIGHT, next);
      return next;
    });
  }, []);

  const toggleBothHuds = useCallback(() => {
    setLeftHudCollapsed((v) => {
      const next = !v;
      writeHudPanelPref(HUD_PREF_LEFT, next);
      return next;
    });
    setRightHudCollapsed((v) => {
      const next = !v;
      writeHudPanelPref(HUD_PREF_RIGHT, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setBoardSize({
        w: Math.max(280, entry.contentRect.width),
        h: Math.max(200, entry.contentRect.height),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const navPanActive = useCallback(
    () =>
      tool === 'pan' ||
      boardNavTool === 'hand' ||
      spaceHeldRef.current,
    [tool, boardNavTool],
  );

  const beginPan = useCallback(
    (clientX: number, clientY: number) => {
      if (spaceHeldRef.current) spacePanUsedRef.current = true;
      setPanning(true);
      panStart.current = {
        x: clientX,
        y: clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [pan.x, pan.y],
  );

  useEffect(() => {
    if (!panning) return;
    const onMove = (e: MouseEvent) => {
      if (!panStart.current) return;
      setPan({
        x:
          panStart.current.panX + (e.clientX - panStart.current.x),
        y:
          panStart.current.panY + (e.clientY - panStart.current.y),
      });
    };
    const endPan = () => {
      setPanning(false);
      panStart.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', endPan);
    window.addEventListener('blur', endPan);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', endPan);
      window.removeEventListener('blur', endPan);
    };
  }, [panning]);

  const sceneTitle = useMemo(() => {
    const sceneName =
      scenes.find((s) => s.id === sceneId)?.name ||
      state?.map?.name ||
      '…';
    const camp = campaign?.name || `Campanha ${campaignId}`;
    return `${sceneName} · ${camp}`;
  }, [scenes, sceneId, state?.map?.name, campaign?.name, campaignId]);

  const hudPanelsMode = useMemo(() => {
    if (!leftHudCollapsed && !rightHudCollapsed) return 'both';
    if (!leftHudCollapsed) return 'left';
    if (!rightHudCollapsed) return 'right';
    return 'none';
  }, [leftHudCollapsed, rightHudCollapsed]);

  const tokenPortraitById = useMemo(() => {
    const map: Record<string, string | null | undefined> = {};
    for (const t of state?.tokens || []) {
      map[t.id] = t.portraitUrl;
    }
    return map;
  }, [state?.tokens]);

  const bgScale = useMemo(() => {
    const s = Number(state?.map?.backgroundScale);
    if (!Number.isFinite(s) || s <= 0) return 1;
    return Math.min(3, Math.max(0.25, s));
  }, [state?.map?.backgroundScale]);

  const combatCurrent = state?.initiative?.[state?.turnIndex ?? 0];
  const combatMyTurn = useMemo(() => {
    if (!combatCurrent) return false;
    return isGm || myTokenIds.includes(combatCurrent.tokenId);
  }, [combatCurrent, isGm, myTokenIds]);

  const boardViewW = boardSize.w;
  const boardViewH = boardSize.h;

  const setViewModeShortcut = useCallback(
    (m: ViewMode) => {
      if (m !== 'scan') setScanResult(null);
      if (m !== 'net') setNetMenu(null);
      setLocalViewMode(m);
      intent('view:mode', { mode: m, force: isGm });
    },
    [intent, isGm],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el?.isContentEditable
      ) {
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        toggleBothHuds();
        return;
      }
      if (e.key === 'Escape' && spawnPlacement) {
        setSpawnPlacement(null);
        return;
      }
      if (e.key === ' ' || e.code === 'Space') {
        if (e.type === 'keydown' && !e.repeat) {
          e.preventDefault();
          spaceHeldRef.current = true;
          spacePanUsedRef.current = false;
          setSpaceHeld(true);
        }
        return;
      }
      if (e.key === 'v' || e.key === 'V') {
        setBoardNavTool('select');
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setBoardNavTool('hand');
        return;
      }
      if (selectedNetLink && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        intent('device:unlink', {
          fromId: selectedNetLink.a,
          toId: selectedNetLink.b,
        });
        setSelectedNetLink(null);
        return;
      }
      if (e.key === '1') {
        setViewModeShortcut('normal');
        return;
      }
      if (e.key === '2') {
        if (isGm || (myTokenIds.length > 0 && hasOptics)) {
          activateKiroshi(isGm ? { bypass: true } : undefined);
        }
        return;
      }
      if (e.key === '3') {
        if (isGm || (myTokenIds.length > 0 && hasNetDeck)) {
          setViewModeShortcut('net');
        }
        return;
      }
      if (e.key === '4') {
        if (isGm || myTokenIds.length > 0) setSafeVision((v) => !v);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.code !== 'Space') return;
      e.preventDefault();
      spaceHeldRef.current = false;
      setSpaceHeld(false);
      if (!spacePanUsedRef.current) {
        if (isGm) intent('initiative:next', {});
        else if (combatMyTurn) intent('initiative:delay', {});
      }
      spacePanUsedRef.current = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    isGm,
    combatMyTurn,
    intent,
    setViewModeShortcut,
    myTokenIds.length,
    hasOptics,
    hasNetDeck,
    activateKiroshi,
    toggleBothHuds,
    spawnPlacement,
    selectedNetLink,
  ]);

  const chromeBootCharacter = useMemo(() => {
    if (!myRosterChar) return null;
    return {
      id: myRosterChar.id,
      name: myRosterChar.name,
      role: myRosterChar.role,
      sheetSummary: myRosterChar.sheetSummary,
    };
  }, [myRosterChar]);

  const requestDodgeRoll = () => {
    const target =
      Number(state?.presence?.find((p) => p.role === 'player')?.playerId) ||
      myPlayerId;
    intent('roll:request', {
      toPlayerId: target,
      attr: 'dexterity',
      skill: 'athletics',
      label: 'Reflexos + Esquiva',
    });
  };

  const gmVisaoTools = isGm ? (
    <>
      <HudButton
        variant={state?.published !== false ? 'primary' : 'ghost'}
        onClick={() =>
          intent('scene:publish', { published: state?.published === false })
        }
      >
        {state?.published !== false ? 'Publicada' : 'Prep (oculta)'}
      </HudButton>
      <HudButton
        variant="ghost"
        onClick={() => intent('radio:jam', { jammed: !state?.radioJammed })}
      >
        {state?.radioJammed ? 'Rádio OK' : 'Jammer'}
      </HudButton>
    </>
  ) : null;

  const gmSpawnTools = isGm ? (
    <>
      <GmTokenSpawnList
        roster={roster}
        npcs={campaignNpcs}
        onTableCharacterIds={onTableCharacterIds}
        placement={spawnPlacement}
        onSelectPlacement={setSpawnPlacement}
      />
      <HudButton onClick={spawnRoster}>Spawn roster (todos)</HudButton>
      <HudButton
        variant="ghost"
        onClick={() =>
          intent('token:add', {
            name: 'NPC',
            kind: 'npc',
            affiliation: 'Unknown',
            arThreat: 'med',
            visibleWeapons: ['Sidearm (visible)'],
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
  ) : null;

  const gmDeviceTools = (
    <>
      <HudButton
        variant="ghost"
        onClick={() =>
          intent('device:add', {
            kind: 'camera',
            x: 6,
            y: 6,
            name: 'camera',
            floor: currentFloor,
          })
        }
      >
        + Câmera
      </HudButton>
      <HudButton
        variant="ghost"
        onClick={() =>
          intent('device:add', {
            kind: 'terminal',
            x: 6,
            y: 6,
            name: 'terminal',
            floor: currentFloor,
          })
        }
      >
        + Terminal
      </HudButton>
      <HudButton
        variant="ghost"
        onClick={() =>
          intent('device:add', {
            kind: 'turret',
            x: 6,
            y: 6,
            name: 'turret',
            floor: currentFloor,
          })
        }
      >
        + Torreta
      </HudButton>
      <HudButton
        variant="ghost"
        onClick={() =>
          intent('device:add', {
            kind: 'door',
            x: 6,
            y: 6,
            name: 'door',
            floor: currentFloor,
          })
        }
      >
        + Porta
      </HudButton>
      <HudButton variant="ghost" onClick={() => intent('breach:start', {})}>
        Breach
      </HudButton>
      {canSpawnDrone && (
        <>
          {(
            [
              ['watcher', 'Watcher'],
              ['scout', 'Scout'],
              ['combat', 'Combat'],
              ['tech-bot', 'Tech-bot'],
              ['summon-ice', 'ICE summon'],
            ] as const
          ).map(([id, label]) => (
            <HudButton
              key={id}
              variant="ghost"
              onClick={() => spawnDrone(id)}
            >
              {label}
            </HudButton>
          ))}
        </>
      )}
    </>
  );

  const gmAlertTools = (
    <>
      <HudButton
        variant="ghost"
        onClick={() =>
          intent('clock:set', {
            label: 'Patrulha',
            value: 0,
            max: 4,
          })
        }
      >
        + Relógio
      </HudButton>
      <HudButton
        variant="ghost"
        onClick={() => intent('objective:set', { text: 'Novo objetivo' })}
      >
        + Objetivo
      </HudButton>
      <HudButton variant="ghost" onClick={requestDodgeRoll}>
        Pedir rolagem
      </HudButton>
    </>
  );

  const gmMapTools = (
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
            setFogRadius(Math.min(5, Math.max(0, Number(e.target.value) || 0)))
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
      <HudButton variant="ghost" onClick={() => intent('fog:blank', {})}>
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
        onClick={() => {
          const next = tool === 'pan' ? 'select' : 'pan';
          setTool(next);
          if (next === 'pan') setBoardNavTool('select');
        }}
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
      <HudButton
        variant="ghost"
        disabled={importingUvtt}
        onClick={() => uvttInputRef.current?.click()}
        title="Universal VTT (.dd2vtt / .uvtt / .df2vtt)"
      >
        {importingUvtt ? 'UVTT…' : 'Import UVTT'}
      </HudButton>
      <input
        ref={uvttInputRef}
        type="file"
        accept=".dd2vtt,.df2vtt,.uvtt,application/json"
        className={styles.hiddenInput}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importUvtt(f);
        }}
      />
      {mapBgSrc && (
        <>
          <label className={styles.inlineLabel}>
            Escala BG
            <input
              type="range"
              min={0.25}
              max={3}
              step={0.05}
              value={bgScale}
              onChange={(e) =>
                intent('map:background', {
                  backgroundScale: Number(e.target.value),
                })
              }
              aria-label="Escala do background"
            />
            <span className={styles.scaleHint}>{bgScale.toFixed(2)}×</span>
          </label>
          <HudButton
            variant="ghost"
            onClick={() => intent('map:background', { url: null })}
          >
            Limpar BG
          </HudButton>
        </>
      )}
      {viewMode === 'net' && (
        <HudButton
          variant={netWireMode ? 'primary' : 'ghost'}
          onClick={() => {
            setNetWireMode((v) => !v);
            setNetLinkFrom(null);
            setSelectedNetLink(null);
          }}
          title="Modo cabeamento — clique em dois nós para ligar"
        >
          {netWireMode ? 'Cabear NET (ativo)' : 'Cabear NET'}
        </HudButton>
      )}
      {netLinkFrom ? (
        <span className={styles.wireHint}>Nó A · clique no nó B</span>
      ) : null}
    </>
  );

  const gmSceneTabTools = (
    <>
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
      <HudButton variant="ghost" onClick={() => intent('initiative:next', {})}>
        Próximo turno
      </HudButton>
      <HudButton
        variant="ghost"
        onClick={() => intent('radio:set', { station: 'watson-fm' })}
      >
        Rádio
      </HudButton>
    </>
  );

  const gmHandoutRow =
    isGm && gmTab === 'scene' ? (
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
    ) : null;

  return (
    <PageFrame>
      <ChromeBootSequence
        active={chromeBootOpen}
        character={chromeBootCharacter}
        onDone={() => setChromeBootOpen(false)}
      />
      <div
        className={styles.boardRoot}
        data-view={viewMode}
        data-panels={hudPanelsMode}
        data-sandy={sandyFx ? '1' : '0'}
        data-aim={aimMode ? '1' : '0'}
        data-humanity={
          myHumanity == null
            ? undefined
            : myHumanity <= 2
              ? 'critical'
              : myHumanity <= 5
                ? 'low'
                : 'ok'
        }
      >
        <TableTopHud
          sceneTitle={sceneTitle}
          roleLabel={`${isGm ? 'GM' : 'Player'} · ${myName}`}
          isGm={isGm}
          viewMode={viewMode}
          floor={currentFloor}
          jammed={!!state?.radioJammed}
          published={state?.published !== false}
          clocks={state?.threatClocks || []}
          objectives={state?.objectives || []}
          safeVision={safeVision}
          hasOptics={hasOptics}
          hasNetDeck={hasNetDeck}
          hasTokenOnTable={myTokenIds.length > 0}
          scanTier={scanResult?.ok ? scanResult.tier : null}
          scanBusy={scanBusy}
          radioStation={state?.radioStation}
          onViewMode={setViewModeShortcut}
          onFloor={(f) => intent('floor:set', { floor: f })}
          onSafeVision={setSafeVision}
          onKiroshiScan={activateKiroshi}
          onClearScan={clearScan}
          onToggleObjective={(id, done) =>
            intent('objective:set', { id, done })
          }
        />

        <FloatingHudPanel
          side="left"
          title="Runner"
          collapsed={leftHudCollapsed}
          onToggle={toggleLeftHud}
        >
          <div className={styles.floatPanelInner}>
            <RunnerPanel
              character={runnerForPanel}
              difficulty={difficulty}
              onOpenSheet={() => setSheetPopupOpen(true)}
              onRoll={(opts) => {
                if (runnerForPanel) setSelectedCharId(runnerForPanel.id);
                rollDice(opts);
              }}
              onChrome={(name) => {
                const tid =
                  state?.tokens?.find(
                    (t) =>
                      Number(t.ownerPlayerId) === Number(myPlayerId) ||
                      Number(t.controllerPlayerId) === Number(myPlayerId),
                  )?.id || selectedTokenId;
                if (!tid) return;
                intent('chrome:activate', {
                  tokenId: tid,
                  chrome: name,
                });
                playCyberSound('ui', { volume: 0.3 });
              }}
            />
            <div className={styles.diceHints}>
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
          </div>
        </FloatingHudPanel>

        <div className={styles.boardLayer}>
          <div className={styles.stageBody}>
            <div className={styles.sceneDock}>
              <SceneBar
                scenes={scenes}
                activeSceneId={activeSceneId}
                currentSceneId={sceneId}
                isGm={isGm}
                busy={scenesBusy}
                onSelect={(id) => switchToScene(id)}
                onCreate={(name, copy) => void createScene(name, !!copy)}
                onRename={(id, name) => void renameScene(id, name)}
                onActivate={(id) => void activateScene(id)}
                onDelete={(id) => void deleteScene(id)}
              />
            </div>
          {scanToast && (
            <div className={styles.scanToast} role="status">
              {scanToast}
            </div>
          )}
          {netMenu && (
            <QuickhackMenu
              menu={netMenu}
              busy={netBusy}
              onCast={castQuickhack}
              onClose={() => setNetMenu(null)}
              onRecharge={() =>
                intent('net:recharge', {
                  tokenId: netMenu.runnerTokenId || selectedTokenId,
                })
              }
            />
          )}

            <GmToolBar
              isGm={isGm}
              gmTab={gmTab}
              onGmTab={setGmTab}
              visaoTools={gmVisaoTools}
              spawnTools={gmSpawnTools}
              deviceTools={gmDeviceTools}
              alertTools={gmAlertTools}
              mapTools={gmMapTools}
              sceneTabTools={gmSceneTabTools}
              handoutRow={gmHandoutRow}
            />

          {selectedToken && (
            <div className={`${styles.selectionBar} ${styles.boardTools}`}>
              Selecionado: <strong>{selectedToken.name}</strong>
              {selectedToken.kind ? ` · ${selectedToken.kind}` : ''}
              {selectedToken.bars?.battery != null
                ? ` · BAT ${selectedToken.bars.battery}/${selectedToken.bars.batteryMax ?? '?'}`
                : ''}
              {selectedToken.bars?.signal != null
                ? ` · SIG ${selectedToken.bars.signal}%`
                : ''}
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
              {canEmitTokenEmoteOn(selectedToken) && (
                <TokenEmotePicker
                  cooldownUntil={tokenEmoteCooldownUntil}
                  onEmote={(id) => fireTokenEmote(selectedToken.id, id)}
                />
              )}
            </div>
          )}

          <div
            ref={canvasWrapRef}
            className={styles.canvasWrap}
            onWheel={onWheel}
          >
            <BoardNavToolbar
              tool={boardNavTool}
              onTool={(t) => {
                setBoardNavTool(t);
                if (t === 'hand' && tool !== 'fog' && tool !== 'wall') {
                  setTool('select');
                }
              }}
            />
            <DiceGlitchOverlay
              active={diceOverlay.active}
              reveal={diceOverlay.reveal}
              queued={diceOverlay.queued}
              onDone={completeDiceRoll}
              onVerdict={(verdict) => {
                playCyberSound(
                  verdict === 'botch' || verdict === 'failure'
                    ? 'deny'
                    : 'confirm',
                  { volume: 0.6 },
                );
              }}
            />
            <div
              ref={stageRef}
              className={styles.mapStage}
              data-spawn-place={spawnPlacement ? '1' : '0'}
              data-nav-tool={boardNavTool}
              data-tool={tool}
              data-space-pan={spaceHeld ? '1' : '0'}
              data-panning={panning ? '1' : '0'}
              style={{
                width: boardViewW,
                height: boardViewH,
              }}
              onContextMenu={(e) => e.preventDefault()}
              onDragOver={(e) => {
                if (!isGm) return;
                if (
                  e.dataTransfer.types.includes(VTT_SPAWN_DRAG_MIME) ||
                  e.dataTransfer.types.includes('text/plain')
                ) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }
              }}
              onDrop={(e) => {
                if (!isGm) return;
                e.preventDefault();
                const raw =
                  e.dataTransfer.getData(VTT_SPAWN_DRAG_MIME) ||
                  e.dataTransfer.getData('text/plain');
                const payload = parseSpawnDragPayload(raw);
                if (!payload) return;
                const c = cellFromClient(e.clientX, e.clientY);
                placeSpawnToken(payload, c.x, c.y);
              }}
              onMouseDown={(e) => {
                if (
                  isGm &&
                  spawnPlacement &&
                  e.button === 0 &&
                  !e.shiftKey &&
                  tool !== 'fog' &&
                  tool !== 'wall' &&
                  tool !== 'pan' &&
                  boardNavTool !== 'hand' &&
                  !spaceHeldRef.current
                ) {
                  const c = cellFromEvent(e);
                  placeSpawnToken(spawnPlacement, c.x, c.y);
                  return;
                }
                if (e.shiftKey) {
                  const c = cellFromEvent(e);
                  setRuler({ x1: c.x, y1: c.y, x2: c.x, y2: c.y });
                  return;
                }
                if (
                  e.button === 1 ||
                  (e.button === 0 && navPanActive())
                ) {
                  beginPan(e.clientX, e.clientY);
                  return;
                }
                if (isGm && tool === 'fog') {
                  lastFogCell.current = null;
                  paintFog(e);
                  return;
                }
                if (isGm && tool === 'wall' && !layerLocked('walls')) {
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
                if (panning) return;
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
                lastFogCell.current = null;
              }}
              onMouseLeave={() => {
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
                {mapBgSrc && layerVisible('background') && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mapBgSrc}
                    alt=""
                    className={styles.mapBackground}
                    style={{
                      transform: `scale(${bgScale})`,
                      transformOrigin: '0 0',
                    }}
                    draggable={false}
                  />
                )}
                <svg
                  className={styles.gridSvg}
                  width={stageW}
                  height={stageH}
                  data-layer="board"
                >
                  {layerVisible('grid') &&
                    Array.from({ length: mapH }).map((_, y) =>
                      Array.from({ length: mapW }).map((__, x) => (
                        <rect
                          key={`${x}-${y}`}
                          x={x * GRID}
                          y={y * GRID}
                          width={GRID}
                          height={GRID}
                          className={
                            mapBgSrc && layerVisible('background')
                              ? styles.cellOverBg
                              : styles.cell
                          }
                        />
                      )),
                    )}
                  {layerVisible('walls') &&
                    (state?.walls || []).map((w) => (
                      <line
                        key={w.id}
                        x1={w.x1 * GRID + GRID / 2}
                        y1={w.y1 * GRID + GRID / 2}
                        x2={w.x2 * GRID + GRID / 2}
                        y2={w.y2 * GRID + GRID / 2}
                        className={
                          w.door
                            ? w.open
                              ? styles.wallDoorOpen
                              : styles.wallDoor
                            : styles.wall
                        }
                      />
                    ))}
                  {(state?.lights || []).map((l) => {
                    const color = l.color
                      ? l.color.length === 8
                        ? `#${l.color.slice(2)}`
                        : l.color.startsWith('#')
                          ? l.color
                          : `#${l.color}`
                      : '#fed33f';
                    const r = Math.max(0.5, l.radius) * GRID;
                    const cx = l.x * GRID + GRID / 2;
                    const cy = l.y * GRID + GRID / 2;
                    const opacity = Math.max(
                      0.12,
                      Math.min(0.45, (l.intensity ?? 0.7) * 0.4),
                    );
                    return (
                      <g key={l.id} className={styles.lightMark}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill={color}
                          opacity={opacity}
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={color}
                          opacity={0.9}
                        />
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
                  {aimMode && attackerToken && (
                    <AimOverlay
                      grid={GRID}
                      attacker={attackerToken}
                      target={aimTarget}
                      preview={aimPreview}
                      showRings
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
                {viewMode === 'net' && (
                  <svg
                    className={styles.netLinkLayer}
                    data-edit={netEditLinks ? '1' : '0'}
                    width={stageW}
                    height={stageH}
                  >
                    {netLinks.map(({ a, b }) => {
                      const linkKey =
                        a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
                      const selected =
                        selectedNetLink &&
                        ((selectedNetLink.a === a.id &&
                          selectedNetLink.b === b.id) ||
                          (selectedNetLink.a === b.id &&
                            selectedNetLink.b === a.id));
                      return (
                        <line
                          key={linkKey}
                          x1={a.x * GRID + GRID / 2}
                          y1={a.y * GRID + GRID / 2}
                          x2={b.x * GRID + GRID / 2}
                          y2={b.y * GRID + GRID / 2}
                          className={styles.netLinkLine}
                          data-selected={selected ? '1' : '0'}
                          onClick={(e) => {
                            if (!netEditLinks) return;
                            e.stopPropagation();
                            setSelectedNetLink({ a: a.id, b: b.id });
                          }}
                          onContextMenu={(e) => {
                            if (!netEditLinks) return;
                            e.preventDefault();
                            e.stopPropagation();
                            intent('device:unlink', {
                              fromId: a.id,
                              toId: b.id,
                            });
                            setSelectedNetLink(null);
                          }}
                        />
                      );
                    })}
                  </svg>
                )}
                <div className={styles.deviceLayer} data-view={viewMode}>
                  {visibleDevices.map((d) => {
                    const intel = scanDeviceById.get(d.id);
                    const showScan = viewMode === 'scan' && !!intel;
                    const netNode = viewMode === 'net' && d.hackable;
                    const body = (
                      <>
                        <span>{d.kind.slice(0, 3).toUpperCase()}</span>
                        {showScan && intel?.tag && (
                          <span
                            className={styles.scanTag}
                            data-threat={intel.threat || ''}
                          >
                            {intel.tag}
                          </span>
                        )}
                        {netNode && (
                          <span className={styles.netTag}>
                            A{d.accessLevel ?? 1}
                            {d.jammed ? ' · JAM' : ''}
                            {d.open ? ' · OPEN' : ''}
                          </span>
                        )}
                      </>
                    );
                    const shared = {
                      className: styles.device,
                      'data-kind': d.kind,
                      'data-hackable': d.hackable ? '1' : '0',
                      'data-scan': showScan ? '1' : '0',
                      'data-net': netNode ? '1' : '0',
                      'data-jammed': d.jammed ? '1' : '0',
                      'data-open': d.open ? '1' : '0',
                      'data-threat': intel?.threat || d.threat || '',
                      style: {
                        left: d.x * GRID,
                        top: d.y * GRID,
                        width: GRID,
                        height: GRID,
                      } as React.CSSProperties,
                      title:
                        intel?.tag ||
                        `${d.name} · ${d.kind} · A${d.accessLevel ?? 1}${
                          d.jammed ? ' · JAM' : ''
                        }`,
                    };
                    if (netNode) {
                      return (
                        <button
                          key={d.id}
                          type="button"
                          {...shared}
                          onClick={(e) => {
                            e.stopPropagation();
                            onNetDevicePress(d.id);
                          }}
                        >
                          {body}
                        </button>
                      );
                    }
                    return (
                      <div key={d.id} {...shared}>
                        {body}
                      </div>
                    );
                  })}
                </div>
                <div
                  className={styles.tokenLayer}
                  style={{
                    display: layerVisible('tokens') ? undefined : 'none',
                  }}
                >
                  <TokenEmoteBubbles
                    items={tokenEmoteBubbles}
                    grid={GRID}
                    floor={currentFloor}
                  />
                  {(viewMode === 'net'
                    ? floorTokens.filter(
                        (t) =>
                          t.kind === 'drone' ||
                          myTokenIds.includes(t.id),
                      )
                    : floorTokens
                  ).map((t) => {
                    const turn =
                      state?.initiative?.[state.turnIndex || 0]?.tokenId ===
                      t.id;
                    const selected = selectedTokenId === t.id;
                    const portrait =
                      resolveMediaSrc(t.portraitUrl) || t.portraitUrl || null;
                    const mine = canDragToken(t);
                    const intel = scanTokenById.get(t.id);
                    const scanHot =
                      viewMode === 'scan' &&
                      (!!intel ||
                        t.hidden ||
                        (t.auras || []).length > 0);
                    const showNameplate = tokenShowsNameplate(t, {
                      showAr: showArHud,
                      myPlayerId,
                    });
                    const labelText = showNameplate
                      ? (t.arIntel?.name || t.name || '').trim()
                      : '';
                    const arIntel =
                      showArHud && t.arIntel ? t.arIntel : null;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        className={styles.token}
                        data-turn={turn ? '1' : '0'}
                        data-selected={selected ? '1' : '0'}
                        data-mine={mine ? '1' : '0'}
                        data-hidden={t.hidden ? '1' : '0'}
                        data-scan={scanHot ? '1' : '0'}
                        data-threat={intel?.threat || ''}
                        data-aura={(t.auras || [])[0] || ''}
                        style={{
                          left: t.x * GRID,
                          top: t.y * GRID,
                          width: GRID,
                          height: GRID,
                          ['--token-color' as string]: t.color,
                        }}
                        onMouseEnter={() => {
                          if (aimMode) setAimHoverId(t.id);
                        }}
                        onMouseLeave={() => {
                          if (aimMode && aimHoverId === t.id) {
                            setAimHoverId(null);
                          }
                        }}
                        onMouseDown={(e) => {
                          if (
                            e.button === 0 &&
                            (tool === 'pan' ||
                              boardNavTool === 'hand' ||
                              spaceHeldRef.current)
                          ) {
                            return;
                          }
                          e.stopPropagation();
                          if (e.button !== 0) return;
                          setSelectedTokenId(t.id);
                          setCtxMenu(null);
                          if (aimMode) {
                            if (
                              attackerToken &&
                              t.id !== attackerToken.id
                            ) {
                              setAimHoverId(t.id);
                              if (e.detail >= 2) {
                                window.setTimeout(() => fireAttack(), 0);
                              }
                            }
                            return;
                          }
                          if (
                            viewMode === 'net' &&
                            t.kind === 'drone' &&
                            !myTokenIds.includes(t.id)
                          ) {
                            openNetNode({ targetTokenId: t.id });
                            return;
                          }
                          if (
                            !mine ||
                            boardNavTool !== 'select' ||
                            tool !== 'select'
                          ) {
                            return;
                          }
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
                        aria-label={labelText || tAr('unknownToken')}
                        title={
                          viewMode === 'net' && t.kind === 'drone'
                            ? `${t.name} · drone · quickhack`
                            : arIntel
                              ? `${arIntel.name}${arIntel.affiliation ? ` · ${arIntel.affiliation}` : ''}`
                              : intel?.tag || labelText || tAr('unknownToken')
                        }
                        data-ar={arIntel ? '1' : '0'}
                        data-net={
                          viewMode === 'net' &&
                          (t.kind === 'drone' || t.kind === 'summon')
                            ? '1'
                            : '0'
                        }
                        data-drone={
                          t.kind === 'drone' || t.kind === 'summon' ? '1' : '0'
                        }
                        data-signal={
                          t.bars?.signal == null
                            ? ''
                            : t.bars.signal <= 0
                              ? 'lost'
                              : t.bars.signal <= 55
                                ? 'weak'
                                : 'ok'
                        }
                      >
                        {portrait ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={portrait} alt="" draggable={false} />
                        ) : (
                          <span className={styles.tokenInitial}>
                            {(
                              labelText ||
                              (!isArTargetToken(t) ? t.name : '') ||
                              ''
                            )
                              .slice(0, 2)
                              .toUpperCase() || '·'}
                          </span>
                        )}
                        {arIntel ? <TokenArHud intel={arIntel} /> : null}
                        {showNameplate && labelText && !arIntel ? (
                          <span className={styles.tokenName}>
                            {labelText.slice(0, 8)}
                          </span>
                        ) : null}
                        {viewMode === 'scan' && (
                          <span
                            className={styles.scanTag}
                            data-threat={intel?.threat || ''}
                          >
                            {intel?.tag || t.kind || 'host'}
                          </span>
                        )}
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
                        {(t.kind === 'drone' || t.kind === 'summon') &&
                          t.bars?.batteryMax != null && (
                            <span
                              className={styles.tokenBat}
                              style={{
                                width: `${
                                  (Number(t.bars.battery) /
                                    Math.max(1, t.bars.batteryMax)) *
                                  100
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
              {rangeLabel ? ` (${rangeLabel})` : ''}
              {` · layer:${activeLayer} · view:${viewMode} · F${currentFloor}`}
              {tool !== 'select' ? ` · tool:${tool}` : ''}
              {tool === 'fog' ? ` · fog:${fogMode} r${fogRadius}` : ''}
              {state?.radioStation ? ` · ${state.radioStation}` : ''}
              {mapBgSrc
                ? layerVisible('background')
                  ? ' · bg'
                  : ' · bg(off)'
                : ''}
              {aimMode
                ? ` · MIRA${aimPreview ? ` · ${aimPreview.summary}` : ''}`
                : ''}
            </div>
          </div>
          <div className={styles.bottomChrome}>
            <InitiativeTimeline
              visible={initiativeTimelineVisible}
              combatActive={!!state?.combat?.active}
              round={state?.combat?.round || 1}
              turnIndex={state?.turnIndex || 0}
              initiative={state?.initiative || []}
              tokenPortraitById={tokenPortraitById}
              myTokenIds={myTokenIds}
              isGm={isGm}
              onToggleVisible={toggleInitiativeTimeline}
              onNext={() => intent('initiative:next', {})}
            />
            <CombatHotbar
              docked
              combatActive={!!state?.combat?.active}
              round={state?.combat?.round || 1}
              currentTurnName={combatCurrent?.name}
              myTurn={combatMyTurn}
              isGm={isGm}
              aimMode={aimMode}
              aimReady={!!aimPreview?.canShoot}
              aimSummary={aimPreview?.summary || null}
              canNet={isGm || (myTokenIds.length > 0 && hasNetDeck)}
              canShoot={
                !!state?.combat?.active &&
                (combatMyTurn || isGm) &&
                (!!selectedTokenId || !!aimTarget)
              }
              onShoot={() => {
                if (!aimMode) {
                  setAimMode(true);
                  setAimHoverId(null);
                  playCyberSound('ui', { volume: 0.25 });
                  return;
                }
                fireAttack();
              }}
              onQuickhack={() => setViewModeShortcut('net')}
              onDodge={() =>
                rollDice({
                  attr: 'dexterity',
                  skill: 'athletics',
                  label: 'Reflexos + Esquiva',
                })
              }
              onUseItem={() => {}}
              onPassTurn={() => {
                if (isGm) intent('initiative:next', {});
                else if (combatMyTurn) intent('initiative:delay', {});
              }}
            />
          </div>
          </div>
        </div>

        <FloatingHudPanel
          side="right"
          title="Mesa / Chat"
          collapsed={rightHudCollapsed}
          onToggle={toggleRightHud}
        >
          <div className={`${styles.side} ${styles.sideStack}`}>
            <ReactionBar
              onReact={(id: ReactionId) => {
                intent('chat:emote', { emote: id });
                playCyberSound('ui', { volume: 0.3 });
              }}
            />
            <HudPanel title="Combate" className={styles.combatDock}>
              <CombatHud
                isGm={isGm}
                combatActive={!!state?.combat?.active}
                round={state?.combat?.round || 1}
                turnIndex={state?.turnIndex || 0}
                initiative={state?.initiative || []}
                turnEconomy={state?.turnEconomy}
                myTokenIds={myTokenIds}
                onStart={() => intent('combat:start', {})}
                onRollAll={() =>
                  intent('initiative:roll-all', { floor: currentFloor })
                }
                onNext={() => intent('initiative:next', {})}
                onDelay={() => intent('initiative:delay', {})}
                onHold={() => intent('initiative:hold', {})}
                onEnd={() => intent('combat:end', {})}
                onAction={(kind) => intent('turn:action', { kind })}
                aimMode={aimMode}
                aimSummary={aimPreview?.summary || null}
                aimReady={!!aimPreview?.canShoot}
                onToggleAim={() => {
                  setAimMode((v) => !v);
                  setAimHoverId(null);
                  playCyberSound('ui', { volume: 0.25 });
                }}
                onAttack={() => {
                  if (!aimMode) {
                    setAimMode(true);
                    playCyberSound('ui', { volume: 0.25 });
                    return;
                  }
                  fireAttack();
                }}
                onSandy={() => {
                  const tid =
                    state?.turnEconomy?.tokenId ||
                    selectedTokenId ||
                    myTokenIds[0];
                  if (!tid) return;
                  intent('chrome:activate', {
                    tokenId: tid,
                    chrome: 'sandevistan',
                  });
                }}
              />
            </HudPanel>
          {selectedToken &&
            (selectedToken.kind === 'drone' ||
              selectedToken.kind === 'summon') && (
              <HudPanel title="Drone / Summon">
                <DroneHud
                  drone={selectedToken}
                  presence={state?.presence || []}
                  isGm={isGm}
                  canControl={
                    isGm ||
                    Number(selectedToken.ownerPlayerId) ===
                      Number(myPlayerId) ||
                    Number(selectedToken.controllerPlayerId) ===
                      Number(myPlayerId)
                  }
                  onAssign={(controllerPlayerId) =>
                    intent('drone:assign', {
                      tokenId: selectedToken.id,
                      controllerPlayerId,
                      parentTokenId:
                        state?.tokens?.find(
                          (t) =>
                            Number(t.ownerPlayerId) ===
                              Number(controllerPlayerId) &&
                            t.kind !== 'drone' &&
                            t.kind !== 'summon',
                        )?.id || selectedToken.parentTokenId,
                    })
                  }
                  onRecharge={() =>
                    intent('drone:recharge', { tokenId: selectedToken.id })
                  }
                  onJam={(jammed) =>
                    intent('drone:jam', {
                      tokenId: selectedToken.id,
                      jammed,
                    })
                  }
                  onRefresh={() => intent('drone:refresh', {})}
                />
              </HudPanel>
            )}
          {isGm && (
            <HudPanel title="Notas GM">
              <GmNotesPanel
                sceneNotes={sceneNotesDraft}
                tokenName={selectedToken?.name || null}
                tokenNotes={tokenNotesDraft}
                onSceneNotesChange={setSceneNotesDraft}
                onTokenNotesChange={setTokenNotesDraft}
                onSceneNotesCommit={(text) =>
                  intent('gmnotes:set', { scope: 'scene', text })
                }
                onTokenNotesCommit={(text) => {
                  if (!selectedTokenId) return;
                  intent('gmnotes:set', {
                    tokenId: selectedTokenId,
                    text,
                  });
                }}
              />
            </HudPanel>
          )}
          <HudPanel title="Camadas">
            <LayersPanel
              layers={layers}
              activeLayer={activeLayer}
              isGm={isGm}
              onActivate={activateLayer}
              onToggleVisible={(id, visible) =>
                intent('layer:update', { id, visible })
              }
              onToggleLocked={(id, locked) =>
                intent('layer:update', { id, locked })
              }
            />
            <p className={styles.layerHint}>
              Clique no nome para ativar · VIS mostra/oculta · LCK trava edição
            </p>
          </HudPanel>
          <HudPanel title="Presença">
            <ul className={styles.plainList}>
              {(state?.presence || []).map((p, i) => (
                <li key={`${p.playerId}-${i}`}>
                  {p.name} ({p.role})
                  {presenceMood[Number(p.playerId)] ? (
                    <span className={styles.moodTag}>
                      {' '}
                      · {presenceMood[Number(p.playerId)]}
                    </span>
                  ) : null}
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

          {replay.length > 0 && (
            <HudPanel
              title="Braindance replay"
              className={styles.replayPanel}
            >
              <div className={styles.replayHead}>
                <p>{replay.length} eventos</p>
                <HudButton
                  variant="ghost"
                  onClick={() => setReplay([])}
                >
                  Fechar
                </HudButton>
              </div>
              <ul className={styles.replay}>
                {replay.slice(-40).map((e) => (
                  <li key={e.id}>
                    {e.at?.slice(11, 19)} — {e.type}
                  </li>
                ))}
              </ul>
            </HudPanel>
          )}

          <HudPanel
            title="Chat / Dice"
            className={styles.chatPanel}
            bodyClassName={styles.chatPanelBody}
          >
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
                      {m.kind === 'attack' &&
                        lastAttack?.id === m.id &&
                        lastAttack?.damage?.successes > 0 &&
                        lastAttack?.targetTokenId &&
                        isGm && (
                          <HudButton
                            variant="ghost"
                            onClick={() =>
                              intent('token:damage', {
                                tokenId: lastAttack.targetTokenId,
                                amount: lastAttack.damage.successes,
                                fromAttack: true,
                              })
                            }
                          >
                            Aplicar dano
                          </HudButton>
                        )}
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
          </div>
        </FloatingHudPanel>
      </div>

      <EmoteToasts items={emoteToasts} />

      {pendingRoll && (
        <div className={styles.rollRequest} role="dialog" aria-live="polite">
          <p>
            {pendingRoll.fromName} pede:{' '}
            <strong>{pendingRoll.label}</strong>
          </p>
          <div className={styles.diceHints}>
            <HudButton
              onClick={() => {
                rollDice({
                  attr: pendingRoll.attr,
                  skill: pendingRoll.skill,
                  label: pendingRoll.label,
                });
                intent('roll:request-ack', { id: pendingRoll.id });
                setPendingRoll(null);
              }}
            >
              Rolar agora
            </HudButton>
            <HudButton
              variant="ghost"
              onClick={() => {
                intent('roll:request-ack', { id: pendingRoll.id });
                setPendingRoll(null);
              }}
            >
              Depois
            </HudButton>
          </div>
        </div>
      )}

      {sheetPopupOpen && runnerForPanel && (
        <RunnerSheetPopup
          character={runnerForPanel}
          onClose={() => setSheetPopupOpen(false)}
          onRoll={(opts) => {
            setSelectedCharId(runnerForPanel.id);
            rollDice(opts);
          }}
        />
      )}

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
          {(() => {
            const t = state?.tokens?.find((x) => x.id === ctxMenu.tokenId);
            const isDrone =
              t?.kind === 'drone' || t?.kind === 'summon';
            const canPilot =
              isGm ||
              Number(t?.ownerPlayerId) === Number(myPlayerId) ||
              Number(t?.controllerPlayerId) === Number(myPlayerId);
            const canEmote = t && canEmitTokenEmoteOn(t);
            return (
              <>
                {canEmote && (
                  <>
                    <span className={styles.ctxHeading}>
                      {tTokenEmote('ctxHeading')}
                    </span>
                    {(
                      [
                        'ok',
                        'alerta',
                        'cobertura',
                        'espera',
                      ] as TokenEmoteId[]
                    ).map((emoteId) => (
                      <button
                        key={emoteId}
                        type="button"
                        onClick={() => {
                          fireTokenEmote(ctxMenu.tokenId, emoteId);
                          setCtxMenu(null);
                        }}
                      >
                        {TOKEN_EMOTE_GLYPH[emoteId]} {tTokenEmote(`${emoteId}.short`)}
                      </button>
                    ))}
                  </>
                )}
                {isDrone && canPilot && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        intent('drone:assign', {
                          tokenId: ctxMenu.tokenId,
                          controllerPlayerId: myPlayerId,
                        });
                        setCtxMenu(null);
                      }}
                    >
                      Assumir controle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        intent('drone:recharge', {
                          tokenId: ctxMenu.tokenId,
                        });
                        setCtxMenu(null);
                      }}
                    >
                      Recarregar bateria
                    </button>
                  </>
                )}
                {isGm && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        intent('token:update', {
                          tokenId: ctxMenu.tokenId,
                          hidden: !t?.hidden,
                        });
                        setCtxMenu(null);
                      }}
                    >
                      Toggle oculto
                    </button>
                    {isDrone && (
                      <button
                        type="button"
                        onClick={() => {
                          intent('drone:jam', {
                            tokenId: ctxMenu.tokenId,
                            jammed: !t?.signalJammed,
                          });
                          setCtxMenu(null);
                        }}
                      >
                        {t?.signalJammed ? 'Limpar jam' : 'Jam sinal'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        intent('token:remove', {
                          tokenId: ctxMenu.tokenId,
                        });
                        setSelectedTokenId(null);
                        setCtxMenu(null);
                      }}
                    >
                      Remover
                    </button>
                    <button
                      type="button"
                      onClick={() => {
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
              </>
            );
          })()}
        </div>
      )}
    </PageFrame>
  );
};

export default TablePage;
