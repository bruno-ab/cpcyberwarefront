'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CYBERWARE_CATALOG, type CyberwareCatalogEntry } from '../../data/cyberwareCatalog';
import { apiUrl } from '../../lib/api';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import { useMotion } from '../../motion/useMotion';
import styles from './HomeChromeFlipCard.module.css';

type CatalogRow = CyberwareCatalogEntry & { id?: number | string };

const rarityTier = (rarity: string) => String(rarity || 'common').toLowerCase();

const pickRandom = (list: CatalogRow[]): CatalogRow | undefined => {
  if (!list.length) return undefined;
  return list[Math.floor(Math.random() * list.length)];
};

/** Stable SSR / pre-hydration back face — no catalog-derived strings. */
const PLACEHOLDER_BACK = {
  name: 'CHROME DECK',
  rarity: '—',
  effect: 'Slot reservado · scan pós-boot',
} as const;

export const HomeChromeFlipCard = () => {
  const { animationsOn } = useMotion();
  const [mounted, setMounted] = useState(false);
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [featured, setFeatured] = useState<CatalogRow | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    setCatalog(CYBERWARE_CATALOG);
    setFeatured(pickRandom(CYBERWARE_CATALOG));

    fetch(apiUrl('/api/cyberware/catalog'))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.items?.length) {
          setCatalog(data.items);
          setFeatured((prev) => prev ?? pickRandom(data.items));
        }
      })
      .catch(() => undefined);
  }, []);

  const pool = useMemo(
    () => (catalog.length ? catalog : CYBERWARE_CATALOG),
    [catalog],
  );

  const onFlip = useCallback(() => {
    playCyberSound('scan', { volume: 0.28 });
    setFlipped((was) => {
      const next = !was;
      if (next && mounted) setFeatured(pickRandom(pool));
      return next;
    });
  }, [pool, mounted]);

  const item = mounted ? featured ?? pool[0] : undefined;
  const back = !mounted
    ? PLACEHOLDER_BACK
    : item
      ? { name: item.name, rarity: item.rarity, effect: item.effect }
      : null;

  const flipAriaLabel = flipped
    ? 'Virar para frente do cartão chrome'
    : 'Virar cartão e revelar peça do catálogo';

  return (
    <section className={styles.wrap} aria-label="Cartão chrome do catálogo">
      <div className={styles.head}>DECK CHROME · CARTÃO COLECIONÁVEL</div>
      <div className={styles.scene}>
        <button
          type="button"
          className={`${styles.card} ${!animationsOn ? styles.cardInstant : ''}`}
          data-flipped={flipped || undefined}
          onClick={onFlip}
          aria-pressed={flipped}
          aria-label={flipAriaLabel}
        >
          <span className={`${styles.face} ${styles.front}`}>
            <span className={styles.frontTitle}>CHROME</span>
            <span className={styles.frontSub}>EDGERUNNER SERIES</span>
            <span className={styles.frontSub}>TOQUE PARA ESCANEAR</span>
          </span>
          <span className={`${styles.face} ${styles.back}`}>
            {back ? (
              <>
                <span className={styles.backName}>{back.name}</span>
                <span className={styles.rarity} data-tier={rarityTier(back.rarity)}>
                  {back.rarity}
                </span>
                <span className={styles.effect}>{back.effect}</span>
                {mounted && item ? (
                  <Link
                    href="/catalog"
                    className={styles.catalogLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    ABRIR CATÁLOGO »
                  </Link>
                ) : null}
              </>
            ) : (
              <span className={styles.effect}>Catálogo offline. Tente /catalog.</span>
            )}
          </span>
        </button>
      </div>
      <p className={styles.hint}>
        {flipped ? 'Verso: peça aleatória do ripperdoc.' : 'Frente: cartão chrome estilizado.'}
      </p>
    </section>
  );
};
