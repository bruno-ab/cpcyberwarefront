'use client';

import styles from './layers.module.css';

export type VttLayerId =
  | 'background'
  | 'grid'
  | 'walls'
  | 'tokens'
  | 'fog';

export type VttLayer = {
  id: VttLayerId;
  name: string;
  visible: boolean;
  locked: boolean;
};

type LayersPanelProps = {
  layers: VttLayer[];
  activeLayer: VttLayerId;
  isGm: boolean;
  onActivate: (id: VttLayerId) => void;
  onToggleVisible: (id: VttLayerId, visible: boolean) => void;
  onToggleLocked: (id: VttLayerId, locked: boolean) => void;
};

export const LayersPanel = ({
  layers,
  activeLayer,
  isGm,
  onActivate,
  onToggleVisible,
  onToggleLocked,
}: LayersPanelProps) => (
  <ul className={styles.list} aria-label="Camadas da mesa">
    {layers.map((layer) => {
      const active = activeLayer === layer.id;
      return (
        <li
          key={layer.id}
          className={styles.row}
          data-active={active ? '1' : '0'}
        >
          <button
            type="button"
            className={styles.name}
            onClick={() => onActivate(layer.id)}
            title={`Ativar camada ${layer.name}`}
          >
            <span className={styles.dot} aria-hidden />
            {layer.name}
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            data-on={layer.visible ? '1' : '0'}
            disabled={!isGm}
            onClick={() => onToggleVisible(layer.id, !layer.visible)}
            title={layer.visible ? 'Ocultar camada' : 'Mostrar camada'}
            aria-pressed={layer.visible}
            aria-label={
              layer.visible
                ? `Ocultar ${layer.name}`
                : `Mostrar ${layer.name}`
            }
          >
            {layer.visible ? 'VIS' : 'OFF'}
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            data-on={layer.locked ? '1' : '0'}
            disabled={!isGm}
            onClick={() => onToggleLocked(layer.id, !layer.locked)}
            title={layer.locked ? 'Desbloquear' : 'Bloquear'}
            aria-pressed={layer.locked}
            aria-label={
              layer.locked
                ? `Desbloquear ${layer.name}`
                : `Bloquear ${layer.name}`
            }
          >
            {layer.locked ? 'LCK' : 'EDT'}
          </button>
        </li>
      );
    })}
  </ul>
);
