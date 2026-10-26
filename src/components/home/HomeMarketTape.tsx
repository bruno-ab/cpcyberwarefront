'use client';

import { useMotion } from '../../motion/useMotion';
import styles from './homeLanding.module.css';

const ARASAKA_POINTS = '4,52 18,48 32,44 46,38 58,32 72,26 86,18 96,12';
const NIKKEI_POINTS = '4,14 20,18 34,22 48,28 62,36 76,44 88,50 96,54';

type TapeProps = {
  compact?: boolean;
};

export const HomeMarketTape = ({ compact }: TapeProps) => {
  const { animationsOn } = useMotion();
  const animate = animationsOn;

  return (
    <div
      className={`${styles.marketTape} ${compact ? styles.marketTapeCompact : ''}`}
      aria-label="Cotações fictícias Arasaka e Bola do Japão"
    >
      <div className={styles.marketPanel}>
        <div className={styles.marketHead}>
          <span className={styles.marketSymbol}>ARASAKA CORP · NYSE-NC</span>
          <span className={styles.marketUp}>▲ +6,8%</span>
        </div>
        <svg
          className={`${styles.marketSvg} ${animate ? styles.marketSvgUp : ''}`}
          viewBox="0 0 100 56"
          role="img"
          aria-hidden
        >
          <defs>
            <linearGradient id="arasakaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,255,200,0.35)" />
              <stop offset="100%" stopColor="rgba(0,255,200,0)" />
            </linearGradient>
          </defs>
          <polyline
            className={styles.marketGridLine}
            points="0,28 100,28"
            vectorEffect="non-scaling-stroke"
          />
          <polygon
            className={styles.marketFillUp}
            points={`${ARASAKA_POINTS} 96,56 4,56`}
            fill="url(#arasakaFill)"
          />
          <polyline
            className={styles.marketLineUp}
            points={ARASAKA_POINTS}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className={styles.marketPanel}>
        <div className={styles.marketHead}>
          <span className={styles.marketSymbol}>BOLA DO JAPÃO · NIKKEI-NC</span>
          <span className={styles.marketDown}>▼ −4,1%</span>
        </div>
        <svg
          className={`${styles.marketSvg} ${animate ? styles.marketSvgDown : ''}`}
          viewBox="0 0 100 56"
          role="img"
          aria-hidden
        >
          <defs>
            <linearGradient id="nikkeiFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,60,80,0)" />
              <stop offset="100%" stopColor="rgba(255,60,80,0.3)" />
            </linearGradient>
          </defs>
          <polyline
            className={styles.marketGridLine}
            points="0,28 100,28"
            vectorEffect="non-scaling-stroke"
          />
          <polygon
            className={styles.marketFillDown}
            points={`${NIKKEI_POINTS} 96,56 4,56`}
            fill="url(#nikkeiFill)"
          />
          <polyline
            className={styles.marketLineDown}
            points={NIKKEI_POINTS}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
};
