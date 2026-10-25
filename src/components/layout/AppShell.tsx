'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useTranslations } from '../../i18n/useTranslations';
import { ThemeSwitcher } from './ThemeSwitcher';
import { MotionToggle } from './MotionToggle';
import { SoundToggle } from './SoundToggle';
import { FontScaleToggle } from './FontScaleToggle';
import { HeatStrip } from './HeatStrip';
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
  { href: '/adventure', key: 'adventure' },
  { href: '/news', key: 'news' },
  { href: '/shop', key: 'shop' },
  { href: '/wiki', key: 'wiki' },
  { href: '/achievements', key: 'achievements' },
  { href: '/id-card', key: 'idCard' },
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
      <div className={styles.controls}>
        <HeatStrip />
        <ThemeSwitcher />
        <MotionToggle />
        <SoundToggle />
        <FontScaleToggle />
        <div className={styles.locale} suppressHydrationWarning>
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
      </div>
    </header>
  );
};

export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className={styles.shell}>
    <div className={styles.scanlines} aria-hidden />
    <div className={styles.chromePulse} aria-hidden />
    <div className={styles.horizon} aria-hidden />
    <AppNav />
    <main className={styles.main}>{children}</main>
  </div>
);

export default AppShell;
