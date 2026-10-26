'use client';

import { useMotion } from '../../motion/useMotion';
import { HOME_MARKET_TICKERS, type MarketDirection } from './homeMarketTapeData';
import styles from './homeLanding.module.css';

type TapeProps = {
  compact?: boolean;
};

const fillPoints = (line: string) => {
  const last = line.trim().split(/\s+/).pop() ?? '96,12';
  const first = line.trim().split(/\s+/)[0] ?? '4,52';
  return `${line} ${last.split(',')[0]},56 ${first.split(',')[0]},56`;
};

type SparkProps = {
  id: string;
  direction: MarketDirection;
  points: string;
  animate: boolean;
};

const MarketSparkline = ({ id, direction, points, animate }: SparkProps) => {
  const up = direction === 'up';
  const gradId = `tapeFill-${id}`;
  const svgClass = up
    ? `${styles.marketSvg} ${animate ? styles.marketSvgUp : ''}`
    : `${styles.marketSvg} ${animate ? styles.marketSvgDown : ''}`;

  return (
    <svg className={svgClass} viewBox="0 0 100 56" role="img" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          {up ? (
            <>
              <stop offset="0%" stopColor="rgba(0,255,200,0.35)" />
              <stop offset="100%" stopColor="rgba(0,255,200,0)" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="rgba(255,60,80,0)" />
              <stop offset="100%" stopColor="rgba(255,60,80,0.3)" />
            </>
          )}
        </linearGradient>
      </defs>
      <polyline
        className={styles.marketGridLine}
        points="0,28 100,28"
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        className={up ? styles.marketFillUp : styles.marketFillDown}
        points={fillPoints(points)}
        fill={`url(#${gradId})`}
      />
      <polyline
        className={up ? styles.marketLineUp : styles.marketLineDown}
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export const HomeMarketTape = ({ compact }: TapeProps) => {
  const { animationsOn } = useMotion();
  const animate = animationsOn;

  return (
    <div
      className={`${styles.marketTape} ${compact ? styles.marketTapeCompact : ''}`}
      aria-label="Cotações fictícias de megacorps e mercados globais"
    >
      {HOME_MARKET_TICKERS.map((ticker) => (
        <div key={ticker.id} className={styles.marketPanel}>
          <div className={styles.marketHead}>
            <span className={styles.marketSymbol}>{ticker.symbol}</span>
            <span className={ticker.direction === 'up' ? styles.marketUp : styles.marketDown}>
              {ticker.change}
            </span>
          </div>
          <MarketSparkline
            id={ticker.id}
            direction={ticker.direction}
            points={ticker.points}
            animate={animate}
          />
        </div>
      ))}
    </div>
  );
};
