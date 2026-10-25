'use client';

import { HudButton } from '../ui/HudButton';
import styles from './quickhackMenu.module.css';

export type NetMenuHack = {
  id: string;
  name: string;
  ramCost: number;
  range: number;
  difficulty: number;
  finalDifficulty: number;
  desc: string;
  inRange: boolean;
  affordable: boolean;
  effect: string;
};

export type NetMenuPayload = {
  ok: boolean;
  runnerTokenId?: string;
  deviceId?: string;
  targetTokenId?: string;
  kind?: string;
  name?: string;
  distance?: number;
  ram?: number;
  ramMax?: number;
  accessLevel?: number;
  iceStacks?: number;
  jammed?: boolean;
  open?: boolean;
  hacks?: NetMenuHack[];
  error?: string;
};

type QuickhackMenuProps = {
  menu: NetMenuPayload;
  busy?: boolean;
  onCast: (hackId: string) => void;
  onClose: () => void;
  onRecharge: () => void;
};

export const QuickhackMenu = ({
  menu,
  busy,
  onCast,
  onClose,
  onRecharge,
}: QuickhackMenuProps) => {
  if (!menu.ok) {
    return (
      <div className={styles.wrap} role="dialog" aria-label="Quickhacks">
        <header className={styles.head}>
          <span>NET · erro</span>
          <HudButton variant="ghost" onClick={onClose}>
            ×
          </HudButton>
        </header>
        <p className={styles.err}>{menu.error || 'Falha ao abrir nó'}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap} role="dialog" aria-label="Quickhacks">
      <header className={styles.head}>
        <div>
          <span className={styles.kind}>{menu.kind}</span>
          <strong>{menu.name}</strong>
        </div>
        <HudButton variant="ghost" onClick={onClose}>
          ×
        </HudButton>
      </header>
      <div className={styles.meta}>
        <span>dist {menu.distance}u</span>
        <span>
          RAM {menu.ram}/{menu.ramMax}
        </span>
        <span>A{menu.accessLevel}</span>
        <span>ICE {menu.iceStacks || 0}</span>
        {menu.jammed ? <span data-on="1">JAM</span> : null}
        {menu.open ? <span data-on="1">OPEN</span> : null}
      </div>
      <ul className={styles.list}>
        {(menu.hacks || []).map((h) => {
          const blocked = !h.inRange || !h.affordable || busy;
          return (
            <li key={h.id}>
              <button
                type="button"
                className={styles.hack}
                disabled={blocked}
                onClick={() => onCast(h.id)}
                title={h.desc}
              >
                <span className={styles.hackName}>{h.name}</span>
                <span className={styles.hackStats}>
                  RAM {h.ramCost} · ≤{h.range}u · dif {h.finalDifficulty}
                </span>
                <span className={styles.hackDesc}>{h.desc}</span>
                {!h.inRange && (
                  <span className={styles.badge}>fora de alcance</span>
                )}
                {h.inRange && !h.affordable && (
                  <span className={styles.badge}>sem RAM</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.foot}>
        <HudButton variant="ghost" onClick={onRecharge} disabled={busy}>
          Recarregar RAM
        </HudButton>
      </div>
    </div>
  );
};
