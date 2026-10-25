'use client';

import styles from './gmEditShortcutsLegend.module.css';

type GmEditShortcutsLegendProps = {
  open: boolean;
  onClose: () => void;
};

const ROWS: Array<{ keys: string; action: string }> = [
  { keys: 'V / H', action: 'Selecionar / Mão (pan)' },
  { keys: 'Del / Backspace', action: 'Apagar seleção (GM)' },
  { keys: 'Esc', action: 'Limpar seleção · cancelar spawn · sair da mira' },
  { keys: 'B / W', action: 'Fog brush / Paredes' },
  { keys: 'G / L', action: 'Alternar grid · trancar camada ativa' },
  { keys: '1–4', action: 'Normal · Scan · NET · Safe' },
  { keys: 'Tab', action: 'Recolher / expandir painéis' },
  { keys: 'Space', action: 'Pan (segurar) · soltar: passar turno' },
  { keys: 'Setas / WASD', action: 'Mover token selecionado (1 célula)' },
  { keys: '?', action: 'Mostrar / ocultar esta legenda' },
];

export const GmEditShortcutsLegend = ({
  open,
  onClose,
}: GmEditShortcutsLegendProps) => {
  if (!open) return null;

  return (
    <div className={styles.wrap} role="dialog" aria-label="Atalhos GM">
      <div className={styles.head}>
        <span className={styles.title}>Atalhos — edição GM</span>
        <button type="button" className={styles.close} onClick={onClose}>
          Esc
        </button>
      </div>
      <ul className={styles.list}>
        {ROWS.map((row) => (
          <li key={row.keys}>
            <kbd className={styles.kbd}>{row.keys}</kbd>
            <span>{row.action}</span>
          </li>
        ))}
      </ul>
      <p className={styles.note}>
        Del: cabo NET → device → token → parede (prioridade). Ignorado em
        inputs de chat.
      </p>
    </div>
  );
};
