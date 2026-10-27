'use client';

import { HudButton } from '../ui/HudButton';
import styles from './attackResult.module.css';

export type AttackResultCard = {
  id: string;
  attackerTokenId?: string;
  targetTokenId?: string;
  hit?: { successes?: number; botch?: boolean };
  damage?: { successes?: number } | null;
  range?: { label?: string; band?: string };
  cover?: { label?: string; level?: string };
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
  const missed = hits <= 0 || card.hit?.botch;

  return (
    <article className={styles.card} data-testid="attack-result-card">
      <header className={styles.head}>Ataque</header>
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
        {missed ? ' · Errou' : null}
      </p>
      {(card.range?.label || card.cover?.label) && (
        <p className={styles.meta}>
          {[card.range?.label || card.range?.band, card.cover?.label]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
      {canApplyDamage && !missed && dmg > 0 && card.targetTokenId && (
        <HudButton variant="ghost" onClick={onApplyDamage}>
          Aplicar dano
        </HudButton>
      )}
    </article>
  );
}
