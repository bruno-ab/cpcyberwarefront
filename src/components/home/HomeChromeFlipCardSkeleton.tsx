'use client';

import styles from './HomeChromeFlipCard.module.css';

/** SSR / chunk-load placeholder — same layout as flip card, no catalog strings. */
export const HomeChromeFlipCardSkeleton = () => (
  <section className={styles.wrap} aria-label="Cartão chrome do catálogo" aria-busy="true">
    <div className={styles.head}>DECK CHROME · CARTÃO COLECIONÁVEL</div>
    <div className={styles.scene}>
      <div className={styles.card} aria-hidden>
        <span className={`${styles.face} ${styles.front}`}>
          <span className={styles.frontTitle}>CHROME</span>
          <span className={styles.frontSub}>INICIALIZANDO…</span>
        </span>
      </div>
    </div>
    <p className={styles.hint}>Aguardando uplink do deck…</p>
  </section>
);
