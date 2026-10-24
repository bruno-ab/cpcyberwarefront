'use client';

import { useState } from 'react';
import styles from './phone.module.css';

export type Handout = {
  id: string;
  channel?: string;
  from?: string;
  title?: string;
  body?: string;
  at?: string;
};

type PhoneShellProps = {
  handouts: Handout[];
  open?: boolean;
  onClose?: () => void;
};

export const PhoneShell = ({ handouts, open = true, onClose }: PhoneShellProps) => {
  const [tab, setTab] = useState<'sms' | 'mail' | 'shard' | 'call'>('sms');
  if (!open) return null;

  const filtered = handouts.filter((h) => {
    const ch = (h.channel || 'sms').toLowerCase();
    if (tab === 'sms') return ch === 'sms' || ch === 'messages';
    if (tab === 'mail') return ch === 'mail' || ch === 'email';
    if (tab === 'shard') return ch === 'shard';
    return ch === 'call';
  });

  return (
    <div className={styles.phone} role="dialog" aria-label="Celular">
      <div className={styles.notch} />
      <header className={styles.top}>
        <strong>NCPD Link</strong>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        )}
      </header>
      <nav className={styles.tabs}>
        {(['sms', 'mail', 'shard', 'call'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? styles.tabActive : undefined}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      <div className={styles.list}>
        {filtered.length === 0 && <p className={styles.empty}>Sem mensagens</p>}
        {filtered.map((h) => (
          <article key={h.id} className={styles.card}>
            <strong>{h.title || h.from || 'Handout'}</strong>
            <p>{h.body}</p>
            <small>{h.at}</small>
          </article>
        ))}
      </div>
      {handouts.length > 0 && <span className={styles.badge}>{handouts.length}</span>}
    </div>
  );
};
