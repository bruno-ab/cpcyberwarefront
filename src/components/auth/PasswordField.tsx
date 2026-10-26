'use client';

import { InputHTMLAttributes, useId, useState } from 'react';
import styles from './authUi.module.css';

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label: string;
  error?: string;
  hint?: string;
  strength?: 'weak' | 'fair' | 'good' | 'strong';
  strengthLabel?: string;
};

export const PasswordField = ({
  label,
  error,
  hint,
  strength,
  strengthLabel,
  id: idProp,
  className = '',
  ...inputProps
}: PasswordFieldProps) => {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errId = `${id}-error`;
  const hintId = strengthLabel ? `${id}-strength` : undefined;
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.passwordWrap}>
        <input
          {...inputProps}
          id={id}
          type={visible ? 'text' : 'password'}
          className={`${styles.input} ${error ? styles.inputInvalid : ''} ${className}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error ? errId : null, hintId].filter(Boolean).join(' ') || undefined
          }
        />
        <button
          type="button"
          className={styles.revealBtn}
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {hint && !error ? <p className={styles.fieldHint}>{hint}</p> : null}
      {strength && strengthLabel ? (
        <p
          id={hintId}
          className={styles.strength}
          data-level={strength}
          role="status"
        >
          {strengthLabel}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className={styles.fieldError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
