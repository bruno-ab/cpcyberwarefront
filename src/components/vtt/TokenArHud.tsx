'use client';

import { useTranslations } from '../../i18n/useTranslations';
import type { VttArIntel } from '../../lib/vttAr';
import styles from './TokenArHud.module.css';

type Props = {
  intel: VttArIntel;
};

export function TokenArHud({ intel }: Props) {
  const { t } = useTranslations('vtt.ar');
  const threatKey = intel.threat || 'low';
  const threatLabel = t(`threat.${threatKey}`);

  return (
    <div className={styles.hud} aria-hidden>
      <span className={styles.line} data-field="name">
        {intel.name}
      </span>
      {intel.affiliation ? (
        <span className={styles.line} data-field="aff">
          {intel.affiliation}
        </span>
      ) : null}
      <span className={styles.line} data-field="threat" data-threat={threatKey}>
        {t('threatLabel')}: {threatLabel}
      </span>
      {intel.weapons?.length ? (
        <span className={styles.line} data-field="wpn">
          {t('weapons')}: {intel.weapons.join(' · ')}
        </span>
      ) : null}
    </div>
  );
}
