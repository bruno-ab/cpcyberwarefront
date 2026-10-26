'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useTranslations } from '../../i18n/useTranslations';
import { ThemeSwitcher } from './ThemeSwitcher';
import { MotionToggle } from './MotionToggle';
import { SoundToggle } from './SoundToggle';
import { FontScaleToggle } from './FontScaleToggle';
import { HeatStrip } from './HeatStrip';
import { ShardGlyph } from '../secrets/ShardGlyph';
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn';
import { useCanOpenTable } from '../../hooks/useCanOpenTable';
import { useIsCampaignGm } from '../../hooks/useIsCampaignGm';
import styles from './AppShell.module.css';

const PRIMARY_WHEN_LOGGED_IN = [
  { href: '/campaigns', key: 'campaigns' as const },
  { href: '/characters', key: 'characters' as const },
  { href: '/table', key: 'table' as const, requiresTable: true },
  { href: '/account', key: 'account' as const },
] as const;

/** Visible when logged out — routes to jack-in with sensible return paths */
const PRIMARY_WHEN_LOGGED_OUT = [
  { href: '/login', key: 'login' as const },
  { href: '/login?next=/characters', key: 'characters' as const },
  { href: '/login?next=/account', key: 'account' as const },
] as const;

const NAV = [
  { href: '/cyberware', key: 'cyberware' },
  { href: '/catalog', key: 'catalog' },
  { href: '/book', key: 'book' },
  { href: '/lore', key: 'lore' },
  { href: '/map', key: 'map' },
  { href: '/npcs', key: 'npcs' },
  { href: '/campaigns', key: 'campaigns' },
  { href: '/gigs', key: 'gigs' },
  { href: '/adventure', key: 'adventure' },
  { href: '/news', key: 'news' },
  { href: '/shop', key: 'shop' },
  { href: '/wiki', key: 'wiki' },
  { href: '/achievements', key: 'achievements' },
  { href: '/memorial', key: 'memorial' },
  { href: '/id-card', key: 'idCard' },
  { href: '/narrator', key: 'narrator' },
  { href: '/table', key: 'table' },
  { href: '/breach', key: 'breach' },
] as const;

export const AppNav = () => {
  const { t, locale, changeLocale } = useTranslations('common');
  const loggedIn = useIsLoggedIn();
  const { canOpen: canOpenTable, loading: tableNavLoading } = useCanOpenTable();
  const { isGm: isCampaignGm, loading: gmNavLoading } = useIsCampaignGm();

  const primaryHrefs = new Set<string>(
    loggedIn
      ? PRIMARY_WHEN_LOGGED_IN.map((item) => item.href)
      : [],
  );

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
        {(loggedIn ? PRIMARY_WHEN_LOGGED_IN : PRIMARY_WHEN_LOGGED_OUT).map(
          (item) => {
            if (loggedIn && item.key === 'table') {
              if (tableNavLoading) {
                return (
                  <span
                    key={item.href}
                    className={`${styles.navLink} ${styles.navLinkPrimary} ${styles.navLinkPending}`}
                    aria-busy="true"
                  >
                    {t(`nav.${item.key}`)}…
                  </span>
                );
              }
              const disabled = !canOpenTable;
              if (disabled) {
                return (
                  <span
                    key={item.href}
                    className={`${styles.navLink} ${styles.navLinkDisabled}`}
                    title="Entre em uma campanha em Campanhas para abrir a mesa."
                    aria-disabled="true"
                  >
                    {t(`nav.${item.key}`)}
                  </span>
                );
              }
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${styles.navLinkPrimary}`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          },
        )}
        {NAV.filter((item) => {
          if (loggedIn && primaryHrefs.has(item.href)) return false;
          if (
            loggedIn &&
            item.href === '/narrator' &&
            !gmNavLoading &&
            !isCampaignGm
          ) {
            return false;
          }
          return true;
        }).map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {t(`nav.${item.key}`)}
              {'soon' in item && item.soon ? (
                <span className={styles.soon}>{t('nav.tableSoon')}</span>
              ) : null}
            </Link>
          ),
        )}
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

type AppShellProps = {
  children: ReactNode;
  /** Home landing: full-bleed deck UI + custom footer */
  landing?: boolean;
};

export const AppShell = ({ children, landing }: AppShellProps) => (
  <div className={`${styles.shell} ${landing ? styles.shellLanding : ''}`}>
    <div className={styles.scanlines} aria-hidden />
    {!landing ? (
      <>
        <div className={styles.chromePulse} aria-hidden />
        <div className={styles.horizon} aria-hidden />
      </>
    ) : null}
    <AppNav />
    <main className={`${styles.main} ${landing ? styles.mainLanding : ''}`}>
      {children}
    </main>
    {!landing ? (
      <footer className={styles.siteFooter}>
        <span className={styles.footerSig}>NC-VTT · v0.1</span>
        <ShardGlyph shardId="shard-bw-a" glyph="◈" ariaHint="Signal fragment" />
      </footer>
    ) : null}
  </div>
);

export default AppShell;
