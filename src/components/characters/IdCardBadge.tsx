'use client';

import { useState } from 'react';
import styles from './IdCardBadge.module.css';

type Props = {
  code: string;
  label?: string;
};

export const IdCardBadge = ({ code, label = 'ID-card' }: Props) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  if (!code) return null;

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      <code className={styles.code}>{code}</code>
      <button type="button" className={styles.copy} onClick={() => void copy()}>
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
};

export default IdCardBadge;
