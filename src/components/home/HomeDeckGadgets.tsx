'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useMotion } from '../../motion/useMotion';
import { useTranslations } from '../../i18n/useTranslations';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import styles from './HomeDeckGadgets.module.css';

export const HomeDeckGadgets = () => {
  const { t } = useTranslations('home');
  const { animationsOn } = useMotion();
  const [scanOpen, setScanOpen] = useState(false);
  const [heatPulse, setHeatPulse] = useState(false);

  const onScan = useCallback(() => {
    playCyberSound('scan', { volume: 0.32 });
    setScanOpen((v) => !v);
    if (animationsOn) {
      setHeatPulse(true);
      window.setTimeout(() => setHeatPulse(false), 600);
    }
  }, [animationsOn]);

  return (
    <section className={styles.deck} aria-label={t('deck.aria')}>
      <Link href="/news" className={styles.widget} data-heat={heatPulse || undefined}>
        <span className={styles.widgetLabel}>N54</span>
        <span className={styles.widgetValue}>{t('deck.n54Value')}</span>
        <span className={styles.widgetMeta}>{t('deck.n54Meta')}</span>
        <span className={styles.pulseRing} aria-hidden />
      </Link>

      <button type="button" className={styles.widget} onClick={onScan}>
        <span className={styles.widgetLabel}>{t('deck.scanLabel')}</span>
        <span className={styles.widgetValue}>
          {scanOpen ? t('deck.scanDone') : t('deck.scanIdle')}
        </span>
        <span className={styles.widgetMeta} data-reveal={scanOpen || undefined}>
          {scanOpen ? t('deck.scanTip') : t('deck.scanHint')}
        </span>
      </button>

      <Link href="/catalog" className={styles.widget}>
        <span className={styles.widgetLabel}>{t('deck.chromeLabel')}</span>
        <span className={styles.widgetValue}>{t('deck.chromeValue')}</span>
        <span className={styles.widgetMeta}>{t('deck.chromeMeta')}</span>
      </Link>
    </section>
  );
};
