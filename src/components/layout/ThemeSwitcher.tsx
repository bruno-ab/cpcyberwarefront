'use client';

import { useTheme } from '../../theme/useTheme';
import { ThemeId } from '../../theme/palettes';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './AppShell.module.css';

export const ThemeSwitcher = () => {
  const { theme, setTheme, themes, mounted } = useTheme();
  const { t } = useTranslations('common');

  return (
    <div
      className={styles.themeRow}
      role="group"
      aria-label={t('theme.label')}
      suppressHydrationWarning
    >
      {mounted ? (
        <>
          <span className={styles.themeLabel}>{t('theme.label')}</span>
          <select
            className={styles.themeSelect}
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeId)}
            aria-label={t('theme.label')}
          >
            {themes.map((item) => (
              <option key={item.id} value={item.id}>
                {t(`theme.${item.id}`)}
              </option>
            ))}
          </select>
          <div className={styles.swatches} aria-hidden>
            {themes
              .find((item) => item.id === theme)
              ?.swatches.map((color) => (
                <span
                  key={color}
                  className={styles.swatch}
                  style={{ background: color }}
                />
              ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ThemeSwitcher;
