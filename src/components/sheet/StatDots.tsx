'use client';

import styles from './StatDots.module.css';

type Props = {
  base: number;
  bonus?: number;
  max?: number;
  onBaseClick?: (index: number) => void;
  label?: string;
};

/**
 * Bolinhas da ficha: base (ciano) + bônus de chrome (vermelho).
 * Só a faixa base é clicável.
 */
export const StatDots = ({
  base,
  bonus = 0,
  max = 5,
  onBaseClick,
  label,
}: Props) => {
  const baseN = Math.max(0, Number(base) || 0);
  const bonusN = Math.max(0, Number(bonus) || 0);
  const total = baseN + bonusN;
  const length = Math.min(10, Math.max(max, total));

  return (
    <span className={styles.track} title={label}>
      {Array.from({ length }, (_, index) => {
        const isBase = index < baseN;
        const isBonus = !isBase && index < total;
        const tier = isBase ? 'base' : isBonus ? 'bonus' : 'empty';
        const clickable = Boolean(onBaseClick) && index < max;
        return (
          <span
            key={index}
            role={clickable ? 'button' : 'img'}
            tabIndex={clickable ? 0 : undefined}
            aria-label={
              isBase
                ? `Bolinha base ${index + 1}`
                : isBonus
                  ? `Bolinha chrome +${index - baseN + 1}`
                  : `Bolinha vazia ${index + 1}`
            }
            className={styles.dot}
            data-tier={tier}
            onClick={
              clickable
                ? () => onBaseClick?.(index)
                : undefined
            }
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onBaseClick?.(index);
                    }
                  }
                : undefined
            }
          >
            ●
          </span>
        );
      })}
      {bonusN > 0 ? (
        <em className={styles.bonusTag}>+{bonusN}</em>
      ) : null}
    </span>
  );
};

export default StatDots;
