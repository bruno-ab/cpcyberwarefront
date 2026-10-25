'use client';

import { useTranslations } from '../../i18n/useTranslations';
import {
  SHEET_THEME_VARIANTS,
  SheetThemeVariant,
} from '../../theme/sheetRoleThemes';
import styles from './sheetThemePicker.module.css';

type Props = {
  roleId: string;
  variant: SheetThemeVariant;
  onVariantChange: (v: SheetThemeVariant) => void;
};

export const SheetThemePicker = ({
  roleId,
  variant,
  onVariantChange,
}: Props) => {
  const { t } = useTranslations('sheet.roleTheme');

  return (
    <div className={styles.wrap} aria-label={t('pickerLabel')}>
      <span className={styles.label}>{t('pickerLabel')}</span>
      <span className={styles.roleTag}>{t(`roles.${roleId}`)}</span>
      <div className={styles.options} role="group" aria-label={t('variantGroup')}>
        {SHEET_THEME_VARIANTS.map((id) => (
          <button
            key={id}
            type="button"
            className={variant === id ? styles.btnActive : styles.btn}
            data-variant={id}
            aria-pressed={variant === id}
            onClick={() => onVariantChange(id)}
          >
            {t(`variants.${id}`)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SheetThemePicker;
