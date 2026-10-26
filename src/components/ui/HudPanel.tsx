import { ReactNode } from 'react';
import { HudCollapsibleSection } from './HudCollapsibleSection';
import styles from './hud.module.css';

type HudPanelProps = {
  children: ReactNode;
  title?: string;
  /** When set, header is clickable and state persists in localStorage (`cp-vtt-hud-section-*`). */
  sectionKey?: string;
  defaultCollapsed?: boolean;
  className?: string;
  bodyClassName?: string;
  tone?: 'default' | 'alert' | 'ok';
};

export const HudPanel = ({
  children,
  title,
  sectionKey,
  defaultCollapsed,
  className = '',
  bodyClassName = '',
  tone = 'default',
}: HudPanelProps) => {
  if (title && sectionKey) {
    return (
      <HudCollapsibleSection
        title={title}
        sectionKey={sectionKey}
        defaultCollapsed={defaultCollapsed}
        className={className}
        bodyClassName={bodyClassName}
        tone={tone}
      >
        {children}
      </HudCollapsibleSection>
    );
  }

  return (
    <section className={`${styles.panel} ${styles[tone]} ${className}`.trim()}>
      {title ? <header className={styles.panelTitle}>{title}</header> : null}
      <div className={`${styles.panelBody} ${bodyClassName}`.trim()}>
        {children}
      </div>
    </section>
  );
};
