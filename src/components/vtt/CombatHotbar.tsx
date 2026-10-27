'use client';

import { HudButton } from '../ui/HudButton';
import styles from './combatHotbar.module.css';

export type TurnEconomyView = {
  tokenId: string;
  mainUsed: boolean;
  moveUsed: boolean;
  reactionUsed: boolean;
  extraActions: number;
} | null;

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
  canUseItem: boolean;
  turnEconomy?: TurnEconomyView;
  onShoot: () => void;
  onQuickhack: () => void;
  onDodge: () => void;
  onUseItem: () => void;
  onPassTurn: () => void;
  onTurnAction: (kind: 'main' | 'move' | 'reaction' | 'extra') => void;
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
  canUseItem,
  turnEconomy,
  onShoot,
  onQuickhack,
  onDodge,
  onUseItem,
  onPassTurn,
  onTurnAction,
  docked,
}: CombatHotbarProps) => {
  const showEconomy = combatActive && (myTurn || isGm) && !!turnEconomy;
  const mainBlocked =
    !!combatActive &&
    !!turnEconomy &&
    (myTurn || isGm) &&
    turnEconomy.mainUsed &&
    turnEconomy.extraActions <= 0;

  return (
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

      {showEconomy ? (
        <div className={styles.economy} aria-label="Economia de turno">
          <HudButton
            variant={turnEconomy!.mainUsed ? 'ghost' : 'primary'}
            disabled={turnEconomy!.mainUsed}
            onClick={() => onTurnAction('main')}
            title="Marcar ação principal como usada"
          >
            Ação{turnEconomy!.mainUsed ? ' ✓' : ''}
          </HudButton>
          <HudButton
            variant={turnEconomy!.moveUsed ? 'ghost' : 'primary'}
            disabled={turnEconomy!.moveUsed}
            onClick={() => onTurnAction('move')}
            title="Marcar movimento como usado"
          >
            Mov{turnEconomy!.moveUsed ? ' ✓' : ''}
          </HudButton>
          <HudButton
            variant={turnEconomy!.reactionUsed ? 'ghost' : 'primary'}
            disabled={turnEconomy!.reactionUsed}
            onClick={() => onTurnAction('reaction')}
            title="Marcar reação como usada"
          >
            Reação{turnEconomy!.reactionUsed ? ' ✓' : ''}
          </HudButton>
          <HudButton
            variant="ghost"
            disabled={turnEconomy!.extraActions <= 0}
            onClick={() => onTurnAction('extra')}
            title="Gastar ação extra (Sandevistan etc.)"
          >
            Extra ({turnEconomy!.extraActions})
          </HudButton>
        </div>
      ) : null}

      <div className={styles.actions}>
        <HudButton
          onClick={onShoot}
          disabled={!canShoot || mainBlocked}
          variant={aimMode ? 'primary' : undefined}
          title={
            mainBlocked
              ? 'Ação principal já usada — passe o turno ou gaste Extra'
              : canShoot
                ? aimMode
                  ? 'Confirmar tiro'
                  : 'Atirar / mirar'
                : 'Selecione alvo ou aguarde seu turno'
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
          disabled={(!myTurn && !isGm) || (!!turnEconomy?.reactionUsed && myTurn)}
          onClick={onDodge}
          title="Rolar Reflexos + Esquiva (reação)"
        >
          Esquivar
        </HudButton>
        <HudButton
          variant="ghost"
          disabled={!canUseItem || mainBlocked}
          onClick={onUseItem}
          title={
            canUseItem
              ? 'Usar consumível do inventário'
              : 'Sem token/ficha ou inventário vazio'
          }
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
                ? 'Encerrar seu turno e passar para o próximo'
                : 'Aguardando seu turno'
          }
        >
          Passar turno
        </HudButton>
      </div>
      {aimMode && !aimReady && (
        <span className={styles.hint}>Mira inválida ou fora de alcance</span>
      )}
      {mainBlocked ? (
        <span className={styles.hint}>
          Economia: ação principal esgotada
        </span>
      ) : null}
    </div>
  );
};
