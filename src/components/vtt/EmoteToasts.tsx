'use client';

import styles from './emoteToasts.module.css';

export type EmoteToast = {
  id: string;
  name: string;
  emote: string;
  label: string;
};

type EmoteToastsProps = {
  items: EmoteToast[];
};

export const EmoteToasts = ({ items }: EmoteToastsProps) => {
  if (!items.length) return null;
  return (
    <div className={styles.stack} aria-live="polite" aria-atomic="false">
      {items.map((t) => (
        <div key={t.id} className={styles.toast} data-emote={t.emote}>
          <span className={styles.name}>{t.name}</span>
          <strong>{t.label}</strong>
        </div>
      ))}
    </div>
  );
};
