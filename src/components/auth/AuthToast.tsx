'use client';

import { useEffect } from 'react';
import styles from './authUi.module.css';

type AuthToastProps = {
  message: string;
  variant?: 'error' | 'ok';
  onDismiss?: () => void;
};

export const AuthToast = ({
  message,
  variant = 'error',
  onDismiss,
}: AuthToastProps) => {
  useEffect(() => {
    if (!message || !onDismiss) return undefined;
    const id = window.setTimeout(onDismiss, 5200);
    return () => window.clearTimeout(id);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={styles.toast}
      data-variant={variant}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="assertive"
    >
      <span className={styles.toastSig} aria-hidden>
        {variant === 'error' ? '!' : '✓'}
      </span>
      <p className={styles.toastMsg}>{message}</p>
      {onDismiss ? (
        <button
          type="button"
          className={styles.toastClose}
          onClick={onDismiss}
          aria-label="Fechar aviso"
        >
          ×
        </button>
      ) : null}
    </div>
  );
};
