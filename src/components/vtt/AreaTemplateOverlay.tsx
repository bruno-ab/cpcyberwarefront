'use client';

import {
  cellsForAreaTemplate,
  type VttAreaTemplate,
} from '../../lib/vttAreaTemplates';
import styles from './areaTemplateOverlay.module.css';

type Props = {
  grid: number;
  templates: VttAreaTemplate[];
  floor: number;
};

export const AreaTemplateOverlay = ({ grid, templates, floor }: Props) => (
  <g className={styles.root}>
    {templates
      .filter((t) => (t.floor ?? 0) === floor)
      .map((t) => {
        const cells = cellsForAreaTemplate(t);
        const label = t.label || t.kind;
        const cx = t.x * grid + grid / 2;
        const cy = t.y * grid + grid / 2;
        return (
          <g key={t.id} className={styles.template} data-kind={t.kind}>
            {cells.map((c) => (
              <rect
                key={`${t.id}_${c.x}_${c.y}`}
                x={c.x * grid + 1}
                y={c.y * grid + 1}
                width={grid - 2}
                height={grid - 2}
                className={styles.cell}
              />
            ))}
            <foreignObject x={cx - 48} y={cy - 36} width={96} height={24}>
              <div className={styles.label}>{label}</div>
            </foreignObject>
          </g>
        );
      })}
  </g>
);
