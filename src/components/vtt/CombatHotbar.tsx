'use client';

import { HudButton } from '../ui/HudButton';
import styles from './combatHotbar.module.css';

export type CombatHotbarProps = {
  combatActive: boolean;
  round: number;
  currentTurnName?: string | null;
  myTurn: boolean;
  isGm: boolean;
  aimMode?: boolean;
  aimReady?: boolean;
  aimSummary?: string | null;
  canNet: boolean;
  canShoot: boolean;
  onShoot: () => void;
  onQuickhack: () => void;
  onDodge: () => void;
  onUseItem: () => void;
  onPassTurn: () => void;
  /** When true, sits in bottom chrome instead of floating over the map. */
  docked?: boolean;
};

export const CombatHotbar = ({
  combatActive,
  round,
  currentTurnName,
  myTurn,
  isGm,
  aimMode,
  aimReady,
  aimSummary,
  canNet,
  canShoot,
  onShoot,
  onQuickhack,
  onDodge,
  onUseItem,
  onPassTurn,
  docked,
}: CombatHotbarProps) => (
  <div
    className={docked ? `${styles.wrap} ${styles.wrapDocked}` : styles.wrap}
    role="toolbar"
    aria-label="Ações de combate"
  >
    <div className={styles.status}>
      <span className={styles.label}>
        {combatActive ? `Combate · R${round}` : 'Fora de combate'}
      </span>
      {currentTurnName ? (
        <span className={styles.turn}>
          Turno: <strong>{currentTurnName}</strong>
          {myTurn ? ' · você' : ''}
        </span>
      ) : null}
      {aimMode && aimSummary ? (
        <span className={styles.aim}>{aimSummary}</span>
      ) : null}
    </div>
    <div className={styles.actions}>
      <HudButton
        onClick={onShoot}
        disabled={!canShoot}
        variant={aimMode ? 'primary' : undefined}
        title={
          canShoot
            ? aimMode
              ? 'Confirmar tiro'
              : 'Atirar / mirar'
            : 'Selecione alvo ou ative combate'
        }
      >
        Atirar
      </HudButton>
      <HudButton
        variant="ghost"
        disabled={!canNet}
        onClick={onQuickhack}
        title={canNet ? 'Abrir modo NET' : 'Requer cyberdeck e token na mesa'}
      >
        Quickhack
      </HudButton>
      <HudButton
        variant="ghost"
        disabled={!myTurn && !isGm}
        onClick={onDodge}
        title="Rolar Reflexos + Esquiva"
      >
        Esquivar
      </HudButton>
      <HudButton
        variant="ghost"
        disabled
        onClick={onUseItem}
        title="Em breve — inventário rápido"
      >
        Usar item
      </HudButton>
      <HudButton
        variant="ghost"
        disabled={!isGm && !myTurn}
        onClick={onPassTurn}
        title={
          isGm
            ? 'Próximo turno (Space)'
            : myTurn
              ? 'Pedir avanço ao GM'
              : 'Aguardando seu turno'
        }
      >
        Passar turno
      </HudButton>
    </div>
    {aimMode && !aimReady && (
      <span className={styles.hint}>Mira inválida ou fora de alcance</span>
    )}
  </div>
);
