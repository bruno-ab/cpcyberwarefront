'use client';

import { useFontScale } from '../../font/useFontScale';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './AppShell.module.css';

export const FontScaleToggle = () => {
  const { enlarged, toggleScale, mounted } = useFontScale();
  const { t } = useTranslations('common');

  return (
    <div className={styles.motionSlot} suppressHydrationWarning>
      {mounted ? (
        <button
          type="button"
          className={styles.motionToggle}
          data-active={enlarged ? 'true' : 'false'}
          onClick={toggleScale}
          aria-pressed={enlarged}
          aria-label={enlarged ? t('font.reduce') : t('font.enlarge')}
          title={enlarged ? t('font.reduce') : t('font.enlarge')}
        >
          <span className={styles.motionIcon} aria-hidden>
            {enlarged ? 'A+' : 'A'}
          </span>
          <span className={styles.motionLabel}>
            {enlarged ? t('font.on') : t('font.off')}
          </span>
        </button>
      ) : null}
    </div>
  );
};

export default FontScaleToggle;
