'use client';

import {
  AIM_RANGE_RINGS,
  type AimPreview,
} from '../../lib/vttAim';
import styles from './aimOverlay.module.css';

type AimOverlayProps = {
  grid: number;
  attacker: { x: number; y: number; name?: string };
  target?: { x: number; y: number; name?: string } | null;
  preview: AimPreview | null;
  showRings?: boolean;
};

export const AimOverlay = ({
  grid,
  attacker,
  target,
  preview,
  showRings = true,
}: AimOverlayProps) => {
  const ax = attacker.x * grid + grid / 2;
  const ay = attacker.y * grid + grid / 2;
  const tx = target ? target.x * grid + grid / 2 : ax;
  const ty = target ? target.y * grid + grid / 2 : ay;
  const midX = (ax + tx) / 2;
  const midY = (ay + ty) / 2 - 10;
  const band = preview?.range.band || 'close';
  const cover = preview?.cover.level || 'none';

  return (
    <g className={styles.root} data-band={band} data-cover={cover}>
      {showRings &&
        AIM_RANGE_RINGS.map((ring) => (
          <circle
            key={ring.band}
            cx={ax}
            cy={ay}
            r={ring.radius * grid}
            className={styles.ring}
            data-band={ring.band}
          />
        ))}
      <circle cx={ax} cy={ay} r={6} className={styles.origin} />
      {target && preview && (
        <>
          <line
            x1={ax}
            y1={ay}
            x2={tx}
            y2={ty}
            className={styles.los}
            data-band={band}
            data-cover={cover}
            data-ok={preview.canShoot ? '1' : '0'}
          />
          <circle cx={tx} cy={ty} r={7} className={styles.target} />
          <foreignObject
            x={midX - 110}
            y={midY - 28}
            width={220}
            height={56}
            className={styles.labelFo}
          >
            <div
              className={styles.label}
              data-band={band}
              data-ok={preview.canShoot ? '1' : '0'}
            >
              <strong>
                {preview.distance}u · {preview.range.label}
              </strong>
              <span>{preview.cover.label}</span>
              <em>
                {preview.canShoot
                  ? `mod ${preview.modifier === 0 ? '+0' : `+${preview.modifier}`} dif`
                  : 'sem tiro'}
              </em>
            </div>
          </foreignObject>
        </>
      )}
    </g>
  );
};
