import { ReactNode } from 'react';
import styles from './hud.module.css';

type HudPanelProps = {
  children: ReactNode;
  title?: string;
  className?: string;
  bodyClassName?: string;
  tone?: 'default' | 'alert' | 'ok';
};

export const HudPanel = ({
  children,
  title,
  className = '',
  bodyClassName = '',
  tone = 'default',
}: HudPanelProps) => (
  <section className={`${styles.panel} ${styles[tone]} ${className}`.trim()}>
    {title ? <header className={styles.panelTitle}>{title}</header> : null}
    <div className={`${styles.panelBody} ${bodyClassName}`.trim()}>
      {children}
    </div>
  </section>
);
