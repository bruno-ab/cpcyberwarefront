'use client';

import { ReactNode, useState } from 'react';
import { HudButton } from '../ui/HudButton';
import styles from './gmToolBar.module.css';

type GmTab = 'tokens' | 'map' | 'scene';

export type GmToolBarProps = {
  isGm: boolean;
  gmTab: GmTab;
  onGmTab: (tab: GmTab) => void;
  /** Conteúdo por categoria — injetado pela página para manter intents existentes */
  visaoTools: ReactNode;
  spawnTools: ReactNode;
  deviceTools: ReactNode;
  alertTools: ReactNode;
  mapTools: ReactNode;
  sceneTabTools: ReactNode;
  handoutRow?: ReactNode;
};

type CategoryId = 'visao' | 'spawn' | 'devices' | 'alertas' | 'cena';

const CATEGORIES: Array<{ id: CategoryId; label: string; tab?: GmTab }> = [
  { id: 'visao', label: 'Visão' },
  { id: 'spawn', label: 'Roster / Tokens', tab: 'tokens' },
  { id: 'devices', label: 'Devices' },
  { id: 'alertas', label: 'Alertas' },
  { id: 'cena', label: 'Cena/Mapa', tab: 'map' },
];

export const GmToolBar = ({
  isGm,
  gmTab,
  onGmTab,
  visaoTools,
  spawnTools,
  deviceTools,
  alertTools,
  mapTools,
  sceneTabTools,
  handoutRow,
}: GmToolBarProps) => {
  const [open, setOpen] = useState<CategoryId | null>(null);

  if (!isGm) return null;

  const contentFor = (id: CategoryId) => {
    switch (id) {
      case 'visao':
        return visaoTools;
      case 'spawn':
        return spawnTools;
      case 'devices':
        return deviceTools;
      case 'alertas':
        return alertTools;
      case 'cena':
        return (
          <>
            <div className={styles.subTabs}>
              {(['tokens', 'map', 'scene'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={styles.subTab}
                  data-active={gmTab === tab ? '1' : '0'}
                  onClick={() => onGmTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {gmTab === 'tokens' && spawnTools}
            {gmTab === 'map' && mapTools}
            {gmTab === 'scene' && (
              <>
                {sceneTabTools}
                {handoutRow}
              </>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.wrap} role="toolbar" aria-label="Ferramentas GM">
      <div className={styles.bar}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.catBtn}
            data-active={open === c.id ? '1' : '0'}
            onClick={() => {
              if (c.tab) onGmTab(c.tab);
              setOpen((prev) => (prev === c.id ? null : c.id));
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      {open && open !== 'cena' && (
        <div
          className={styles.drawer}
          data-variant={open === 'spawn' ? 'spawn' : undefined}
        >
          {contentFor(open)}
        </div>
      )}
      {open === 'cena' && (
        <div className={styles.drawerWide}>{contentFor('cena')}</div>
      )}
    </div>
  );
};

export type { GmTab };
