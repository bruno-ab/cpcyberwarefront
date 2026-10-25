'use client';

import { HudButton } from '../ui/HudButton';
import styles from './nightCityBar.module.css';

export type ViewMode = 'normal' | 'scan' | 'net';

type Clock = { id: string; label: string; value: number; max: number };
type Objective = { id: string; text: string; done: boolean };

type NightCityBarProps = {
  isGm: boolean;
  viewMode: ViewMode;
  floor: number;
  published: boolean;
  jammed: boolean;
  clocks: Clock[];
  objectives: Objective[];
  safeVision: boolean;
  hasOptics: boolean;
  hasNetDeck: boolean;
  hasTokenOnTable: boolean;
  scanTier: number | null;
  scanBusy?: boolean;
  onViewMode: (mode: ViewMode) => void;
  onFloor: (floor: number) => void;
  onPublish: (published: boolean) => void;
  onJam: (jammed: boolean) => void;
  onAddClock: () => void;
  onAddObjective: () => void;
  onToggleObjective: (id: string, done: boolean) => void;
  onAddDevice: (kind: string) => void;
  onSafeVision: (on: boolean) => void;
  onRequestRoll: () => void;
  onKiroshiScan: (opts?: { bypass?: boolean }) => void;
  onClearScan: () => void;
  canSpawnDrone?: boolean;
  onSpawnDrone?: (profileId: string) => void;
};

const reasonNoToken = 'Requer token do personagem na mesa';
const reasonOptics = 'Requer óptica cibernética (Kiroshi) instalada';
const reasonDeck = 'Requer cyberdeck / interface NET instalada';

