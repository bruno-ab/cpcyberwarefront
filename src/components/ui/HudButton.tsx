import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './hud.module.css';

type HudButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
};

export const HudButton = ({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: HudButtonProps) => (
  <button
    type="button"
    className={`${styles.button} ${styles[`btn_${variant}`]} ${className}`.trim()}
    {...rest}
  >
    {children}
  </button>
);
