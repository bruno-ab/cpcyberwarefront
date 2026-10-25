'use client';

import styles from './boardNavToolbar.module.css';

export type BoardNavTool = 'select' | 'hand';

type BoardNavToolbarProps = {
  tool: BoardNavTool;
  onTool: (tool: BoardNavTool) => void;
};

export const BoardNavToolbar = ({ tool, onTool }: BoardNavToolbarProps) => (
  <div className={styles.wrap} role="toolbar" aria-label="Ferramentas de navegação do mapa">
    <button
      type="button"
      className={styles.btn}
      data-active={tool === 'select' ? '1' : '0'}
      title="Seleção — mover tokens (V)"
      aria-pressed={tool === 'select'}
      onClick={() => onTool('select')}
    >
      <span className={styles.icon} aria-hidden>
        ↖
      </span>
      <span className={styles.label}>Selecionar</span>
    </button>
    <button
      type="button"
      className={styles.btn}
      data-active={tool === 'hand' ? '1' : '0'}
      title="Mão — arrastar viewport (H · Space+arrastar)"
      aria-pressed={tool === 'hand'}
      onClick={() => onTool('hand')}
    >
      <span className={styles.icon} aria-hidden>
        ✋
      </span>
      <span className={styles.label}>Mão</span>
    </button>
  </div>
);
