'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { RarityBadge } from '../../components/ui/RarityBadge';
import { CyberwareFilterBar } from '../../components/cyberware/CyberwareFilterBar';
import { CYBERWARE_CATALOG } from '../../data/cyberwareCatalog';
import { SLOT_LABELS, CyberWareSlot } from '../../data/cyberwareSlots';
import {
  CYBERWARE_RARITIES,
  DEFAULT_CYBERWARE_FILTERS,
  matchesChromeFilters,
  rarityRank,
  sortChromeItems,
  type CyberwareFilterState,
} from '../../lib/cyberwareFilters';
import { apiUrl } from '../../lib/api';
import { cyberwareImageSrc } from '../../lib/media';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './catalog.module.css';

type CatalogItem = (typeof CYBERWARE_CATALOG)[number] & {
  id?: number | string;
  price?: number;
};

type CatalogView = 'grid' | 'list' | 'category' | 'rarity';

const VIEW_OPTS: { id: CatalogView; labelKey: string }[] = [
  { id: 'grid', labelKey: 'viewGrid' },
  { id: 'list', labelKey: 'viewList' },
  { id: 'category', labelKey: 'viewCategory' },
  { id: 'rarity', labelKey: 'viewRarity' },
];

const SLOT_ORDER = Object.keys(SLOT_LABELS) as CyberWareSlot[];

const CatalogCard = ({
  item,
  view,
}: {
  item: CatalogItem;
  view: CatalogView;
}) => {
  const slotLabel = SLOT_LABELS[item.type as CyberWareSlot] || item.type;
  const compact = view === 'list';

  return (
    <article
      className={styles.card}
      data-view={view === 'list' ? 'list' : 'grid'}
      data-rarity={String(item.rarity || '').toLowerCase()}
    >
      <div className={styles.media}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cyberwareImageSrc(item)}
          alt={item.name}
          className={styles.thumb}
          width={compact ? 56 : 120}
          height={compact ? 56 : 120}
        />
      </div>
      <div className={styles.body}>
        <header className={styles.cardHead}>
          <h2 className={styles.cardTitle}>{item.name}</h2>
          <div className={styles.cardMeta}>
            <RarityBadge rarity={item.rarity} />
            <span className={styles.slotTag}>{slotLabel}</span>
            <span className={styles.sourceTag}>{item.source}</span>
          </div>
        </header>
        {!compact && <p className={styles.desc}>{item.description}</p>}
        <ul className={styles.stats}>
          <li>
            <strong>E</strong> {item.edgeCost}
          </li>
          <li>
            <strong>Hack</strong> {item.hackDifficulty}
          </li>
          <li>
            <strong>Impl</strong> {item.implantCost}
          </li>
          <li>
            <strong>HUM</strong> {item.humanityCost}
          </li>
          {item.price != null && (
            <li>
              <strong>¤</strong> {Number(item.price).toLocaleString('pt-BR')}
            </li>
          )}
        </ul>
        <p className={styles.effect}>{item.effect}</p>
      </div>
    </article>
  );
};

