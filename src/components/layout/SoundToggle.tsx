'use client';

import { useSound } from '../../lib/sound/useSound';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './AppShell.module.css';

export const SoundToggle = () => {
  const { soundOn, toggleSound, mounted } = useSound();
  const { t } = useTranslations('common');

  if (!mounted) {
    return <div className={styles.motionSlot} aria-hidden />;
  }

  return (
    <button
      type="button"
      className={styles.motionToggle}
      data-active={soundOn ? 'true' : 'false'}
      onClick={toggleSound}
      aria-pressed={soundOn}
      aria-label={soundOn ? t('sound.disable') : t('sound.enable')}
      title={soundOn ? t('sound.disable') : t('sound.enable')}
    >
      <span className={styles.motionIcon} aria-hidden>
        {soundOn ? '♪' : '✕'}
      </span>
      <span className={styles.motionLabel}>
        {soundOn ? t('sound.on') : t('sound.off')}
      </span>
    </button>
  );
};

export default SoundToggle;