export const NightCityBar = ({
  isGm,
  viewMode,
  floor,
  published,
  jammed,
  clocks,
  objectives,
  safeVision,
  hasOptics,
  hasNetDeck,
  hasTokenOnTable,
  scanTier,
  scanBusy,
  onViewMode,
  onFloor,
  onPublish,
  onJam,
  onAddClock,
  onAddObjective,
  onToggleObjective,
  onAddDevice,
  onSafeVision,
  onRequestRoll,
  onKiroshiScan,
  onClearScan,
  canSpawnDrone,
  onSpawnDrone,
}: NightCityBarProps) => {
  const canUseOptics = isGm || (hasTokenOnTable && hasOptics);
  const canUseNet = isGm || (hasTokenOnTable && hasNetDeck);
  const canSafe = isGm || hasTokenOnTable;

  const opticsTitle = (() => {
    if (isGm && !hasOptics) return 'GM bypass · full intel (tier 3)';
    if (!hasTokenOnTable && !isGm) return reasonNoToken;
    if (!hasOptics) return reasonOptics;
    return 'Kiroshi Scan · Perception+Investigation';
  })();

  const netTitle = (() => {
    if (isGm) return 'Modo NET (GM)';
    if (!hasTokenOnTable) return reasonNoToken;
    if (!hasNetDeck) return reasonDeck;
    return 'Modo NET · quickhacks';
  })();

  const scanModeTitle = (() => {
    if (isGm) return 'Modo scan (GM)';
    if (!hasTokenOnTable) return reasonNoToken;
    if (!hasOptics) return reasonOptics;
    return 'Ativar visão Scan / Kiroshi';
  })();

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={styles.label}>Night City</span>
        <HudButton
          variant={viewMode === 'normal' ? 'primary' : 'ghost'}
          onClick={() => onViewMode('normal')}
          title="Visão normal da mesa"
        >
          normal
        </HudButton>
        <HudButton
          variant={viewMode === 'scan' ? 'primary' : 'ghost'}
          disabled={!canUseOptics}
          title={scanModeTitle}
          onClick={() => {
            if (!canUseOptics) return;
            onKiroshiScan(isGm ? { bypass: true } : undefined);
          }}
        >
          scan
        </HudButton>
        <HudButton
          variant={viewMode === 'net' ? 'primary' : 'ghost'}
          disabled={!canUseNet}
          title={netTitle}
          onClick={() => {
            if (!canUseNet) return;
            onViewMode('net');
          }}
        >
          net
        </HudButton>
        <HudButton
          variant={scanTier != null ? 'primary' : 'ghost'}
          disabled={scanBusy || !canUseOptics}
          onClick={() => {
            if (!canUseOptics) return;
            onKiroshiScan(isGm && !hasOptics ? { bypass: true } : undefined);
          }}
          title={opticsTitle}
        >
          Kiroshi{scanTier != null ? ` T${scanTier}` : ''}
        </HudButton>
        {scanTier != null && (
          <HudButton variant="ghost" onClick={onClearScan}>
            Clear scan
          </HudButton>
        )}
        <label className={styles.floor}>
          Andar
          <input
            type="number"
            value={floor}
            onChange={(e) => onFloor(Number(e.target.value) || 0)}
            disabled={!isGm}
            aria-label="Andar"
          />
        </label>
        <HudButton
          variant={safeVision ? 'primary' : 'ghost'}
          disabled={!canSafe}
          title={
            canSafe
              ? 'Alternar visão segura (fog local)'
              : reasonNoToken
          }
          onClick={() => {
            if (!canSafe) return;
            onSafeVision(!safeVision);
          }}
        >
          Safe vision
        </HudButton>
      </div>

      {isGm && (
        <div className={styles.row}>
          <HudButton
            variant={published ? 'primary' : 'ghost'}
            onClick={() => onPublish(!published)}
          >
            {published ? 'Publicada' : 'Prep (oculta)'}
          </HudButton>
          <HudButton variant="ghost" onClick={() => onJam(!jammed)}>
            {jammed ? 'Rádio OK' : 'Jammer'}
          </HudButton>
          <HudButton variant="ghost" onClick={() => onAddDevice('camera')}>
            + Câmera
          </HudButton>
          <HudButton variant="ghost" onClick={() => onAddDevice('terminal')}>
            + Terminal
          </HudButton>
          <HudButton variant="ghost" onClick={() => onAddDevice('turret')}>
            + Torreta
          </HudButton>
          <HudButton variant="ghost" onClick={() => onAddDevice('door')}>
            + Porta
          </HudButton>
          <HudButton variant="ghost" onClick={onAddClock}>
            + Relógio
          </HudButton>
          <HudButton variant="ghost" onClick={onAddObjective}>
            + Objetivo
          </HudButton>
          <HudButton variant="ghost" onClick={onRequestRoll}>
            Pedir rolagem
          </HudButton>
        </div>
      )}

      {canSpawnDrone && onSpawnDrone && (
        <div className={styles.row}>
          <span className={styles.label}>Drones</span>
          <HudButton
            variant="ghost"
            disabled={!isGm && !hasTokenOnTable}
            title={
              isGm || hasTokenOnTable
                ? 'Spawn drone'
                : reasonNoToken
            }
            onClick={() => {
              if (!isGm && !hasTokenOnTable) return;
              onSpawnDrone('watcher');
            }}
          >
            Watcher
          </HudButton>
          <HudButton
            variant="ghost"
            disabled={!isGm && !hasTokenOnTable}
            title={
              isGm || hasTokenOnTable ? 'Spawn drone' : reasonNoToken
            }
            onClick={() => {
              if (!isGm && !hasTokenOnTable) return;
              onSpawnDrone('scout');
            }}
          >
            Scout
          </HudButton>
          <HudButton
            variant="ghost"
            disabled={!isGm && !hasTokenOnTable}
            title={
              isGm || hasTokenOnTable ? 'Spawn drone' : reasonNoToken
            }
            onClick={() => {
              if (!isGm && !hasTokenOnTable) return;
              onSpawnDrone('combat');
            }}
          >
            Combat
          </HudButton>
          <HudButton
            variant="ghost"
            disabled={!isGm && !hasTokenOnTable}
            title={
              isGm || hasTokenOnTable ? 'Spawn drone' : reasonNoToken
            }
            onClick={() => {
              if (!isGm && !hasTokenOnTable) return;
              onSpawnDrone('tech-bot');
            }}
          >
            Tech-bot
          </HudButton>
          <HudButton
            variant="ghost"
            disabled={!isGm && !hasTokenOnTable}
            title={
              isGm || hasTokenOnTable ? 'Spawn drone' : reasonNoToken
            }
            onClick={() => {
              if (!isGm && !hasTokenOnTable) return;
              onSpawnDrone('summon-ice');
            }}
          >
            ICE summon
          </HudButton>
        </div>
      )}

      {(clocks.length > 0 || objectives.length > 0) && (
        <div className={styles.meta}>
          {clocks.map((c) => (
            <div key={c.id} className={styles.clock}>
              <span>{c.label}</span>
              <div className={styles.clockTrack}>
                {Array.from({ length: c.max }).map((_, i) => (
                  <i key={i} data-on={i < c.value ? '1' : '0'} />
                ))}
              </div>
            </div>
          ))}
          <ul className={styles.objectives}>
            {objectives.map((o) => (
              <li key={o.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={o.done}
                    disabled={!isGm}
                    onChange={(e) => onToggleObjective(o.id, e.target.checked)}
                  />
                  {o.text}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
