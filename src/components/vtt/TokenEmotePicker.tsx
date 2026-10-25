'use client';

import {
  TOKEN_EMOTE_COOLDOWN_MS,
  TOKEN_EMOTE_GLYPH,
  TOKEN_EMOTE_IDS,
  type TokenEmoteId,
} from '../../lib/vttTokenEmotes';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './tokenEmotePicker.module.css';

type TokenEmotePickerProps = {
  disabled?: boolean;
  cooldownUntil?: number;
  onEmote: (id: TokenEmoteId) => void;
};

export const TokenEmotePicker = ({
  disabled,
  cooldownUntil = 0,
  onEmote,
}: TokenEmotePickerProps) => {
  const { t } = useTranslations('vtt.tokenEmote');
  const onCooldown = Date.now() < cooldownUntil;

  return (
    <div className={styles.wrap} role="group" aria-label={t('groupLabel')}>
      <span className={styles.label}>{t('groupLabel')}</span>
      <div className={styles.row}>
        {TOKEN_EMOTE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={styles.btn}
            disabled={disabled || onCooldown}
            title={t(`${id}.hint`)}
            aria-label={t(`${id}.label`)}
            onClick={() => onEmote(id)}
          >
            <span className={styles.glyph} aria-hidden>
              {TOKEN_EMOTE_GLYPH[id]}
            </span>
            <span className={styles.text}>{t(`${id}.short`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export { TOKEN_EMOTE_COOLDOWN_MS };
