'use client';

import { HudButton } from '../ui/HudButton';
import styles from './droneHud.module.css';

export type DroneSheetView = {
  profileId?: string;
  label?: string;
  role?: string;
  physical?: Record<string, number>;
  mental?: Record<string, number>;
  skills?: Record<string, number>;
  weapons?: string[];
  notes?: string;
};

export type DroneTokenView = {
  id: string;
  name: string;
  kind?: string;
  controllerPlayerId?: number;
  ownerPlayerId?: number;
  parentTokenId?: string;
  signalJammed?: boolean;
  bars?: {
    hp?: number;
    hpMax?: number;
    battery?: number;
    batteryMax?: number;
    signal?: number;
  };
  droneSheet?: DroneSheetView;
  auras?: string[];
};

type Presence = { playerId: number; name: string; role: string };

type DroneHudProps = {
  drone: DroneTokenView;
  presence: Presence[];
  isGm: boolean;
  canControl: boolean;
  onAssign: (controllerPlayerId: number | null) => void;
  onRecharge: () => void;
  onJam: (jammed: boolean) => void;
  onRefresh: () => void;
};

const band = (signal?: number) => {
  const s = Number(signal) || 0;
  if (s <= 0) return 'lost';
  if (s <= 25) return 'critical';
  if (s <= 55) return 'weak';
  return 'strong';
};

export const DroneHud = ({
  drone,
  presence,
  isGm,
  canControl,
  onAssign,
  onRecharge,
  onJam,
  onRefresh,
}: DroneHudProps) => {
  const sig = Number(drone.bars?.signal) || 0;
  const bat = Number(drone.bars?.battery) || 0;
  const batMax = Number(drone.bars?.batteryMax) || 1;
  const sheet = drone.droneSheet;
  const b = band(sig);

  return (
    <div className={styles.wrap} data-band={b}>
      <header className={styles.head}>
        <div>
          <span className={styles.kind}>{drone.kind || 'drone'}</span>
          <strong>{drone.name}</strong>
        </div>
        <span className={styles.band}>{b}</span>
      </header>

      <div className={styles.meters}>
        <label>
          BAT
          <div className={styles.track}>
            <i style={{ width: `${(bat / Math.max(1, batMax)) * 100}%` }} />
          </div>
          <em>
            {bat}/{batMax}
          </em>
        </label>
        <label>
          SIG
          <div className={styles.track} data-sig="1">
            <i style={{ width: `${Math.max(0, Math.min(100, sig))}%` }} />
          </div>
          <em>{sig}%</em>
        </label>
      </div>

      {sheet && (
        <div className={styles.sheet}>
          <div className={styles.row}>
            <span>{sheet.label || sheet.profileId}</span>
            <span>{sheet.role}</span>
          </div>
          <div className={styles.stats}>
            DEX {sheet.physical?.dexterity ?? '—'} · PER{' '}
            {sheet.mental?.perception ?? '—'} · INT{' '}
            {sheet.mental?.intelligence ?? '—'}
          </div>
          {sheet.weapons && sheet.weapons.length > 0 && (
            <div className={styles.notes}>{sheet.weapons.join(', ')}</div>
          )}
          {sheet.notes && <div className={styles.notes}>{sheet.notes}</div>}
        </div>
      )}

      <div className={styles.meta}>
        <span>owner P{drone.ownerPlayerId ?? '—'}</span>
        <span>pilot P{drone.controllerPlayerId ?? '—'}</span>
        {drone.signalJammed && <span data-hot="1">JAMMED</span>}
      </div>

      {(isGm || canControl) && (
        <div className={styles.actions}>
          <label className={styles.assign}>
            Controle
            <select
              value={drone.controllerPlayerId ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                onAssign(v === '' ? null : Number(v));
              }}
            >
              <option value="">—</option>
              {presence.map((p) => (
                <option key={p.playerId} value={p.playerId}>
                  {p.name} (P{p.playerId})
                </option>
              ))}
            </select>
          </label>
          <HudButton variant="ghost" onClick={onRecharge}>
            Recarregar BAT
          </HudButton>
          {isGm && (
            <HudButton
              variant="ghost"
              onClick={() => onJam(!drone.signalJammed)}
            >
              {drone.signalJammed ? 'Limpar jam' : 'Jam sinal'}
            </HudButton>
          )}
          <HudButton variant="ghost" onClick={onRefresh}>
            Refresh SIG
          </HudButton>
        </div>
      )}
    </div>
  );
};

export const DRONE_SPAWN_OPTIONS = [
  { id: 'watcher', label: 'Watcher' },
  { id: 'scout', label: 'Scout' },
  { id: 'combat', label: 'Combat' },
  { id: 'tech-bot', label: 'Tech-bot' },
  { id: 'summon-ice', label: 'ICE summon' },
] as const;