const CatalogPage = () => {
  const { t } = useTranslations('catalog');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [view, setView] = useState<CatalogView>('grid');
  const [filters, setFilters] = useState<CyberwareFilterState>({
    ...DEFAULT_CYBERWARE_FILTERS,
    sort: 'rarity',
  });
  const [items, setItems] = useState<CatalogItem[]>(CYBERWARE_CATALOG);

  useEffect(() => {
    fetch(apiUrl('/api/cyberware/catalog'))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.items?.length) setItems(data.items);
      })
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const rows = items.filter((item) => {
      const sourceOk =
        sourceFilter === 'all' || item.source === sourceFilter;
      if (!sourceOk) return false;
      return matchesChromeFilters(
        {
          id: item.id ?? item.name,
          name: item.name,
          type: item.type,
          rarity: item.rarity,
          description: item.description,
          effect: item.effect,
          price: item.price,
          edgeCost: item.edgeCost,
        },
        filters,
      );
    });
    return sortChromeItems(rows, filters.sort);
  }, [items, sourceFilter, filters]);

  const groupedBySlot = useMemo(() => {
    const map = new Map<string, CatalogItem[]>();
    for (const slot of SLOT_ORDER) map.set(slot, []);
    for (const item of filtered) {
      const key = item.type in SLOT_LABELS ? item.type : 'other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).filter(([, list]) => list.length > 0);
  }, [filtered]);

  const groupedByRarity = useMemo(() => {
    const map = new Map<string, CatalogItem[]>();
    for (const r of CYBERWARE_RARITIES) map.set(r, []);
    for (const item of filtered) {
      const key =
        CYBERWARE_RARITIES.find(
          (r) => r.toLowerCase() === String(item.rarity || '').toLowerCase(),
        ) || 'Common';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries())
      .filter(([, list]) => list.length > 0)
      .sort((a, b) => rarityRank(b[0]) - rarityRank(a[0]));
  }, [filtered]);

  const slotCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  }, [items]);

  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const key = String(item.rarity || 'Common');
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [items]);

  const renderFlat = (list: CatalogItem[]) => (
    <div
      className={styles.cards}
      data-view={view === 'list' ? 'list' : 'grid'}
    >
      {list.map((item) => (
        <CatalogCard
          key={`${item.name}-${item.type}`}
          item={item}
          view={view === 'list' ? 'list' : 'grid'}
        />
      ))}
    </div>
  );

  return (
    <PageFrame>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.intro}>{t('intro')}</p>
        </div>
        <div className={styles.summary}>
          <span>
            {filtered.length}/{items.length} {t('pieces')}
          </span>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.viewToggle} role="group" aria-label={t('view')}>
          {VIEW_OPTS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={styles.viewBtn}
              data-active={view === opt.id ? '1' : '0'}
              onClick={() => setView(opt.id)}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
        <label className={styles.sourceField}>
          <span>{t('source')}</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">{t('all')}</option>
            <option value="cp2077">CP2077</option>
            <option value="edgerunners">Edgerunners</option>
            <option value="both">{t('both')}</option>
          </select>
        </label>
      </div>

      <CyberwareFilterBar
        value={filters}
        onChange={setFilters}
        showStatus={false}
        showAffordable={false}
        resultCount={filtered.length}
        searchPlaceholder={t('searchPlaceholder')}
      />

      <div className={styles.quickNav}>
        <div className={styles.chipRow}>
          <span className={styles.chipLabel}>{t('slot')}</span>
          <button
            type="button"
            className={styles.chip}
            data-active={filters.type === 'all' ? '1' : '0'}
            onClick={() => setFilters((f) => ({ ...f, type: 'all' }))}
          >
            {t('all')}
          </button>
          {SLOT_ORDER.map((slot) => (
            <button
              key={slot}
              type="button"
              className={styles.chip}
              data-active={filters.type === slot ? '1' : '0'}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  type: f.type === slot ? 'all' : slot,
                }))
              }
            >
              {SLOT_LABELS[slot]}
              <i>{slotCounts[slot] || 0}</i>
            </button>
          ))}
        </div>
        <div className={styles.chipRow}>
          <span className={styles.chipLabel}>{t('rarity')}</span>
          <button
            type="button"
            className={styles.chip}
            data-active={filters.rarity === 'all' ? '1' : '0'}
            onClick={() => setFilters((f) => ({ ...f, rarity: 'all' }))}
          >
            {t('all')}
          </button>
          {CYBERWARE_RARITIES.map((r) => (
            <button
              key={r}
              type="button"
              className={styles.chip}
              data-active={filters.rarity === r ? '1' : '0'}
              data-rarity={r.toLowerCase()}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  rarity: f.rarity === r ? 'all' : r,
                }))
              }
            >
              {r}
              <i>{rarityCounts[r] || 0}</i>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <HudPanel title={t('emptyTitle')}>
          <p className={styles.empty}>{t('empty')}</p>
        </HudPanel>
      ) : view === 'category' ? (
        <div className={styles.groups}>
          {groupedBySlot.map(([slot, list]) => (
            <section key={slot} className={styles.group}>
              <header className={styles.groupHead}>
                <h2>{SLOT_LABELS[slot as CyberWareSlot] || slot}</h2>
                <span>
                  {list.length} {t('pieces')}
                </span>
              </header>
              {renderFlat(list)}
            </section>
          ))}
        </div>
      ) : view === 'rarity' ? (
        <div className={styles.groups}>
          {groupedByRarity.map(([rarity, list]) => (
            <section
              key={rarity}
              className={styles.group}
              data-rarity={rarity.toLowerCase()}
            >
              <header className={styles.groupHead}>
                <h2>
                  <RarityBadge rarity={rarity} />
                </h2>
                <span>
                  {list.length} {t('pieces')}
                </span>
              </header>
              {renderFlat(list)}
            </section>
          ))}
        </div>
      ) : (
        renderFlat(filtered)
      )}
    </PageFrame>
  );
};

export default CatalogPage;
