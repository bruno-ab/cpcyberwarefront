'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import {
  NIGHT_CITY_DISTRICTS,
  type NightCityDistrictId,
} from './homeNightCityDistricts';
import styles from './HomeDistrictHolomap.module.css';

const HOTSPOT_R = 14;

export const HomeDistrictHolomap = () => {
  const [selected, setSelected] = useState<NightCityDistrictId>('watson');
  const district = NIGHT_CITY_DISTRICTS.find((d) => d.id === selected)!;

  const pick = useCallback((id: NightCityDistrictId) => {
    playCyberSound('ui', { volume: 0.2 });
    setSelected(id);
  }, []);

  return (
    <section className={styles.holo} aria-label="Holoprojetor de distritos de Night City">
      <div className={styles.head}>
        <span>WATSON HOLOPROJ · MAPA NC</span>
        <span className={styles.tag}>WIRE OVERLAY v2.077</span>
      </div>
      <div className={styles.body}>
        <div className={styles.mapWrap}>
          <svg
            className={styles.svg}
            viewBox="0 0 320 180"
            role="img"
            aria-label="Mapa esquemático holográfico de Night City"
          >
            <defs>
              <filter id="homeHoloGlow">
                <feGaussianBlur stdDeviation="1.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {[40, 80, 120, 160, 200, 240, 280].map((x) => (
              <line key={`v${x}`} className={styles.gridLine} x1={x} y1={8} x2={x} y2={172} />
            ))}
            {[40, 80, 120, 160].map((y) => (
              <line key={`h${y}`} className={styles.gridLine} x1={16} y1={y} x2={304} y2={y} />
            ))}
            <ellipse
              className={styles.projector}
              cx={118}
              cy={165}
              rx={42}
              ry={8}
            />
            <path
              className={styles.coast}
              filter="url(#homeHoloGlow)"
              d="M 28 155 Q 60 95 95 75 T 155 42 T 230 55 T 290 120 T 270 165 L 35 165 Z"
            />
            <path
              className={styles.coast}
              d="M 45 140 Q 70 110 100 95 T 175 70 T 255 95"
              opacity={0.5}
            />
            {NIGHT_CITY_DISTRICTS.map((d) => (
              <g key={d.id}>
                <circle
                  className={styles.hotspot}
                  cx={d.mapX}
                  cy={d.mapY}
                  r={HOTSPOT_R}
                  data-active={selected === d.id || undefined}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected === d.id}
                  aria-label={`Distrito ${d.label}`}
                  onClick={() => pick(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      pick(d.id);
                    }
                  }}
                />
                <text
                  className={styles.label}
                  x={d.mapX}
                  y={d.mapY + HOTSPOT_R + 9}
                  textAnchor="middle"
                >
                  {d.label.split(' ')[0]}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className={styles.detail} aria-live="polite">
          <h3 className={styles.detailTitle}>{district.label}</h3>
          <p>{district.lore}</p>
          {district.loreLink ? (
            <Link href={district.loreLink.href} className={styles.loreLink}>
              {district.loreLink.label} »
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
};
