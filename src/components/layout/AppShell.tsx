'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './AppShell.module.css';

const NAV = [
  { href: '/characters', key: 'characters' },
  { href: '/cyberware', key: 'cyberware' },
  { href: '/catalog', key: 'catalog' },
  { href: '/book', key: 'book' },
  { href: '/lore', key: 'lore' },
  { href: '/map', key: 'map' },
  { href: '/npcs', key: 'npcs' },
  { href: '/gigs', key: 'gigs' },
  { href: '/shop', key: 'shop' },
  { href: '/wiki', key: 'wiki' },
  { href: '/sheet', key: 'sheet' },
  { href: '/narrator', key: 'narrator' },
  { href: '/table', key: 'table' },
  { href: '/breach', key: 'breach' },
  { href: '/account', key: 'account' },
] as const;

export const AppNav = () => {
  const { t, locale, changeLocale } = useTranslations('common');

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <span className={styles.brandMark}>NC</span>
        <span>
          <strong>{t('appName')}</strong>
          <small>{t('tagline')}</small>
        </span>
      </Link>
      <nav className={styles.nav} aria-label="Main">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
            {t(`nav.${item.key}`)}
            {'soon' in item && item.soon ? (
              <span className={styles.soon}>{t('nav.tableSoon')}</span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className={styles.locale}>
        <button
          type="button"
          className={locale === 'pt-BR' ? styles.localeActive : undefined}
          onClick={() => changeLocale('pt-BR')}
          aria-label="Português"
        >
          PT
        </button>
        <button
          type="button"
          className={locale === 'en' ? styles.localeActive : undefined}
          onClick={() => changeLocale('en')}
          aria-label="English"
        >
          EN
        </button>
      </div>
    </header>
  );
};

export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className={styles.shell}>
    <div className={styles.scanlines} aria-hidden />
    <AppNav />
    <main className={styles.main}>{children}</main>
  </div>
);

export default AppShell;
