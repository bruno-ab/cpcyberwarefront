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
  sceneGmNotes: string;
  safeVision: boolean;
  onViewMode: (mode: ViewMode) => void;
  onFloor: (floor: number) => void;
  onPublish: (published: boolean) => void;
  onJam: (jammed: boolean) => void;
  onAddClock: () => void;
  onAddObjective: () => void;
  onToggleObjective: (id: string, done: boolean) => void;
  onNotes: (text: string) => void;
  onEmote: (emote: string) => void;
  onAddDevice: (kind: string) => void;
  onSafeVision: (on: boolean) => void;
  onRequestRoll: () => void;
};

const EMOTES = ['concordo', 'pausa', '1 min', 'alerta', 'gg'];

export const NightCityBar = ({
  isGm,
  viewMode,
  floor,
  published,
  jammed,
  clocks,
  objectives,
  sceneGmNotes,
  safeVision,
  onViewMode,
  onFloor,
  onPublish,
  onJam,
  onAddClock,
  onAddObjective,
  onToggleObjective,
  onNotes,
  onEmote,
  onAddDevice,
  onSafeVision,
  onRequestRoll,
}: NightCityBarProps) => (
  <div className={styles.wrap}>
    <div className={styles.row}>
      <span className={styles.label}>Night City</span>
      {(['normal', 'scan', 'net'] as ViewMode[]).map((m) => (
        <HudButton
          key={m}
          variant={viewMode === m ? 'primary' : 'ghost'}
          onClick={() => onViewMode(m)}
        >
          {m}
        </HudButton>
      ))}
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
        onClick={() => onSafeVision(!safeVision)}
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

    <div className={styles.row}>
      {EMOTES.map((e) => (
        <HudButton key={e} variant="ghost" onClick={() => onEmote(e)}>
          {e}
        </HudButton>
      ))}
    </div>

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

    {isGm && (
      <label className={styles.notes}>
        Notas GM (cena)
        <textarea
          value={sceneGmNotes}
          onChange={(e) => onNotes(e.target.value)}
          rows={2}
          placeholder="Segredos, gatilhos…"
        />
      </label>
    )}
  </div>
);
