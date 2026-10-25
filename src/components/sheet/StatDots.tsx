'use client';

import styles from './StatDots.module.css';

type Props = {
  base: number;
  bonus?: number;
  max?: number;
  onBaseClick?: (index: number) => void;
  label?: string;
  showTotal?: boolean;
};

/**
 * Bolinhas da ficha: trilho fixo, base (ciano) + chrome (vermelho) depois.
 * Só a faixa base (índices &lt; max) é clicável.
 */
export const StatDots = ({
  base,
  bonus = 0,
  max = 5,
  onBaseClick,
  label,
  showTotal = true,
}: Props) => {
  const baseN = Math.max(0, Math.min(max, Number(base) || 0));
  const bonusN = Math.max(0, Number(bonus) || 0);
  const total = baseN + bonusN;
  const length = Math.min(10, Math.max(max, total));

  return (
    <span className={styles.wrap} title={label}>
      <span className={styles.rail} aria-hidden={!onBaseClick}>
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
              onClick={clickable ? () => onBaseClick?.(index) : undefined}
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
      </span>
      {showTotal ? (
        <span className={styles.meta}>
          {bonusN > 0 ? (
            <em className={styles.bonusTag}>
              {baseN}(+{bonusN})
            </em>
          ) : (
            <span className={styles.total}>{baseN}</span>
          )}
        </span>
      ) : null}
    </span>
  );
};

export default StatDots;
