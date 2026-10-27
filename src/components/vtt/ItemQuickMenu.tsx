'use client';

import { HudButton } from '../ui/HudButton';
import styles from './itemQuickMenu.module.css';

export type QuickGearItem = {
  id?: string | number;
  name: string;
  qty?: number;
  charges?: number;
  type?: string;
  effect?: string;
  heal?: number;
};

type Props = {
  open: boolean;
  items: QuickGearItem[];
  busy?: boolean;
  onClose: () => void;
  onUse: (item: QuickGearItem) => void;
};

export const ItemQuickMenu = ({
  open,
  items,
  busy,
  onClose,
  onUse,
}: Props) => {
  if (!open) return null;

  return (
    <div className={styles.wrap} role="dialog" aria-label="Inventário rápido">
      <header className={styles.head}>
        <span>Usar item</span>
        <HudButton variant="ghost" onClick={onClose}>
          Fechar
        </HudButton>
      </header>
      {items.length === 0 ? (
        <p className={styles.empty}>
          Sem consumíveis na ficha. Adicione gear em Inventário.
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((item, i) => {
            const qty = Math.max(0, Number(item.qty ?? item.charges ?? 1) || 0);
            return (
              <li key={`${item.id ?? item.name}-${i}`}>
                <div className={styles.meta}>
                  <strong>{item.name}</strong>
                  <span>
                    ×{qty}
                    {item.heal || item.effect || item.type
                      ? ` · ${item.heal ? `+${item.heal} HP` : item.effect || item.type}`
                      : ''}
                  </span>
                </div>
                <HudButton
                  disabled={busy || qty <= 0}
                  onClick={() => onUse(item)}
                >
                  Usar
                </HudButton>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ItemQuickMenu;
