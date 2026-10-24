'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { RarityBadge } from '../../components/ui/RarityBadge';
import { CYBERWARE_CATALOG } from '../../data/cyberwareCatalog';
import { SLOT_LABELS, CyberWareSlot } from '../../data/cyberwareSlots';
import { apiUrl } from '../../lib/api';
import { cyberwareImageSrc } from '../../lib/media';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './catalog.module.css';

type CatalogItem = (typeof CYBERWARE_CATALOG)[number];

const CatalogPage = () => {
  const { t } = useTranslations('catalog');
  const [slotFilter, setSlotFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [items, setItems] = useState<CatalogItem[]>(CYBERWARE_CATALOG);

  useEffect(() => {
    fetch(apiUrl('/api/cyberware/catalog'))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.items?.length) setItems(data.items);
      })
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const slotOk = slotFilter === 'all' || item.type === slotFilter;
        const sourceOk = sourceFilter === 'all' || item.source === sourceFilter;
        return slotOk && sourceOk;
      }),
    [items, slotFilter, sourceFilter],
  );

  return (
    <PageFrame>
      <h1 className={styles.title}>{t('title')}</h1>
      <p className={styles.intro}>{t('intro')}</p>

      <div className={styles.filters}>
        <label>
          {t('slot')}{' '}
          <select value={slotFilter} onChange={(e) => setSlotFilter(e.target.value)}>
            <option value="all">{t('all')}</option>
            {Object.entries(SLOT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('source')}{' '}
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="all">{t('all')}</option>
            <option value="cp2077">CP2077</option>
            <option value="edgerunners">Edgerunners</option>
            <option value="both">Ambos</option>
          </select>
        </label>
      </div>

      <div className={styles.cards}>
        {filtered.map((item) => (
          <HudPanel key={item.name} title={item.name}>
            <img
              src={cyberwareImageSrc(item)}
              alt={item.name}
              className={styles.thumb}
              width={120}
              height={120}
            />
            <div className={styles.cardMeta}>
              <RarityBadge rarity={item.rarity} />
              <span>{SLOT_LABELS[item.type as CyberWareSlot] || item.type}</span>
            </div>
            <p className={styles.desc}>{item.description}</p>
            <ul className={styles.stats}>
              <li>
                <strong>E</strong> {item.edgeCost}
              </li>
              <li>
                <strong>Hack</strong> {item.hackDifficulty}
              </li>
              <li>
                <strong>Implante</strong> {item.implantCost}
              </li>
            </ul>
            <p className={styles.effect}>{item.effect}</p>
          </HudPanel>
        ))}
      </div>
    </PageFrame>
  );
};

export default CatalogPage;
