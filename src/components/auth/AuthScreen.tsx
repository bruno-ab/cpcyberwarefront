'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useMotion } from '../../motion/useMotion';
import styles from './authUi.module.css';

type AuthScreenProps = {
  title: string;
  tagline: string;
  children: ReactNode;
  footer: ReactNode;
};

export const AuthScreen = ({
  title,
  tagline,
  children,
  footer,
}: AuthScreenProps) => {
  const { animationsOn } = useMotion();

  return (
    <div className={styles.root}>
      <div className={styles.scanlines} aria-hidden />
      <div className={styles.gridGlow} aria-hidden />
      <main className={styles.main}>
        <Link href="/" className={styles.logo} aria-label="Cyberpunk Storyteller — início">
          <span className={styles.logoMark}>NC</span>
          <span className={styles.logoText}>
            <strong>Cyberpunk Storyteller</strong>
            <small>Night City · mesa digital</small>
          </span>
        </Link>

        <section
          className={styles.panel}
          aria-labelledby="auth-screen-title"
          data-glitch={animationsOn ? 'true' : 'false'}
        >
          <header className={styles.panelHead}>
            <p className={styles.panelKicker}>Arasaka-grade uplink</p>
            <h1 id="auth-screen-title" className={styles.panelTitle}>
              {title}
            </h1>
            <p className={styles.panelTagline}>{tagline}</p>
          </header>
          {children}
        </section>

        <footer className={styles.foot}>{footer}</footer>
      </main>
    </div>
  );
};
