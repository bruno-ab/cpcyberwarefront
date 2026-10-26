'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import panelStyles from './hud.module.css';
import styles from './hudCollapsibleSection.module.css';

export const HUD_SECTION_PREF_PREFIX = 'cp-vtt-hud-section-';

export const hudSectionStorageKey = (sectionKey: string) =>
  `${HUD_SECTION_PREF_PREFIX}${sectionKey}`;

export const readHudSectionPref = (
  sectionKey: string,
  fallbackCollapsed: boolean,
): boolean => {
  if (typeof window === 'undefined') return fallbackCollapsed;
  try {
    const v = localStorage.getItem(hudSectionStorageKey(sectionKey));
    if (v === '0') return false;
    if (v === '1') return true;
  } catch {
    /* ignore */
  }
  return fallbackCollapsed;
};

export const writeHudSectionPref = (sectionKey: string, collapsed: boolean) => {
  try {
    localStorage.setItem(
      hudSectionStorageKey(sectionKey),
      collapsed ? '1' : '0',
    );
  } catch {
    /* ignore */
  }
};

export type HudCollapsibleSectionProps = {
  title: string;
  sectionKey: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: 'default' | 'alert' | 'ok';
  defaultCollapsed?: boolean;
};

export const HudCollapsibleSection = ({
  title,
  sectionKey,
  children,
  className = '',
  bodyClassName = '',
  tone = 'default',
  defaultCollapsed = false,
}: HudCollapsibleSectionProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    setCollapsed(readHudSectionPref(sectionKey, defaultCollapsed));
  }, [sectionKey, defaultCollapsed]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      writeHudSectionPref(sectionKey, next);
      return next;
    });
  }, [sectionKey]);

  return (
    <section
      className={`${panelStyles.panel} ${panelStyles[tone]} ${styles.section} ${className}`.trim()}
      data-collapsed={collapsed ? '1' : '0'}
    >
      <header className={`${panelStyles.panelTitle} ${styles.head}`.trim()}>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          title={
            collapsed ? `Expandir ${title}` : `Recolher ${title}`
          }
        >
          <span className={styles.titleText}>{title}</span>
          <span className={styles.chevron} aria-hidden>
            {collapsed ? '▸' : '▾'}
          </span>
        </button>
      </header>
      {!collapsed ? (
        <div
          className={`${panelStyles.panelBody} ${bodyClassName}`.trim()}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
};
