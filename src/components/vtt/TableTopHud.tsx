'use client';

import { HudButton } from '../ui/HudButton';
import type { ViewMode } from './NightCityBar';
import styles from './tableTopHud.module.css';

type Clock = { id: string; label: string; value: number; max: number };
type Objective = { id: string; text: string; done: boolean };

export type TableTopHudProps = {
  sceneTitle: string;
  roleLabel: string;
  isGm: boolean;
  viewMode: ViewMode;
  floor: number;
  jammed: boolean;
  published: boolean;
  clocks: Clock[];
  objectives: Objective[];
  safeVision: boolean;
  hasOptics: boolean;
  hasNetDeck: boolean;
  hasTokenOnTable: boolean;
  scanTier: number | null;
  scanBusy?: boolean;
  radioStation?: string | null;
  onViewMode: (mode: ViewMode) => void;
  onFloor: (floor: number) => void;
  onSafeVision: (on: boolean) => void;
  onKiroshiScan: (opts?: { bypass?: boolean }) => void;
  onClearScan: () => void;
  onToggleObjective: (id: string, done: boolean) => void;
};

const reasonNoToken = 'Requer token do personagem na mesa';
const reasonOptics = 'Requer óptica cibernética (Kiroshi)';
const reasonDeck = 'Requer cyberdeck / interface NET';

export const TableTopHud = ({
  sceneTitle,
  roleLabel,
  isGm,
  viewMode,
  floor,
  jammed,
  published,
  clocks,
  objectives,
  safeVision,
  hasOptics,
  hasNetDeck,
  hasTokenOnTable,
  scanTier,
  scanBusy,
  radioStation,
  onViewMode,
  onFloor,
  onSafeVision,
  onKiroshiScan,
  onClearScan,
  onToggleObjective,
}: TableTopHudProps) => {
  const canUseOptics = isGm || (hasTokenOnTable && hasOptics);
  const canUseNet = isGm || (hasTokenOnTable && hasNetDeck);
  const canSafe = isGm || hasTokenOnTable;

  return (
    <header className={styles.wrap}>
      <div className={styles.block}>
        <span className={styles.kicker}>Mesa</span>
        <span className={styles.title}>{sceneTitle}</span>
        <span className={styles.meta}>
          {roleLabel}
          {!published ? ' · PREP' : ''}
          {jammed ? ' · JAM' : ''}
          {radioStation ? ` · ${radioStation}` : ''}
        </span>
      </div>

      {(clocks.length > 0 || objectives.length > 0) && (
        <div className={styles.block} aria-label="Relógios e objetivos">
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
          {objectives.slice(0, 3).map((o) => (
            <label key={o.id} className={styles.objective}>
              <input
                type="checkbox"
                checked={o.done}
                disabled={!isGm}
                onChange={(e) => onToggleObjective(o.id, e.target.checked)}
              />
              {o.text}
            </label>
          ))}
        </div>
      )}

      <div className={styles.block} role="group" aria-label="Modos de visão">
        <span className={styles.kicker}>Visão</span>
        <div className={styles.visionRow}>
          <HudButton
            variant={viewMode === 'normal' ? 'primary' : 'ghost'}
            onClick={() => onViewMode('normal')}
            title="Visão normal (1)"
          >
            Normal
          </HudButton>
          <HudButton
            variant={viewMode === 'scan' ? 'primary' : 'ghost'}
            disabled={!canUseOptics || scanBusy}
            title={
              isGm
                ? 'Scan / Kiroshi (2)'
                : !hasTokenOnTable
                  ? reasonNoToken
                  : !hasOptics
                    ? reasonOptics
                    : 'Scan / Kiroshi (2)'
            }
            onClick={() => {
              if (!canUseOptics) return;
              onKiroshiScan(isGm ? { bypass: true } : undefined);
            }}
          >
            Scan{scanTier != null ? ` T${scanTier}` : ''}
          </HudButton>
          <HudButton
            variant={viewMode === 'net' ? 'primary' : 'ghost'}
            disabled={!canUseNet}
            title={
              isGm
                ? 'Modo NET (3)'
                : !hasTokenOnTable
                  ? reasonNoToken
                  : !hasNetDeck
                    ? reasonDeck
                    : 'Modo NET (3)'
            }
            onClick={() => {
              if (!canUseNet) return;
              onViewMode('net');
            }}
          >
            NET
          </HudButton>
          {scanTier != null && (
            <HudButton variant="ghost" onClick={onClearScan}>
              Limpar
            </HudButton>
          )}
          <HudButton
            variant={safeVision ? 'primary' : 'ghost'}
            disabled={!canSafe}
            title={canSafe ? 'Visão segura (4)' : reasonNoToken}
            onClick={() => {
              if (!canSafe) return;
              onSafeVision(!safeVision);
            }}
          >
            Safe
          </HudButton>
          <label className={styles.floor}>
            F
            <input
              type="number"
              value={floor}
              onChange={(e) => onFloor(Number(e.target.value) || 0)}
              disabled={!isGm}
              aria-label="Andar"
            />
          </label>
        </div>
      </div>
    </header>
  );
};
