'use client';

import { HudButton } from '../ui/HudButton';
import styles from './attackResult.module.css';

export type AttackResultCard = {
  id: string;
  attackerTokenId?: string;
  targetTokenId?: string;
  hit?: {
    successes?: number;
    botch?: boolean;
    crit?: boolean;
    tens?: number;
    ones?: number;
  };
  damage?: { successes?: number } | null;
  range?: { label?: string; band?: string };
  cover?: { label?: string; level?: string };
  los?: { clear?: boolean; label?: string };
  conditions?: Array<{ id: string; kind: string; label: string; roundsLeft: number }>;
  verdict?: 'botch' | 'crit' | 'hit' | 'miss';
  difficulty?: number;
};

type Props = {
  card: AttackResultCard;
  attackerName?: string;
  targetName?: string;
  canApplyDamage: boolean;
  onApplyDamage: () => void;
};

export function AttackResultCard({
  card,
  attackerName,
  targetName,
  canApplyDamage,
  onApplyDamage,
}: Props) {
  const hits = card.hit?.successes ?? 0;
  const dmg = card.damage?.successes ?? 0;
  const botch = !!card.hit?.botch || card.verdict === 'botch';
  const crit = !!card.hit?.crit || card.verdict === 'crit';
  const missed = botch || hits <= 0 || card.verdict === 'miss';
  const verdictLabel = botch
    ? 'BOTCH'
    : crit
      ? 'CRÍTICO'
      : missed
        ? 'ERROU'
        : 'ACERTO';

  return (
    <article
      className={styles.card}
      data-testid="attack-result-card"
      data-verdict={botch ? 'botch' : crit ? 'crit' : missed ? 'miss' : 'hit'}
    >
      <header className={styles.head}>
        Ataque
        <span className={styles.verdict} data-verdict={botch ? 'botch' : crit ? 'crit' : missed ? 'miss' : 'hit'}>
          {verdictLabel}
        </span>
      </header>
      <p className={styles.line}>
        <strong>{attackerName || 'Atacante'}</strong>
        {' → '}
        <strong>{targetName || 'Alvo'}</strong>
      </p>
      <p className={styles.line}>
        Acertos: <strong>{hits}</strong>
        {!missed && card.damage ? (
          <>
            {' · '}
            Dano: <strong>{dmg}</strong>
          </>
        ) : null}
        {card.difficulty != null ? (
          <>
            {' · '}
            Dif: <strong>{card.difficulty}</strong>
          </>
        ) : null}
      </p>
      <p className={styles.meta}>
        {[
          card.range?.label || card.range?.band,
          card.cover?.label ||
            (card.los?.clear === false
              ? card.los?.label || 'cobertura'
              : card.los?.label || 'LoS limpa'),
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {card.conditions && card.conditions.length > 0 ? (
        <p className={styles.conds}>
          Condições no alvo:{' '}
          {card.conditions
            .map((c) => `${c.label} (${c.roundsLeft}r)`)
            .join(', ')}
        </p>
      ) : null}
      {canApplyDamage && !missed && dmg > 0 && card.targetTokenId && (
        <HudButton variant="ghost" onClick={onApplyDamage}>
          Aplicar dano
        </HudButton>
      )}
    </article>
  );
}
