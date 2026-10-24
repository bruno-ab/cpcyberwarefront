'use client';

import { useMotion } from '../../motion/useMotion';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './AppShell.module.css';

export const MotionToggle = () => {
  const { animationsOn, toggleMotion, mounted } = useMotion();
  const { t } = useTranslations('common');

  if (!mounted) {
    return <div className={styles.motionSlot} aria-hidden />;
  }

  return (
    <button
      type="button"
      className={styles.motionToggle}
      data-active={animationsOn ? 'true' : 'false'}
      onClick={toggleMotion}
      aria-pressed={animationsOn}
      aria-label={
        animationsOn ? t('motion.disable') : t('motion.enable')
      }
      title={animationsOn ? t('motion.disable') : t('motion.enable')}
    >
      <span className={styles.motionIcon} aria-hidden>
        {animationsOn ? '✦' : '○'}
      </span>
      <span className={styles.motionLabel}>
        {animationsOn ? t('motion.on') : t('motion.off')}
      </span>
    </button>
  );
};

export default MotionToggle;
