'use client';

import { useEffect, useState } from 'react';
import styles from './gmFirstVisitHints.module.css';

const STORAGE_KEY = 'cp-vtt-gm-hints-dismissed';

type GmFirstVisitHintsProps = {
  isGm: boolean;
};

export const GmFirstVisitHints = ({ isGm }: GmFirstVisitHintsProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isGm) {
      setVisible(false);
      return;
    }
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== '1');
    } catch {
      setVisible(true);
    }
  }, [isGm]);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className={styles.banner} role="status">
      <p className={styles.text}>
        <strong>Dica GM:</strong> arraste personagens/NPCs do painel Roster para
        colocar tokens · ferramenta <kbd>Mão</kbd> (H) para mover o mapa ·{' '}
        <kbd>?</kbd> abre atalhos.
      </p>
      <button type="button" className={styles.dismiss} onClick={dismiss}>
        Entendi
      </button>
    </div>
  );
};
