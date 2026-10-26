'use client';

import styles from './reactionBar.module.css';

export type ReactionId =
  | 'concordo'
  | 'pausa'
  | 'um_minuto'
  | 'alerta'
  | 'pronto'
  | 'nega';

export const REACTIONS: Array<{ id: ReactionId; label: string; hint: string }> =
  [
    { id: 'concordo', label: 'Concordo', hint: 'OK / seguimos' },
    { id: 'pausa', label: 'Pausa', hint: 'Segura o fluxo' },
    {
      id: 'um_minuto',
      label: '1 minuto',
      hint: 'Preciso de um minuto',
    },
    { id: 'alerta', label: 'Alerta', hint: 'Atenção na mesa' },
    { id: 'pronto', label: 'Pronto', hint: 'Pode continuar' },
    { id: 'nega', label: 'Nego', hint: 'Não / sem' },
  ];

type ReactionBarProps = {
  disabled?: boolean;
  onReact: (id: ReactionId) => void;
  /** Hide inline title when wrapped in HudPanel / HudCollapsibleSection */
  hideTitle?: boolean;
};

export const ReactionBar = ({
  disabled,
  onReact,
  hideTitle = false,
}: ReactionBarProps) => (
  <div
    className={`${styles.wrap} ${hideTitle ? styles.wrapInset : ''}`.trim()}
    role="group"
    aria-label="Reações rápidas"
  >
    {!hideTitle ? <span className={styles.label}>Reações</span> : null}
    <div className={styles.row}>
      {REACTIONS.map((r) => (
        <button
          key={r.id}
          type="button"
          className={styles.btn}
          disabled={disabled}
          title={r.hint}
          onClick={() => onReact(r.id)}
        >
          {r.label}
        </button>
      ))}
    </div>
  </div>
);
