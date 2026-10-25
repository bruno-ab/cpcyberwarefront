'use client';

import { ReactNode } from 'react';
import styles from './floatingHudPanel.module.css';

type Side = 'left' | 'right';

type FloatingHudPanelProps = {
  side: Side;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
};

export const FloatingHudPanel = ({
  side,
  title,
  collapsed,
  onToggle,
  children,
  className = '',
}: FloatingHudPanelProps) => (
  <aside
    className={`${styles.panel} ${styles[side]} ${className}`.trim()}
    data-collapsed={collapsed ? '1' : '0'}
    aria-label={title}
  >
    <button
      type="button"
      className={styles.tab}
      onClick={onToggle}
      aria-expanded={!collapsed}
      title={collapsed ? `Abrir ${title}` : `Recolher ${title}`}
    >
      <span className={styles.tabChevron} aria-hidden />
      <span className={styles.tabLabel}>{title}</span>
    </button>
    <div className={styles.body}>{children}</div>
  </aside>
);

export const readHudPanelPref = (key: string, fallback: boolean): boolean => {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    if (v === '0') return false;
    if (v === '1') return true;
  } catch {
    /* ignore */
  }
  return fallback;
};

export const writeHudPanelPref = (key: string, collapsed: boolean) => {
  try {
    localStorage.setItem(key, collapsed ? '1' : '0');
  } catch {
    /* ignore */
  }
};

export const HUD_PREF_LEFT = 'cp-vtt-hud-left-collapsed';
export const HUD_PREF_RIGHT = 'cp-vtt-hud-right-collapsed';
