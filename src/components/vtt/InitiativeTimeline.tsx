'use client';

import { resolveMediaSrc } from '../../lib/media';
import { HudButton } from '../ui/HudButton';
import type { InitiativeEntry } from './CombatHud';
import styles from './initiativeTimeline.module.css';

export type InitiativeTimelineProps = {
  visible: boolean;
  combatActive: boolean;
  round: number;
  turnIndex: number;
  initiative: InitiativeEntry[];
  tokenPortraitById?: Record<string, string | null | undefined>;
  myTokenIds?: string[];
  isGm?: boolean;
  onToggleVisible: () => void;
  onNext?: () => void;
};

export const InitiativeTimeline = ({
  visible,
  combatActive,
  round,
  turnIndex,
  initiative,
  tokenPortraitById = {},
  myTokenIds = [],
  isGm,
  onToggleVisible,
  onNext,
}: InitiativeTimelineProps) => {
  if (!visible) {
    return (
      <div className={styles.collapsedBar}>
        <button
          type="button"
          className={styles.showBtn}
          onClick={onToggleVisible}
          title="Mostrar linha do tempo de iniciativa"
        >
          Iniciativa
        </button>
      </div>
    );
  }

  const hasOrder = initiative.length > 0;

  return (
    <div className={styles.wrap} role="region" aria-label="Linha do tempo de iniciativa">
      <div className={styles.head}>
        <span className={styles.title}>
          {combatActive ? `Combate · R${round}` : 'Ordem de turno'}
        </span>
        <div className={styles.headActions}>
          {isGm && onNext && hasOrder ? (
            <HudButton variant="ghost" onClick={onNext}>
              Próximo
            </HudButton>
          ) : null}
          <button
            type="button"
            className={styles.hideBtn}
            onClick={onToggleVisible}
            title="Ocultar linha do tempo"
          >
            Ocultar
          </button>
        </div>
      </div>
      {!hasOrder ? (
        <p className={styles.empty}>Sem iniciativa — GM pode rolar ou definir ordem.</p>
      ) : (
        <ol className={styles.track}>
          {initiative.map((ini, i) => {
            const current = i === turnIndex;
            const mine = myTokenIds.includes(ini.tokenId);
            const portraitRaw = tokenPortraitById[ini.tokenId];
            const portrait =
              resolveMediaSrc(portraitRaw) || portraitRaw || null;
            return (
              <li
                key={ini.tokenId}
                className={styles.chip}
                data-current={current ? '1' : '0'}
                data-mine={mine ? '1' : '0'}
              >
                {portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={portrait} alt="" className={styles.chipImg} />
                ) : (
                  <span className={styles.chipFallback}>
                    {ini.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className={styles.chipName}>{ini.name}</span>
                <span className={styles.chipScore}>{ini.score}</span>
                {ini.delayed ? <span className={styles.chipTag}>delay</span> : null}
                {ini.holding ? <span className={styles.chipTag}>hold</span> : null}
                {current ? <span className={styles.nowPulse} aria-hidden /> : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
