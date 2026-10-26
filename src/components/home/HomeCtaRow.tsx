'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { HudButton } from '../ui/HudButton';
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn';
import { useCanOpenTable } from '../../hooks/useCanOpenTable';
import { useMotion } from '../../motion/useMotion';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './HomeCtaRow.module.css';

export const HomeCtaRow = () => {
  const { t } = useTranslations();
  const tc = (key: string) => t(`common.${key}`);
  const th = (key: string) => t(`home.${key}`);
  const loggedIn = useIsLoggedIn();
  const { canOpen: canOpenTable, loading: tableLoading } = useCanOpenTable();
  const { animationsOn } = useMotion();
  const [glitchBtn, setGlitchBtn] = useState<string | null>(null);

  const glitchLink = useCallback(
    (id: string) => {
      if (!animationsOn) return;
      setGlitchBtn(id);
      window.setTimeout(() => setGlitchBtn(null), 360);
    },
    [animationsOn],
  );

  const tableDisabled = loggedIn && !tableLoading && !canOpenTable;

  return (
    <div className={styles.wrap}>
      <div className={styles.primaryRow}>
        {loggedIn ? (
          <>
            <Link
              href="/campaigns"
              className={styles.link}
              onClick={() => glitchLink('campaigns')}
            >
              <HudButton
                className={glitchBtn === 'campaigns' ? styles.glitchBtn : ''}
              >
                {tc('nav.campaigns')}
              </HudButton>
            </Link>
            {tableDisabled ? (
              <span className={styles.tableMuted} title={th('cta.tableLocked')}>
                <HudButton variant="ghost" disabled>
                  {tc('nav.table')}
                </HudButton>
              </span>
            ) : (
              <Link
                href="/table"
                className={styles.link}
                onClick={() => glitchLink('table')}
              >
                <HudButton
                  variant="ghost"
                  className={glitchBtn === 'table' ? styles.glitchBtn : ''}
                >
                  {th('cta.openTable')}
                </HudButton>
              </Link>
            )}
            <Link
              href="/catalog"
              className={styles.link}
              onClick={() => glitchLink('catalog')}
            >
              <HudButton
                variant="ghost"
                className={glitchBtn === 'catalog' ? styles.glitchBtn : ''}
              >
                {tc('cta.catalog')}
              </HudButton>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className={styles.link}
              onClick={() => glitchLink('enter')}
            >
              <HudButton className={glitchBtn === 'enter' ? styles.glitchBtn : ''}>
                {tc('cta.enter')}
              </HudButton>
            </Link>
            <Link
              href="/catalog"
              className={styles.link}
              onClick={() => glitchLink('catalog')}
            >
              <HudButton
                variant="ghost"
                className={glitchBtn === 'catalog' ? styles.glitchBtn : ''}
              >
                {tc('cta.catalog')}
              </HudButton>
            </Link>
            <Link
              href="/book"
              className={styles.link}
              onClick={() => glitchLink('book')}
            >
              <HudButton
                variant="ghost"
                className={glitchBtn === 'book' ? styles.glitchBtn : ''}
              >
                {tc('cta.book')}
              </HudButton>
            </Link>
          </>
        )}
      </div>
      {!loggedIn ? (
        <p className={styles.secondary}>
          <Link href="/table" onClick={() => glitchLink('tableLink')}>
            {th('soonTable')}
          </Link>
        </p>
      ) : null}
    </div>
  );
};
