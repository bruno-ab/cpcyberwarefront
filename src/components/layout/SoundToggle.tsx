'use client';

import { useSound } from '../../lib/sound/useSound';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './AppShell.module.css';

export const SoundToggle = () => {
  const { soundOn, toggleSound, mounted } = useSound();
  const { t } = useTranslations('common');

  // Sempre o mesmo nó raiz (div) no SSR e no 1º paint — evita hydration mismatch.
  return (
    <div className={styles.motionSlot} suppressHydrationWarning>
      {mounted ? (
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
      ) : null}
    </div>
  );
};

export default SoundToggle;
