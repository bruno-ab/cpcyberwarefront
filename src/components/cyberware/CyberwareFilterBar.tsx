'use client';

import {
  CYBERWARE_RARITIES,
  DEFAULT_CYBERWARE_FILTERS,
  hasActiveCyberwareFilters,
  type CyberwareFilterState,
  type CyberwareFilterStatus,
  type CyberwareSort,
} from '../../lib/cyberwareFilters';
import { SLOT_LABELS } from '../../data/cyberwareSlots';
import styles from './CyberwareFilterBar.module.css';

type Props = {
  value: CyberwareFilterState;
  onChange: (next: CyberwareFilterState) => void;
  /** Quando a região do corpo já fixa o tipo, esconde o select de slot. */
  hideType?: boolean;
  showStatus?: boolean;
  showAffordable?: boolean;
  resultCount?: number;
  searchPlaceholder?: string;
};

const STATUS_OPTS: { value: CyberwareFilterStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'buyable', label: 'À venda' },
  { value: 'owned', label: 'No inventário' },
  { value: 'installed', label: 'Instalados' },
];

const SORT_OPTS: { value: CyberwareSort; label: string }[] = [
  { value: 'name', label: 'Nome' },
  { value: 'price-asc', label: 'Preço ↑' },
  { value: 'price-desc', label: 'Preço ↓' },
  { value: 'rarity', label: 'Raridade' },
  { value: 'edge', label: 'Edges' },
];

export const CyberwareFilterBar = ({
  value,
  onChange,
  hideType = false,
  showStatus = true,
  showAffordable = true,
  resultCount,
  searchPlaceholder = 'Buscar por nome, tipo, efeito…',
}: Props) => {
  const patch = (partial: Partial<CyberwareFilterState>) =>
    onChange({ ...value, ...partial });

  const active = hasActiveCyberwareFilters(value);

  return (
    <div className={styles.bar} role="search" aria-label="Filtros de cyberware">
      <div className={styles.row}>
        <label className={styles.fieldGrow}>
          <span className={styles.label}>Nome</span>
          <input
            className={styles.input}
            type="search"
            placeholder={searchPlaceholder}
            value={value.query}
            onChange={(e) => patch({ query: e.target.value })}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Raridade</span>
          <select
            className={styles.select}
            value={value.rarity}
            onChange={(e) =>
              patch({
                rarity: e.target.value as CyberwareFilterState['rarity'],
              })
            }
          >
            <option value="all">Todas</option>
            {CYBERWARE_RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        {showStatus ? (
          <label className={styles.field}>
            <span className={styles.label}>Status</span>
            <select
              className={styles.select}
              value={value.status}
              onChange={(e) =>
                patch({ status: e.target.value as CyberwareFilterStatus })
              }
            >
              {STATUS_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {!hideType ? (
          <label className={styles.field}>
            <span className={styles.label}>Slot</span>
            <select
              className={styles.select}
              value={value.type}
              onChange={(e) => patch({ type: e.target.value })}
            >
              <option value="all">Todos</option>
              {Object.entries(SLOT_LABELS).map(([slot, label]) => (
                <option key={slot} value={slot}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className={styles.field}>
          <span className={styles.label}>Ordenar</span>
          <select
            className={styles.select}
            value={value.sort}
            onChange={(e) => patch({ sort: e.target.value as CyberwareSort })}
          >
            {SORT_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Preço min ¤</span>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            placeholder="0"
            value={value.priceMin}
            onChange={(e) => patch({ priceMin: e.target.value })}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Preço max ¤</span>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            placeholder="∞"
            value={value.priceMax}
            onChange={(e) => patch({ priceMax: e.target.value })}
          />
        </label>

        {showAffordable ? (
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={value.affordableOnly}
              onChange={(e) => patch({ affordableOnly: e.target.checked })}
            />
            <span>Só o que posso pagar</span>
          </label>
        ) : null}

        <div className={styles.meta}>
          {typeof resultCount === 'number' ? (
            <span className={styles.count}>
              {resultCount} peça{resultCount === 1 ? '' : 's'}
            </span>
          ) : null}
          {active ? (
            <button
              type="button"
              className={styles.clear}
              onClick={() =>
                onChange({
                  ...DEFAULT_CYBERWARE_FILTERS,
                  type: hideType ? value.type : 'all',
                })
              }
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CyberwareFilterBar;
