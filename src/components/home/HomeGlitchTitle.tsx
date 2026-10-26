'use client';

import { useCallback, useRef, useState } from 'react';
import { useMotion } from '../../motion/useMotion';
import styles from './HomeGlitchTitle.module.css';

type HomeGlitchTitleProps = {
  brand: string;
  headline: string;
};

export const HomeGlitchTitle = ({ brand, headline }: HomeGlitchTitleProps) => {
  const { animationsOn } = useMotion();
  const [pulse, setPulse] = useState(false);
  const hoverCooldown = useRef(false);

  const triggerGlitch = useCallback(() => {
    if (!animationsOn) return;
    setPulse(true);
    window.setTimeout(() => setPulse(false), 420);
  }, [animationsOn]);

  const onHoverGlitch = useCallback(() => {
    if (!animationsOn || hoverCooldown.current) return;
    hoverCooldown.current = true;
    triggerGlitch();
    window.setTimeout(() => {
      hoverCooldown.current = false;
    }, 900);
  }, [animationsOn, triggerGlitch]);

  return (
    <header className={styles.wrap}>
      <button
        type="button"
        className={styles.brandBtn}
        onClick={triggerGlitch}
        onPointerEnter={onHoverGlitch}
        data-glitch={pulse || undefined}
        aria-label={brand}
      >
        <span className={styles.brand} data-text={brand}>
          {brand}
        </span>
      </button>
      <h1 className={styles.headline}>{headline}</h1>
    </header>
  );
};
