'use client';

import styles from './tokenEmoteBubbles.module.css';

export type TokenEmoteBubble = {
  id: string;
  tokenId: string;
  glyph: string;
  label: string;
  x: number;
  y: number;
  floor: number;
};

type TokenEmoteBubblesProps = {
  items: TokenEmoteBubble[];
  grid: number;
  floor: number;
};

export const TokenEmoteBubbles = ({
  items,
  grid,
  floor,
}: TokenEmoteBubblesProps) => {
  const visible = items.filter((b) => (b.floor ?? 0) === floor);
  if (!visible.length) return null;

  return (
    <>
      {visible.map((b) => (
        <div
          key={b.id}
          className={styles.bubble}
          style={{
            left: b.x * grid + grid * 0.5,
            top: b.y * grid,
          }}
          role="status"
          aria-live="polite"
        >
          <span className={styles.glyph}>{b.glyph}</span>
          <span className={styles.label}>{b.label}</span>
        </div>
      ))}
    </>
  );
};
