'use client';

import { HudButton } from '../ui/HudButton';
import { InitiativeReorderList } from './InitiativeReorderList';
import styles from './combatHud.module.css';

export type InitiativeEntry = {
  tokenId: string;
  name: string;
  score: number;
  delayed?: boolean;
  holding?: boolean;
  extraTurns?: number;
};

type CombatHudProps = {
  isGm: boolean;
  combatActive: boolean;
  round: number;
  turnIndex: number;
  initiative: InitiativeEntry[];
  turnEconomy?: {
    tokenId: string;
    mainUsed: boolean;
    moveUsed: boolean;
    reactionUsed: boolean;
    extraActions: number;
  } | null;
  myTokenIds: string[];
  onStart: () => void;
  onRollAll: () => void;
  onNext: () => void;
  onDelay: () => void;
  onHold: () => void;
  onEnd: () => void;
  lockMoveToTurn?: boolean;
  onToggleLockMoveToTurn?: (enabled: boolean) => void;
  onAction: (kind: 'main' | 'move' | 'reaction' | 'extra') => void;
  aimMode?: boolean;
  aimSummary?: string | null;
  aimReady?: boolean;
  onToggleAim: () => void;
  onAttack: () => void;
  onSandy: () => void;
  sandyRamCost?: number | null;
  onReorderInitiative?: (order: string[]) => void;
};

export const CombatHud = ({
  isGm,
  combatActive,
  round,
  turnIndex,
  initiative,
  turnEconomy,
  myTokenIds,
  onStart,
  onRollAll,
  onNext,
  onDelay,
  onHold,
  onEnd,
  lockMoveToTurn,
  onToggleLockMoveToTurn,
  onAction,
  aimMode,
  aimSummary,
  aimReady,
  onToggleAim,
  onAttack,
  onSandy,
  sandyRamCost,
  onReorderInitiative,
}: CombatHudProps) => {
  const current = initiative[turnIndex];
  const myTurn =
    !!current &&
    (isGm || myTokenIds.includes(current.tokenId));

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.label}>
          Combate {combatActive ? `· R${round}` : '· off'}
        </span>
        {isGm && (
          <div className={styles.row}>
            {!combatActive ? (
              <HudButton onClick={onStart}>Iniciar</HudButton>
            ) : (
              <HudButton variant="ghost" onClick={onEnd}>
                Encerrar
              </HudButton>
            )}
            <HudButton onClick={onRollAll}>Rolar iniciativa</HudButton>
            <HudButton variant="ghost" onClick={onNext}>
              Próximo
            </HudButton>
            {onToggleLockMoveToTurn && (
              <HudButton
                variant={lockMoveToTurn ? 'primary' : 'ghost'}
                onClick={() => onToggleLockMoveToTurn(!lockMoveToTurn)}
                title="Jogadores só movem o token do turno atual; narrador sempre pode mover"
              >
                {lockMoveToTurn
                  ? 'Só move no turno: ON'
                  : 'Só move no turno'}
              </HudButton>
            )}
          </div>
        )}
      </div>

      <InitiativeReorderList
        initiative={initiative}
        turnIndex={turnIndex}
        draggable={isGm && !!onReorderInitiative}
        onReorder={onReorderInitiative}
      />

      {current && (
        <div className={styles.turnBox}>
          <p>
            Turno: <strong>{current.name}</strong>
          </p>
          {myTurn && turnEconomy && (
            <div className={styles.row}>
              <HudButton
                variant={turnEconomy.mainUsed ? 'ghost' : 'primary'}
                disabled={turnEconomy.mainUsed}
                onClick={() => onAction('main')}
              >
                Ação
              </HudButton>
              <HudButton
                variant={turnEconomy.moveUsed ? 'ghost' : 'primary'}
                disabled={turnEconomy.moveUsed}
                onClick={() => onAction('move')}
              >
                Movimento
              </HudButton>
              <HudButton
                variant={turnEconomy.reactionUsed ? 'ghost' : 'primary'}
                disabled={turnEconomy.reactionUsed}
                onClick={() => onAction('reaction')}
              >
                Reação
              </HudButton>
              <HudButton
                variant="ghost"
                disabled={turnEconomy.extraActions <= 0}
                onClick={() => onAction('extra')}
              >
                Extra ({turnEconomy.extraActions})
              </HudButton>
              <HudButton
                variant={aimMode ? 'primary' : 'ghost'}
                onClick={onToggleAim}
              >
                {aimMode ? 'Cancelar mira' : 'Mirar'}
              </HudButton>
              <HudButton
                onClick={onAttack}
                disabled={aimMode ? !aimReady : false}
                title={aimSummary || 'Atacar token selecionado'}
              >
                {aimMode ? 'Confirmar tiro' : 'Atacar alvo'}
              </HudButton>
              {aimMode && aimSummary && (
                <span className={styles.aimHint}>{aimSummary}</span>
              )}
              <HudButton variant="ghost" onClick={onSandy}>
                Sandevistan
                {sandyRamCost != null ? ` · RAM ${sandyRamCost}` : ''}
              </HudButton>
              <HudButton variant="ghost" onClick={onDelay}>
                Atrasar
              </HudButton>
              <HudButton variant="ghost" onClick={onHold}>
                Prontidão
              </HudButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
