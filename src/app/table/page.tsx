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
import { GmEditShortcutsLegend } from '../../components/vtt/GmEditShortcutsLegend';
import { useTableEditHotkeys } from '../../lib/vtt/useTableEditHotkeys';
import {
  canMoveTokenForRole,
  tokenMoveBlockedHint,
} from '../../lib/vtt/turnMoveLock';
import { budgetReachableCells, canAffordMoveTo } from '../../lib/vtt/movement';
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
import { AreaTemplateOverlay } from '../../components/vtt/AreaTemplateOverlay';
import { RunnerPanel } from '../../components/vtt/RunnerPanel';
import { RunnerSheetPopup } from '../../components/vtt/RunnerSheetPopup';
import {
  ChromeTokenTrails,
  type SandyTrailGhost,
} from '../../components/vtt/ChromeTokenTrails';
import {
  chromeActivationRamCost,
  passiveChromeFx,
} from '../../lib/chromeCatalog';
import { apiUrl, authHeaders, getApiBaseUrl } from '../../lib/api';
import {
  buildAimPreview,
  chebyshev,
  rangeBandLabel,
  type AimPreview,
} from '../../lib/vttAim';
import { useCampaign } from '../../lib/campaign';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '../../lib/authSession';
import {
  clearStoredCampaignId,
  resolveAllowedCampaignId,
} from '../../lib/campaignAccess';
import { vttJoinErrorMessage } from '../../lib/vttJoinMessages';
import { useTranslations } from '../../i18n/useTranslations';
import { psychosisCriticalFromSheet } from '../../lib/vttPsychosis';
import {
  loadCharacterMacros,
  saveCharacterMacros,
  type CharacterMacro,
} from '../../lib/characterMacros';
import {
  loadTokenLibrary,
  toggleTokenLibraryStamp,
  type TokenLibraryStamp,
} from '../../lib/tokenLibrary';
import type { VttAreaTemplate } from '../../lib/vttAreaTemplates';
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
import { VttAccessGate } from '../../components/vtt/VttAccessGate';
import { GmFirstVisitHints } from '../../components/vtt/GmFirstVisitHints';
import { TokenArHud } from '../../components/vtt/TokenArHud';
import { isArTargetToken, tokenShowsNameplate } from '../../lib/vttAr';
import {
  AttackResultCard,
  type AttackResultCard as AttackCardPayload,
} from '../../components/vtt/AttackResultCard';
import { ItemQuickMenu } from '../../components/vtt/ItemQuickMenu';
import { ConditionsStrip } from '../../components/vtt/ConditionsStrip';
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
  channel?: string;
  toPlayerId?: number;
  gmOnly?: boolean;
  playerId?: number;
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
    portalId?: string;
  }>;
  areaTemplates?: VttAreaTemplate[];
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
  rules?: { tokenMoveOnTurnOnly?: boolean };
  combat?: { active: boolean; round: number; phase: string } | null;
  turnEconomy?: {
    tokenId: string;
    mainUsed: boolean;
    moveUsed: boolean;
    reactionUsed: boolean;
    extraActions: number;
  } | null;
  turnMovement?: {
    tokenId: string;
    startX: number;
    startY: number;
    remaining: number;
    max: number;
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
  const router = useRouter();
  const { campaignId, setCampaignId, campaign } = useCampaign();
  const [campaignAccessOk, setCampaignAccessOk] = useState(false);
  const [accessNotice, setAccessNotice] = useState('');
  const [campaignGate, setCampaignGate] = useState<
    'pending' | 'ok' | 'login' | 'none'
  >('pending');
  const [joinError, setJoinError] = useState('');
  const [joinPending, setJoinPending] = useState(false);
  const [scenesReady, setScenesReady] = useState(false);
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
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    null,
  );
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [gmShortcutsOpen, setGmShortcutsOpen] = useState(false);
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
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });
  const [leftHudCollapsed, setLeftHudCollapsed] = useState(false);
  const [rightHudCollapsed, setRightHudCollapsed] = useState(false);
  const [handoutBody, setHandoutBody] = useState('');
  const [handoutFrom, setHandoutFrom] = useState('Rogue');
  const [handoutTargetCharId, setHandoutTargetCharId] = useState('');
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgLoadError, setBgLoadError] = useState<string | null>(null);
  const [importingUvtt, setImportingUvtt] = useState(false);
  const [aimMode, setAimMode] = useState(false);
  const [areaPlaceKind, setAreaPlaceKind] = useState<
    'cone' | 'burst' | 'line' | null
  >(null);
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [chatChannel, setChatChannel] = useState<'all' | 'whisper' | 'gm'>(
    'all',
  );
  const [whisperTargetId, setWhisperTargetId] = useState<number | ''>('');
  const [characterMacros, setCharacterMacros] = useState<CharacterMacro[]>([]);
  const [tokenLibrary, setTokenLibrary] = useState<TokenLibraryStamp[]>([]);
  const dragGroupStartRef = useRef<Record<string, { x: number; y: number }>>(
    {},
  );
  const psychosisWarnedRef = useRef<Set<string>>(new Set());
  const { t: tP2 } = useTranslations('vtt.p2');
  const [aimHoverId, setAimHoverId] = useState<string | null>(null);
  const [sheetPopupOpen, setSheetPopupOpen] = useState(false);
  const [safeVision, setSafeVision] = useState(false);
  const [localViewMode, setLocalViewMode] = useState<ViewMode | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanBusy, setScanBusy] = useState(false);
  const [scanToast, setScanToast] = useState<string | null>(null);
  const [chromeToast, setChromeToast] = useState<string | null>(null);
  const [sandyTrailFx, setSandyTrailFx] = useState<SandyTrailGhost[]>([]);
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
  const [lastAttack, setLastAttack] = useState<AttackCardPayload | null>(null);
  const [itemMenuOpen, setItemMenuOpen] = useState(false);
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
    if (!campaignId) return;
    setTokenLibrary(loadTokenLibrary(Number(campaignId)));
  }, [campaignId]);

  useEffect(() => {
    if (!selectedCharId) {
      setCharacterMacros([]);
      return;
    }
    loadCharacterMacros(selectedCharId).then(setCharacterMacros);
  }, [selectedCharId]);

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

  useEffect(() => {
    if (!state?.tokens?.length || !roster.length) return;
    for (const t of state.tokens) {
      if (!t.characterId) continue;
      const char = roster.find((c) => String(c.id) === String(t.characterId));
      if (!char?.sheetSummary || !psychosisCriticalFromSheet(char.sheetSummary)) {
        continue;
      }
      const key = String(t.characterId);
      if (psychosisWarnedRef.current.has(key)) continue;
      psychosisWarnedRef.current.add(key);
      if (t.ownerPlayerId === myPlayerId || isGm) {
        intent('chat:message', {
          text: tP2('psychosisWarn').replace('{name}', t.name),
        });
      }
    }
  }, [state?.tokens, state?.version, roster, myPlayerId, isGm, intent, tP2]);

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
      setScenesReady(false);
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
      } finally {
        setScenesReady(true);
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
    const onClick = () => setCtxMenu(null);
    window.addEventListener('click', onClick);
    return () => {
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
    let cancelled = false;
    void (async () => {
      setCampaignAccessOk(false);
      setCampaignGate('pending');
      setJoinError('');
      if (!getAccessToken()) {
        setAccessNotice('Faça login para entrar na mesa virtual.');
        setCampaignGate('login');
        return;
      }
      const resolved = await resolveAllowedCampaignId(campaignId);
      if (cancelled) return;
      if (!resolved.campaignId) {
        clearStoredCampaignId();
        setAccessNotice(
          'Você ainda não participa de nenhuma campanha. Aceite um convite ou crie uma mesa em Campanhas.',
        );
        setCampaignGate('none');
        return;
      }
      if (resolved.campaignId !== campaignId) {
        setCampaignId(resolved.campaignId);
      }
      if (resolved.forbidden) {
        setAccessNotice(
          'A campanha salva não está mais disponível. Entramos na sua campanha ativa.',
        );
      } else {
        setAccessNotice('');
      }
      setCampaignGate('ok');
      setCampaignAccessOk(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId, setCampaignId]);

  useEffect(() => {
    setRosterHydrated(false);
    tableBootShownRef.current = false;
    setChromeBootOpen(false);
  }, [campaignId]);

  useEffect(() => {
    if (!sceneId || !campaignAccessOk || !getAccessToken()) return;

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

    const socket = io(`${getApiBaseUrl()}/vtt`, {
      auth: { token },
      query: { name, playerId: String(playerId) },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    const refreshSessionFromHttp = async (sid: string) => {
      try {
        const res = await fetch(apiUrl(`/api/vtt/sessions/${sid}`), {
          headers: authHeaders(),
        });
        if (res.ok) {
          const snap = (await res.json()) as VttState;
          setState(snap);
        }
      } catch {
        /* WS catch-up on join */
      }
    };

    const join = () => {
      setJoinPending(true);
      setJoinError('');
      socket.emit(
        'vtt:join',
        { sessionId, campaignId, sceneId, name },
        (
          ack:
            | {
                ok?: boolean;
                error?: string;
                role?: string;
                sessionId?: string;
                sceneId?: string;
              }
            | undefined,
        ) => {
          setJoinPending(false);
          if (ack?.ok === false) {
            socket.disconnect();
            if (ack.error === 'unauthorized') {
              setCampaignGate('login');
              setAccessNotice(vttJoinErrorMessage('unauthorized'));
            } else {
              if (ack.error === 'forbidden') clearStoredCampaignId();
              setJoinError(vttJoinErrorMessage(ack.error));
            }
            return;
          }
          setJoinError('');
          if (ack?.role === 'gm' || ack?.role === 'player') {
            setMyRole(ack.role);
          }
          if (ack?.sessionId) setSessionId(ack.sessionId);
          if (ack?.sceneId) setSceneId(ack.sceneId);
          const sid = ack?.sessionId || sessionId;
          if (sid) void refreshSessionFromHttp(sid);
        },
      );
    };

    socket.on('connect', join);
    socket.on(
      'vtt:error',
      (payload: { error?: string; campaignId?: number }) => {
        setJoinPending(false);
        socket.disconnect();
        if (payload?.error === 'unauthorized') {
          setCampaignGate('login');
          setAccessNotice(vttJoinErrorMessage('unauthorized'));
        } else {
          if (payload?.error === 'forbidden') clearStoredCampaignId();
          setJoinError(vttJoinErrorMessage(payload?.error));
        }
      },
    );
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
    socket.on(
      'vtt:fx',
      (fx: {
        type?: string;
        tokenId?: string;
        from?: { x: number; y: number };
        color?: string;
      }) => {
        if (fx?.type === 'sandevistan' || fx?.type === 'chrome-activate') {
          setSandyFx(true);
          window.setTimeout(() => setSandyFx(false), 2200);
          playCyberSound('glitch', { volume: 0.45 });
        }
        if (fx?.type === 'sandevistan-trail' && fx.from) {
          const from = fx.from;
          setSandyTrailFx((prev) =>
            [
              {
                id: `fx_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                x: from.x,
                y: from.y,
                color: fx.color || '#FCEE0A',
                tokenId: fx.tokenId,
              },
              ...prev,
            ].slice(0, 36),
          );
        }
        if (fx?.type === 'damage') {
          playCyberSound('deny', { volume: 0.35 });
        }
      },
    );
    socket.on(
      'vtt:chrome',
      (payload: {
        ok?: boolean;
        error?: string;
        chrome?: string;
        ramCost?: number;
        ram?: number;
        ramMax?: number;
        cost?: number;
      }) => {
        if (payload?.ok) {
          if (payload.ramCost) {
            setChromeToast(
              `${payload.chrome || 'Chrome'} ativo · RAM −${payload.ramCost} (${payload.ram ?? '?'}/${payload.ramMax ?? '?'})`,
            );
          } else {
            setChromeToast(`${payload.chrome || 'Chrome'} ativo.`);
          }
          playCyberSound('ui', { volume: 0.35 });
        } else if (payload?.error === 'no-ram') {
          setChromeToast(
            `RAM insuficiente (${payload.ram ?? 0}/${payload.ramMax ?? 0}) · custo ${payload.cost ?? payload.ramCost ?? '?'}`,
          );
          playCyberSound('deny', { volume: 0.45 });
        } else if (payload?.error === 'not-installed') {
          setChromeToast('Chrome não instalado nesta ficha.');
          playCyberSound('deny', { volume: 0.4 });
        }
        window.setTimeout(() => setChromeToast(null), 3200);
      },
    );
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
        ram?: number;
        ramMax?: number;
      }) => {
        setNetBusy(false);
        if (payload?.ram != null) {
          setNetMenu((prev) =>
            prev ? { ...prev, ram: payload.ram, ramMax: payload.ramMax ?? prev.ramMax } : prev,
          );
        }
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
    socket.on('vtt:attack', (card: AttackCardPayload) => setLastAttack(card));
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
    campaignAccessOk,
    router,
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
    const loadNpcs = () =>
      fetchCampaignNpcs(campaignId)
        .then(setCampaignNpcs)
        .catch(() => setCampaignNpcs([]));
    loadNpcs();
    const onFocus = () => {
      loadNpcs();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
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
          characterId: npc.spawnCharacterId || undefined,
          affiliation: npc.affiliation || undefined,
          arThreat: mapNpcThreat(npc.threat),
          portraitUrl: npcImageSrc(npc),
          color: '#ff2a6d',
          bars: { hp: 10, hpMax: 10 },
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
    if (text.match(/^\/gmroll\b/i)) {
      intent('chat:message', {
        text,
        pool: selectedChar?.sheetSummary ? sheetPool : pool,
        difficulty,
      });
    } else if (chatChannel === 'whisper' && whisperTargetId) {
      intent('chat:whisper', { text, toPlayerId: Number(whisperTargetId) });
    } else if (chatChannel === 'gm' && isGm) {
      intent('chat:whisper', { text, gmOnly: true });
    } else {
      intent('chat:message', { text });
    }
    setChatText('');
    playCyberSound('ui', { volume: 0.3 });
  };

  const placeAreaTemplate = useCallback(
    (x: number, y: number) => {
      if (!areaPlaceKind || !isGm) return;
      const attacker = state?.tokens?.find((t) => t.id === selectedTokenId);
      let dirX = 1;
      let dirY = 0;
      if (attacker && aimMode) {
        dirX = Math.sign(x - attacker.x) || 1;
        dirY = Math.sign(y - attacker.y);
        if (dirX === 0 && dirY === 0) dirY = 0;
      }
      intent('area:place', {
        kind: areaPlaceKind,
        x,
        y,
        dirX,
        dirY,
        length: areaPlaceKind === 'burst' ? 0 : 5,
        radius: 3,
        floor: state?.floor ?? 0,
        label: tP2(`area.${areaPlaceKind}`),
      });
      setAreaPlaceKind(null);
    },
    [
      areaPlaceKind,
      isGm,
      state?.tokens,
      state?.floor,
      selectedTokenId,
      aimMode,
      intent,
      tP2,
    ],
  );

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
      characters: roster.map((c, i) => {
        const sum = c.sheetSummary || {};
        const ram = Number(sum.ram);
        const ramMax = Number(sum.ramMax);
        const bars: Record<string, number> = {
          hp: Number(c.vitality) || 7,
          hpMax: Number(c.vitalityMax) || 7,
        };
        if (Number.isFinite(ramMax) && ramMax > 0) {
          bars.ram = Number.isFinite(ram) ? ram : ramMax;
          bars.ramMax = ramMax;
        }
        return {
          id: c.id,
          name: c.name,
          playerId: c.playerId,
          color: TOKEN_COLORS[i % TOKEN_COLORS.length],
          portraitUrl: characterImageSrc(c),
          bars,
        };
      }),
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

  const gmBoardPickActive = useMemo(
    () =>
      isGm &&
      boardNavTool === 'select' &&
      tool === 'select' &&
      !spawnPlacement &&
      !aimMode,
    [isGm, boardNavTool, tool, spawnPlacement, aimMode],
  );

  const selectMapDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setSelectedTokenId(null);
    setSelectedWallId(null);
    setSelectedNetLink(null);
    setCtxMenu(null);
  }, []);

  const selectMapWall = useCallback((wallId: string) => {
    setSelectedWallId(wallId);
    setSelectedTokenId(null);
    setSelectedDeviceId(null);
    setSelectedNetLink(null);
    setCtxMenu(null);
  }, []);

  const clearEditState = useCallback(() => {
    setCtxMenu(null);
    setSelectedTokenId(null);
    setSelectedDeviceId(null);
    setSelectedWallId(null);
    setSelectedNetLink(null);
    setNetLinkFrom(null);
    setWallDraft(null);
    setRuler(null);
    setAimMode(false);
    setAimHoverId(null);
    setSheetPopupOpen(false);
    setGmShortcutsOpen(false);
  }, []);

  const canDragToken = (t: Token) => {
    if (layerLocked('tokens')) return false;
    if (!layerVisible('tokens')) return false;
    if (isGm) return true;
    const owns =
      Number(t.ownerPlayerId) === Number(myPlayerId) ||
      Number(t.controllerPlayerId) === Number(myPlayerId);
    if (!owns) return false;
    return canMoveTokenForRole(state, t.id, false);
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

  useEffect(() => {
    setBgLoadError(null);
  }, [mapBgSrc]);

  const readImageDimensions = (file: File) =>
    new Promise<{ w: number; h: number } | null>((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });

  const uploadBackground = async (file: File) => {
    if (!isGm || !file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
    if (ext && !allowed.has(ext)) {
      setScanToast('Formato não suportado — use JPG, PNG ou WebP');
      window.setTimeout(() => setScanToast(null), 3200);
      playCyberSound('deny', { volume: 0.4 });
      if (bgInputRef.current) bgInputRef.current.value = '';
      return;
    }
    setUploadingBg(true);
    setBgLoadError(null);
    try {
      const [dataUrl, dims] = await Promise.all([
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
        readImageDimensions(file),
      ]);
      const key = `maps/campaign-${campaignId}-${Date.now()}.${
        ext || 'jpg'
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
      let json: { url?: string; error?: string; message?: string } = {};
      try {
        json = await res.json();
      } catch {
        /* 413/HTML from proxy */
      }
      if (!res.ok || !json?.url) {
        const msg =
          json?.message ||
          json?.error ||
          (res.status === 413
            ? 'Imagem grande demais (máx. ~40MB) — comprima ou use PNG/WebP'
            : `Upload falhou (${res.status || 'rede'})`);
        throw new Error(msg);
      }
      const payload: {
        url: string;
        width?: number;
        height?: number;
      } = { url: json.url };
      if (dims && dims.w > 0 && dims.h > 0) {
        payload.width = Math.min(
          200,
          Math.max(5, Math.round(dims.w / GRID)),
        );
        payload.height = Math.min(
          200,
          Math.max(5, Math.round(dims.h / GRID)),
        );
      }
      intent('map:background', payload);
      intent('layer:update', { id: 'background', visible: true });
      intent('layer:active', { id: 'background' });
      setTool('pan');
      setScanToast('Background aplicado');
      window.setTimeout(() => setScanToast(null), 2400);
      playCyberSound('confirm', { volume: 0.4 });
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Falha ao enviar background';
      setScanToast(msg);
      window.setTimeout(() => setScanToast(null), 4200);
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

  const deleteSelectedGm = useCallback(() => {
    if (!isGm) return;
    if (selectedNetLink && netEditLinks) {
      intent('device:unlink', {
        fromId: selectedNetLink.a,
        toId: selectedNetLink.b,
      });
      setSelectedNetLink(null);
      return;
    }
    if (selectedDeviceId) {
      intent('device:remove', { deviceId: selectedDeviceId });
      setSelectedDeviceId(null);
      return;
    }
    if (selectedTokenId && !layerLocked('tokens')) {
      intent('token:remove', { tokenId: selectedTokenId });
      setSelectedTokenId(null);
      return;
    }
    if (selectedWallId && !layerLocked('walls')) {
      intent('wall:remove', { wallId: selectedWallId });
      setSelectedWallId(null);
    }
  }, [
    isGm,
    selectedNetLink,
    netEditLinks,
    selectedDeviceId,
    selectedTokenId,
    selectedWallId,
    intent,
    layerLocked,
  ]);

  const onGmToolHotkey = useCallback(
    (key: 'fog' | 'wall' | 'grid' | 'lock') => {
      if (!isGm) return;
      setBoardNavTool('select');
      if (key === 'fog') {
        if (layerLocked('fog')) return;
        setTool((t) => (t === 'fog' ? 'select' : 'fog'));
        intent('layer:active', { id: 'fog' });
        return;
      }
      if (key === 'wall') {
        if (layerLocked('walls')) return;
        setTool((t) => (t === 'wall' ? 'select' : 'wall'));
        intent('layer:active', { id: 'walls' });
        return;
      }
      if (key === 'grid') {
        const vis = layerVisible('grid');
        intent('layer:update', { id: 'grid', visible: !vis });
        return;
      }
      if (key === 'lock') {
        const layer = layers.find((l) => l.id === activeLayer);
        if (!layer) return;
        intent('layer:update', {
          id: activeLayer,
          locked: !layer.locked,
        });
      }
    },
    [isGm, layerLocked, layerVisible, layers, activeLayer, intent],
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
      if (gmBoardPickActive && viewMode === 'normal') {
        selectMapDevice(deviceId);
        return;
      }
      openNetNode({ deviceId });
    },
    [
      netEditLinks,
      netLinkFrom,
      intent,
      openNetNode,
      gmBoardPickActive,
      viewMode,
      selectMapDevice,
    ],
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
      setScanToast('Fora de alcance / LoS bloqueada');
      window.setTimeout(() => setScanToast(null), 2200);
      playCyberSound('deny', { volume: 0.4 });
      return;
    }
    const eco = state?.turnEconomy;
    if (
      state?.combat?.active &&
      !isGm &&
      eco?.tokenId === attackerToken.id &&
      eco.mainUsed &&
      eco.extraActions <= 0
    ) {
      setScanToast('Ação principal já usada neste turno');
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
    state?.turnEconomy,
    state?.combat?.active,
    isGm,
  ]);

  const quickGearItems = useMemo(() => {
    const char =
      roster.find(
        (c) =>
          myRosterChar && String(c.id) === String(myRosterChar.id),
      ) || myRosterChar;
    const gear = char?.sheetSummary?.gear;
    if (!Array.isArray(gear)) return [];
    return gear
      .map((g: any) => ({
        id: g?.id,
        name: String(g?.name || '').trim(),
        qty: Number(g?.qty ?? g?.charges ?? 1) || 1,
        charges: Number(g?.charges ?? g?.qty ?? 1) || 1,
        type: g?.type,
        effect: g?.effect,
        heal: g?.heal,
      }))
      .filter((g: { name: string; qty: number }) => g.name && g.qty > 0);
  }, [roster, myRosterChar]);

  const itemTokenId =
    state?.turnEconomy?.tokenId ||
    (selectedTokenId && myTokenIds.includes(selectedTokenId)
      ? selectedTokenId
      : null) ||
    myTokenIds[0] ||
    null;

  const rangeLabel = !ruler
    ? ''
    : (() => {
        const rb = buildAimPreview([], ruler!.x1, ruler!.y1, ruler!.x2, ruler!.y2)
          .range;
        return rangeBandLabel(rb.band, rb.penalty);
      })();

  const runnerForPanel = myRosterChar;

  const installedChromeByCharacterId = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const c of roster) {
      const chrome = c.sheetSummary?.chrome;
      if (Array.isArray(chrome)) {
        map.set(String(c.id), chrome.map(String));
      }
    }
    return map;
  }, [roster]);

  useEffect(() => {
    setLeftHudCollapsed(readHudPanelPref(HUD_PREF_LEFT, false));
    setRightHudCollapsed(readHudPanelPref(HUD_PREF_RIGHT, true));
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

  const boardMounted =
    campaignGate === 'ok' &&
    scenesReady &&
    !!sceneId &&
    !joinError &&
    !joinPending;

  useEffect(() => {
    if (!boardMounted) return;
    const el = canvasWrapRef.current;
    if (!el) return;
    const applySize = (width: number, height: number) => {
      setBoardSize({
        w: Math.max(280, Math.floor(width)),
        h: Math.max(200, Math.floor(height)),
      });
    };
    const rect = el.getBoundingClientRect();
    applySize(rect.width, rect.height);
    const ro = new ResizeObserver(([entry]) => {
      applySize(entry.contentRect.width, entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [boardMounted]);

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
    return myTokenIds.includes(combatCurrent.tokenId);
  }, [combatCurrent, myTokenIds]);

  const canApplyAttackDamage = useMemo(() => {
    if (
      !lastAttack?.damage?.successes ||
      !lastAttack.targetTokenId ||
      (lastAttack.hit?.successes ?? 0) <= 0
    ) {
      return false;
    }
    if (isGm) return true;
    const attackerId = lastAttack.attackerTokenId;
    if (!attackerId || !myTokenIds.includes(attackerId)) return false;
    if (!state?.combat?.active) return true;
    return combatCurrent?.tokenId === attackerId;
  }, [lastAttack, isGm, myTokenIds, state?.combat?.active, combatCurrent?.tokenId]);

  const tokenNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of state?.tokens || []) {
      map.set(t.id, t.name);
    }
    return map;
  }, [state?.tokens]);

  const phoneHandouts = useMemo(() => {
    const list = state?.handouts || [];
    if (isGm) return list;
    return list.filter((h) => {
      const target = Number((h as Handout & { toPlayerId?: number }).toPlayerId);
      if (!target) return true;
      return Number(myPlayerId) === target;
    });
  }, [state?.handouts, isGm, myPlayerId]);

  const turnMovementForSelected = useMemo(() => {
    if (!selectedTokenId || !state?.combat?.active || !state.turnMovement) {
      return null;
    }
    if (state.turnMovement.tokenId !== selectedTokenId) return null;
    if (combatCurrent?.tokenId !== selectedTokenId) return null;
    return state.turnMovement;
  }, [
    selectedTokenId,
    state?.combat?.active,
    state?.turnMovement,
    combatCurrent?.tokenId,
  ]);

  const reachableSet = useMemo(() => {
    if (!turnMovementForSelected || !selectedToken) return null;
    const cells = budgetReachableCells(turnMovementForSelected, mapW, mapH);
    return new Set(cells.map((c) => `${c.x},${c.y}`));
  }, [turnMovementForSelected, selectedToken, mapW, mapH]);

  const requestTokenMove = useCallback(
    (tokenId: string, x: number, y: number) => {
      const tok = state?.tokens?.find((t) => t.id === tokenId);
      if (!tok || !canDragToken(tok)) return;
      const nx = Math.max(0, Math.min(mapW - 1, Math.floor(x)));
      const ny = Math.max(0, Math.min(mapH - 1, Math.floor(y)));
      if (nx === tok.x && ny === tok.y) return;
      const move = state?.turnMovement;
      if (
        state?.combat?.active &&
        move?.tokenId === tok.id &&
        !canAffordMoveTo(move, nx, ny)
      ) {
        return;
      }
      const group =
        isGm && selectedTokenIds.length > 1 && selectedTokenIds.includes(tokenId)
          ? selectedTokenIds
          : [tokenId];
      const anchor = dragGroupStartRef.current[tokenId] || {
        x: tok.x,
        y: tok.y,
      };
      const dx = nx - anchor.x;
      const dy = ny - anchor.y;
      for (const id of group) {
        const start = dragGroupStartRef.current[id];
        const other = state?.tokens?.find((t) => t.id === id);
        if (!start || !other || !canDragToken(other)) continue;
        const ox = Math.max(0, Math.min(mapW - 1, start.x + dx));
        const oy = Math.max(0, Math.min(mapH - 1, start.y + dy));
        if (ox === other.x && oy === other.y) continue;
        intent('token:move', { tokenId: id, x: ox, y: oy });
      }
    },
    [
      state?.tokens,
      state?.combat?.active,
      state?.turnMovement,
      canDragToken,
      mapW,
      mapH,
      intent,
      isGm,
      selectedTokenIds,
    ],
  );

  const moveSelectedToken = useCallback(
    (dx: number, dy: number) => {
      if (!selectedTokenId) return;
      const tok = state?.tokens?.find((t) => t.id === selectedTokenId);
      if (!tok) return;
      requestTokenMove(tok.id, tok.x + dx, tok.y + dy);
    },
    [selectedTokenId, state?.tokens, requestTokenMove],
  );

  const resetSelectedMovement = useCallback(() => {
    if (!selectedTokenId || !turnMovementForSelected) return;
    intent('token:reset-move', { tokenId: selectedTokenId });
  }, [selectedTokenId, turnMovementForSelected, intent]);

  const boardViewW = boardSize.w > 0 ? boardSize.w : '100%';
  const boardViewH = boardSize.h > 0 ? boardSize.h : '100%';

  const setViewModeShortcut = useCallback(
    (m: ViewMode) => {
      if (m !== 'scan') setScanResult(null);
      if (m !== 'net') setNetMenu(null);
      setLocalViewMode(m);
      intent('view:mode', { mode: m, force: isGm });
    },
    [intent, isGm],
  );

  useTableEditHotkeys({
    isGm,
    combatMyTurn,
    intent,
    setViewModeShortcut,
    setSafeVision,
    myTokenIds,
    hasOptics,
    hasNetDeck,
    activateKiroshi,
    toggleBothHuds,
    spawnPlacement,
    setSpawnPlacement,
    deleteSelectedGm,
    clearEditState,
    setBoardNavTool,
    setTool,
    tool,
    toggleGmShortcutsLegend: () => setGmShortcutsOpen((o) => !o),
    onGmToolHotkey,
    selectedTokenId,
    stateTokens: state?.tokens,
    aimMode,
    currentFloor,
    mapW,
    mapH,
    canDragToken: (t) => {
      const tok = state?.tokens?.find((x) => x.id === t.id);
      return tok ? canDragToken(tok) : false;
    },
    moveSelectedToken,
    onResetMovement: resetSelectedMovement,
    onHistoryUndo: isGm ? () => intent('history:undo', {}) : undefined,
    onHistoryRedo: isGm ? () => intent('history:redo', {}) : undefined,
    spaceHeldRef,
    spacePanUsedRef,
    setSpaceHeld,
  });

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
        library={tokenLibrary}
        onToggleLibrary={(stamp) => {
          if (!campaignId) return;
          setTokenLibrary(
            toggleTokenLibraryStamp(Number(campaignId), stamp),
          );
        }}
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
      <HudButton
        variant="ghost"
        onClick={() =>
          intent('breach:start', {
            tokenId: selectedTokenId || myTokenIds[0],
          })
        }
      >
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
        {tP2('wallTool')}
      </HudButton>
      <HudButton
        variant={areaPlaceKind === 'cone' ? 'primary' : 'ghost'}
        onClick={() =>
          setAreaPlaceKind((k) => (k === 'cone' ? null : 'cone'))
        }
      >
        {tP2('area.cone')}
      </HudButton>
      <HudButton
        variant={areaPlaceKind === 'burst' ? 'primary' : 'ghost'}
        onClick={() =>
          setAreaPlaceKind((k) => (k === 'burst' ? null : 'burst'))
        }
      >
        {tP2('area.burst')}
      </HudButton>
      <HudButton
        variant={areaPlaceKind === 'line' ? 'primary' : 'ghost'}
        onClick={() =>
          setAreaPlaceKind((k) => (k === 'line' ? null : 'line'))
        }
      >
        {tP2('area.line')}
      </HudButton>
      <HudButton variant="ghost" onClick={() => intent('area:clear', {})}>
        {tP2('area.clear')}
      </HudButton>
      {isGm && (
        <>
          <HudButton variant="ghost" onClick={() => intent('history:undo', {})}>
            {tP2('undo')}
          </HudButton>
          <HudButton variant="ghost" onClick={() => intent('history:redo', {})}>
            {tP2('redo')}
          </HudButton>
        </>
      )}
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
        <label className={styles.diceLabel}>
          Runner
          <select
            value={handoutTargetCharId}
            onChange={(e) => setHandoutTargetCharId(e.target.value)}
            aria-label="Personagem destino"
          >
            <option value="">Broadcast mesa</option>
            {roster.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
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
            const target = roster.find((c) => c.id === handoutTargetCharId);
            intent('handout:push', {
              channel: 'sms',
              from: handoutFrom || 'Fixer',
              title: 'SMS',
              body,
              toCharacterId: handoutTargetCharId || undefined,
              toPlayerId: target?.playerId ?? undefined,
            });
            setHandoutBody('');
          }}
        >
          Enviar ao agente
        </HudButton>
      </div>
    ) : null;

  const tableBootLoading =
    campaignGate === 'pending' ||
    (campaignGate === 'ok' && (!scenesReady || joinPending));

  if (campaignGate === 'login' || campaignGate === 'none') {
    return (
      <PageFrame>
        <VttAccessGate
          title="Mesa virtual"
          message={accessNotice}
          showLogin={campaignGate === 'login'}
          campaignId={campaignId}
        />
      </PageFrame>
    );
  }

  if (joinError) {
    return (
      <PageFrame>
        <VttAccessGate
          title="Falha ao entrar na mesa"
          message={joinError}
          campaignId={campaignId}
        />
      </PageFrame>
    );
  }

  if (campaignGate === 'ok' && scenesReady && !sceneId) {
    return (
      <PageFrame>
        <VttAccessGate
          title="Nenhuma cena disponível"
          message="Esta campanha ainda não tem cenas VTT. O narrador pode criar uma em Campanhas → detalhe da campanha → Cenas VTT."
          campaignId={campaignId}
        />
      </PageFrame>
    );
  }

  if (tableBootLoading) {
    return (
      <PageFrame>
        <VttAccessGate
          loading
          title="Mesa virtual"
          message={
            joinPending
              ? 'Entrando na sessão…'
              : 'Carregando campanha e cenas…'
          }
          campaignId={campaignId}
        />
      </PageFrame>
    );
  }

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
        <GmFirstVisitHints isGm={isGm} />
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
          {chromeToast && (
            <div className={styles.chromeToast} role="status">
              {chromeToast}
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
              {selectedToken.bars?.ramMax != null &&
              Number(selectedToken.bars.ramMax) > 0
                ? ` · RAM ${selectedToken.bars.ram ?? 0}/${selectedToken.bars.ramMax}`
                : ''}
              {selectedToken.hidden ? ' · oculto' : ''}
              {turnMovementForSelected && (
                <>
                  {' '}
                  · Movimento{' '}
                  <strong data-low={turnMovementForSelected.remaining <= 0 ? '1' : '0'}>
                    {turnMovementForSelected.remaining}/{turnMovementForSelected.max}
                  </strong>
                  <HudButton variant="ghost" onClick={resetSelectedMovement}>
                    Resetar movimento (R)
                  </HudButton>
                </>
              )}
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
            {isGm && (
              <GmEditShortcutsLegend
                open={gmShortcutsOpen}
                onClose={() => setGmShortcutsOpen(false)}
              />
            )}
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
                if (isGm && areaPlaceKind && e.button === 0) {
                  const c = cellFromEvent(e);
                  placeAreaTemplate(c.x, c.y);
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
                  setSelectedDeviceId(null);
                  setSelectedWallId(null);
                  setSelectedNetLink(null);
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
                  requestTokenMove(dragging, c.x, c.y);
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
                    key={mapBgSrc}
                    src={mapBgSrc}
                    alt=""
                    className={styles.mapBackground}
                    style={{
                      transform: `scale(${bgScale})`,
                      transformOrigin: '0 0',
                    }}
                    draggable={false}
                    onLoad={() => setBgLoadError(null)}
                    onError={() =>
                      setBgLoadError(
                        'Background não carregou — reenvie a imagem ou confira se a API (:4444) está no ar.',
                      )
                    }
                  />
                )}
                {bgLoadError && layerVisible('background') && (
                  <div className={styles.bgLoadError} role="status">
                    {bgLoadError}
                  </div>
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
                  {layerVisible('grid') &&
                    reachableSet &&
                    Array.from(reachableSet).map((key) => {
                      const [x, y] = key.split(',').map(Number);
                      return (
                        <rect
                          key={`reach-${key}`}
                          x={x * GRID}
                          y={y * GRID}
                          width={GRID}
                          height={GRID}
                          className={styles.cellReachable}
                        />
                      );
                    })}
                  {layerVisible('walls') &&
                    (state?.walls || []).map((w) => {
                      const wallSelected = selectedWallId === w.id;
                      const wallClass = w.door
                        ? w.open
                          ? styles.wallDoorOpen
                          : styles.wallDoor
                        : styles.wall;
                      return (
                        <g key={w.id}>
                          {gmBoardPickActive && !layerLocked('walls') && (
                            <line
                              x1={w.x1 * GRID + GRID / 2}
                              y1={w.y1 * GRID + GRID / 2}
                              x2={w.x2 * GRID + GRID / 2}
                              y2={w.y2 * GRID + GRID / 2}
                              className={styles.wallHit}
                              onClick={(e) => {
                                e.stopPropagation();
                                selectMapWall(w.id);
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                if (w.door) intent('wall:toggle', { wallId: w.id });
                              }}
                            />
                          )}
                          <line
                            x1={w.x1 * GRID + GRID / 2}
                            y1={w.y1 * GRID + GRID / 2}
                            x2={w.x2 * GRID + GRID / 2}
                            y2={w.y2 * GRID + GRID / 2}
                            className={wallClass}
                            data-selected={wallSelected ? '1' : '0'}
                            pointerEvents="none"
                          />
                        </g>
                      );
                    })}
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
                  <AreaTemplateOverlay
                    grid={GRID}
                    templates={state?.areaTemplates || []}
                    floor={currentFloor}
                  />
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
                    const deviceSelected = selectedDeviceId === d.id;
                    const shared = {
                      className: styles.device,
                      'data-kind': d.kind,
                      'data-selected': deviceSelected ? '1' : '0',
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
                      <div
                        key={d.id}
                        {...shared}
                        role={gmBoardPickActive ? 'button' : undefined}
                        tabIndex={gmBoardPickActive ? 0 : undefined}
                        onClick={
                          gmBoardPickActive
                            ? (e) => {
                                e.stopPropagation();
                                selectMapDevice(d.id);
                              }
                            : undefined
                        }
                      >
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
                  <ChromeTokenTrails
                    grid={GRID}
                    floor={currentFloor}
                    tokens={floorTokens}
                    fxEvents={sandyTrailFx}
                    onConsumeFx={(id) =>
                      setSandyTrailFx((prev) => prev.filter((g) => g.id !== id))
                    }
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
                    const selected =
                      selectedTokenId === t.id || selectedTokenIds.includes(t.id);
                    const psychoCritical =
                      t.characterId != null &&
                      psychosisCriticalFromSheet(
                        roster.find((c) => String(c.id) === String(t.characterId))
                          ?.sheetSummary,
                      );
                    const portrait =
                      resolveMediaSrc(t.portraitUrl) || t.portraitUrl || null;
                    const mine = canDragToken(t);
                    const turnMoveBlock =
                      !mine &&
                      !isGm &&
                      tokenMoveBlockedHint(state) &&
                      (Number(t.ownerPlayerId) === Number(myPlayerId) ||
                        Number(t.controllerPlayerId) === Number(myPlayerId));
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
                    const auras = t.auras || [];
                    const auraPrimary = auras.includes('sandevistan')
                      ? 'sandevistan'
                      : auras[0] || '';
                    const passiveTags = passiveChromeFx(
                      t.characterId != null
                        ? installedChromeByCharacterId.get(String(t.characterId)) ||
                            []
                        : [],
                    );
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
                        data-aura={
                          psychoCritical ? 'cyberpsychosis' : auraPrimary
                        }
                        data-passive={passiveTags.join(' ')}
                        data-psycho={psychoCritical ? '1' : '0'}
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
                          if (isGm && e.shiftKey) {
                            setSelectedTokenIds((prev) => {
                              const has = prev.includes(t.id);
                              const next = has
                                ? prev.filter((id) => id !== t.id)
                                : [...prev, t.id];
                              setSelectedTokenId(next[next.length - 1] || t.id);
                              return next.length ? next : [t.id];
                            });
                          } else {
                            setSelectedTokenId(t.id);
                            setSelectedTokenIds([t.id]);
                          }
                          setSelectedDeviceId(null);
                          setSelectedWallId(null);
                          setSelectedNetLink(null);
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
                          const group =
                            isGm && selectedTokenIds.includes(t.id)
                              ? selectedTokenIds
                              : [t.id];
                          const starts: Record<string, { x: number; y: number }> =
                            {};
                          for (const id of group) {
                            const tok = state?.tokens?.find((x) => x.id === id);
                            if (tok) starts[id] = { x: tok.x, y: tok.y };
                          }
                          dragGroupStartRef.current = starts;
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
                          turnMoveBlock
                            ? tokenMoveBlockedHint(state) ||
                              'Só move no próprio turno'
                            : viewMode === 'net' && t.kind === 'drone'
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
                        {t.bars?.ramMax != null && Number(t.bars.ramMax) > 0 && (
                          <span
                            className={styles.tokenRam}
                            style={{
                              width: `${
                                (Number(t.bars.ram) /
                                  Math.max(1, Number(t.bars.ramMax))) *
                                100
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
              {isGm ? '? atalhos GM · Del apaga seleção · ' : ''}
              zoom {zoom.toFixed(2)} · shift+drag régua · setas/WASD: mover token ·{' '}
              {distance}u
              {rangeLabel ? ` (${rangeLabel})` : ''}
              {` · layer:${activeLayer} · view:${viewMode} · F${currentFloor}`}
              {tool !== 'select' ? ` · tool:${tool}` : ''}
              {tool === 'fog' ? ` · fog:${fogMode} r${fogRadius}` : ''}
              {state?.radioStation ? ` · ${state.radioStation}` : ''}
              {mapBgSrc
                ? layerVisible('background')
                  ? bgLoadError
                    ? ' · bg(erro)'
                    : ' · bg'
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
              canUseItem={
                !!itemTokenId &&
                quickGearItems.length > 0 &&
                (combatMyTurn || isGm || !state?.combat?.active)
              }
              turnEconomy={
                state?.turnEconomy &&
                (combatMyTurn || isGm) &&
                (isGm ||
                  state.turnEconomy.tokenId === combatCurrent?.tokenId)
                  ? state.turnEconomy
                  : null
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
              onDodge={() => {
                if (
                  state?.combat?.active &&
                  combatMyTurn &&
                  state.turnEconomy &&
                  !state.turnEconomy.reactionUsed
                ) {
                  intent('turn:action', { kind: 'reaction' });
                }
                rollDice({
                  attr: 'dexterity',
                  skill: 'athletics',
                  label: 'Reflexos + Esquiva',
                });
              }}
              onUseItem={() => setItemMenuOpen(true)}
              onTurnAction={(kind) => intent('turn:action', { kind })}
              onPassTurn={() => {
                if (isGm || combatMyTurn) intent('initiative:next', {});
              }}
            />
            <ItemQuickMenu
              open={itemMenuOpen}
              items={quickGearItems}
              onClose={() => setItemMenuOpen(false)}
              onUse={(item) => {
                if (!itemTokenId) return;
                intent('item:use', {
                  tokenId: itemTokenId,
                  itemId: item.id,
                  itemName: item.name,
                });
                setItemMenuOpen(false);
                playCyberSound('confirm', { volume: 0.4 });
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
            <HudPanel title="Reações" sectionKey="reactions">
              <ReactionBar
                hideTitle
                onReact={(id: ReactionId) => {
                  intent('chat:emote', { emote: id });
                  playCyberSound('ui', { volume: 0.3 });
                }}
              />
            </HudPanel>
            <HudPanel
              title="Combate"
              sectionKey="combat"
              className={styles.combatDock}
            >
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
                lockMoveToTurn={!!state?.rules?.tokenMoveOnTurnOnly}
                onToggleLockMoveToTurn={(enabled) =>
                  intent('combat:lock-move', { enabled })
                }
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
                sandyRamCost={
                  (myRosterChar?.sheetSummary?.chrome || [])
                    .map((n: string) => chromeActivationRamCost(n))
                    .find((c: number | null) => c != null) ?? 2
                }
              />
            </HudPanel>
          {selectedToken &&
            (selectedToken.kind === 'drone' ||
              selectedToken.kind === 'summon') && (
              <HudPanel title="Drone / Summon" sectionKey="drone-summon">
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
          {selectedToken ? (
            <HudPanel title="Condições" sectionKey="conditions">
              <ConditionsStrip
                tokenId={selectedToken.id}
                tokenName={selectedToken.name}
                conditions={state?.conditions || []}
                isGm={isGm}
                onAdd={(kind, label, roundsLeft) =>
                  intent('condition:add', {
                    tokenId: selectedToken.id,
                    kind,
                    label,
                    roundsLeft,
                  })
                }
                onRemove={(id) => intent('condition:remove', { id })}
              />
            </HudPanel>
          ) : null}
          {isGm && (
            <HudPanel title="Notas GM" sectionKey="gm-notes">
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
          <HudPanel title="Camadas" sectionKey="layers">
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
          <HudPanel title="Presença" sectionKey="presence">
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
          <HudPanel title="Iniciativa" sectionKey="initiative">
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
              sectionKey="braindance-replay"
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
            title={tP2('chatDiceTitle')}
            sectionKey="chat-dice"
            className={styles.chatPanel}
            bodyClassName={styles.chatPanelBody}
          >
            <div className={styles.chatStack}>
              <div className={styles.chat} ref={chatLogRef}>
                {(state?.chat || []).length === 0 ? (
                  <p className={styles.chatEmpty}>{tP2('chatEmpty')}</p>
                ) : (
                  (state?.chat || []).slice(-40).map((m) => (
                    <p
                      key={m.id}
                      data-kind={m.kind || 'chat'}
                      data-channel={m.channel || 'all'}
                    >
                      <span className={styles.chatMeta}>
                        {m.at ? m.at.slice(11, 19) : ''} {m.name}
                        {m.channel === 'whisper' ? ` · ${tP2('whisperTag')}` : ''}
                        {m.gmOnly ? ` · ${tP2('gmTag')}` : ''}
                      </span>
                      <span className={styles.chatBody}>{m.text}</span>
                      {m.kind === 'attack' && lastAttack?.id === m.id && (
                        <AttackResultCard
                          card={lastAttack}
                          attackerName={
                            lastAttack.attackerTokenId
                              ? tokenNameById.get(lastAttack.attackerTokenId)
                              : undefined
                          }
                          targetName={
                            lastAttack.targetTokenId
                              ? tokenNameById.get(lastAttack.targetTokenId)
                              : undefined
                          }
                          canApplyDamage={canApplyAttackDamage}
                          onApplyDamage={() =>
                            intent('token:damage', {
                              tokenId: lastAttack.targetTokenId,
                              amount: lastAttack.damage?.successes ?? 0,
                              fromAttack: true,
                            })
                          }
                        />
                      )}
                    </p>
                  ))
                )}
              </div>

              <div className={styles.composer}>
                <div className={styles.chatRow}>
                  <label className={styles.diceLabel}>
                    {tP2('channel')}
                    <select
                      value={chatChannel}
                      onChange={(e) =>
                        setChatChannel(
                          e.target.value as 'all' | 'whisper' | 'gm',
                        )
                      }
                    >
                      <option value="all">{tP2('channelAll')}</option>
                      <option value="whisper">{tP2('channelWhisper')}</option>
                      {isGm && (
                        <option value="gm">{tP2('channelGm')}</option>
                      )}
                    </select>
                  </label>
                  {chatChannel === 'whisper' && (
                    <label className={styles.diceLabel}>
                      {tP2('whisperTo')}
                      <select
                        value={whisperTargetId}
                        onChange={(e) =>
                          setWhisperTargetId(
                            e.target.value ? Number(e.target.value) : '',
                          )
                        }
                      >
                        <option value="">{tP2('pickPlayer')}</option>
                        {(state?.presence || [])
                          .filter((p) => p.role !== 'gm' || isGm)
                          .map((p) => (
                            <option key={p.playerId} value={p.playerId}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  )}
                </div>
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
                    placeholder={tP2('chatPlaceholder')}
                    aria-label={tP2('chatPlaceholder')}
                  />
                  <HudButton
                    onClick={sendChat}
                    disabled={!chatText.trim()}
                  >
                    {tP2('send')}
                  </HudButton>
                  {isGm && (
                    <HudButton
                      variant="ghost"
                      onClick={() =>
                        intent('dice:gmroll', {
                          pool: selectedChar?.sheetSummary ? sheetPool : pool,
                          difficulty,
                          label: tP2('gmRollLabel'),
                        })
                      }
                    >
                      {tP2('gmRollBtn')}
                    </HudButton>
                  )}
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
                  <HudButton onClick={() => rollDice()}>{tP2('roll')}</HudButton>
                </div>
                {characterMacros.length > 0 && (
                  <div className={styles.diceHints}>
                    {characterMacros.slice(0, 8).map((macro) => (
                      <HudButton
                        key={macro.id}
                        variant="ghost"
                        onClick={() =>
                          rollDice({
                            attr: macro.attr,
                            skill: macro.skill,
                            label: macro.label || macro.name,
                          })
                        }
                      >
                        {macro.name}
                      </HudButton>
                    ))}
                  </div>
                )}
                {selectedCharId && (
                  <HudButton
                    variant="ghost"
                    onClick={() => {
                      const name = window.prompt(tP2('macroNamePrompt'));
                      if (!name?.trim()) return;
                      const next = [
                        ...characterMacros,
                        {
                          id: `m_${Date.now()}`,
                          name: name.trim(),
                          attr: attrKey,
                          skill: skillKey,
                          label: `${name.trim()} (${attrKey}+${skillKey})`,
                        },
                      ];
                      setCharacterMacros(next);
                      saveCharacterMacros(selectedCharId, next);
                    }}
                  >
                    {tP2('saveMacro')}
                  </HudButton>
                )}
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
              handouts={phoneHandouts}
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
