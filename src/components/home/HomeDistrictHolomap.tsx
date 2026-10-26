'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import { useMotion } from '../../motion/useMotion';
import {
  HOLO_PANEL_ROTATE_MS,
  HOLO_PANEL_ROTATE_MS_MOTION_OFF,
  HOME_DOGTOWN_ADS,
  HOME_DOGTOWN_NEWS,
  nextHoloPanelView,
  type HoloPanelView,
} from './homeDogtownHolomapData';
import {
  NIGHT_CITY_DISTRICTS,
  type NightCityDistrictId,
} from './homeNightCityDistricts';
import styles from './HomeDistrictHolomap.module.css';

const HOTSPOT_R = 14;

const HolomapMapBody = ({
  selected,
  pick,
}: {
  selected: NightCityDistrictId;
  pick: (id: NightCityDistrictId) => void;
}) => {
  const district = NIGHT_CITY_DISTRICTS.find((d) => d.id === selected)!;

  return (
    <>
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
          <ellipse className={styles.projector} cx={118} cy={165} rx={42} ry={8} />
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
    </>
  );
};

export const HomeDistrictHolomap = () => {
  const { animationsOn, mounted } = useMotion();
  const [selected, setSelected] = useState<NightCityDistrictId>('watson');
  const [panelView, setPanelView] = useState<HoloPanelView>('map');
  const [newsIdx, setNewsIdx] = useState(0);
  const [adIdx, setAdIdx] = useState(0);
  const [swapKey, setSwapKey] = useState(0);
  const hoverPauseRef = useRef(false);
  const rotateMs = animationsOn ? HOLO_PANEL_ROTATE_MS : HOLO_PANEL_ROTATE_MS_MOTION_OFF;

  const pick = useCallback((id: NightCityDistrictId) => {
    playCyberSound('ui', { volume: 0.2 });
    setSelected(id);
  }, []);

  const transitionTo = useCallback((next: HoloPanelView) => {
    setPanelView((prev) => {
      if (prev === next) return prev;
      if (next === 'dogtown-news' && prev === 'dogtown-ad') {
        setNewsIdx((i) => (i + 1) % HOME_DOGTOWN_NEWS.length);
      }
      if (next === 'dogtown-ad' && prev === 'dogtown-news') {
        setAdIdx((i) => (i + 1) % HOME_DOGTOWN_ADS.length);
      }
      setSwapKey((k) => k + 1);
      return next;
    });
  }, []);

  const goMap = useCallback(() => {
    playCyberSound('ui', { volume: 0.18 });
    transitionTo('map');
  }, [transitionTo]);

  const goDogtown = useCallback(() => {
    playCyberSound('ui', { volume: 0.18 });
    setPanelView((prev) => {
      if (prev === 'dogtown-news' || prev === 'dogtown-ad') return prev;
      setSwapKey((k) => k + 1);
      return 'dogtown-news';
    });
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;
    const id = window.setInterval(() => {
      if (hoverPauseRef.current) return;
      setPanelView((prev) => {
        const next = nextHoloPanelView(prev);
        if (prev === next) return prev;
        if (next === 'dogtown-news' && prev === 'dogtown-ad') {
          setNewsIdx((i) => (i + 1) % HOME_DOGTOWN_NEWS.length);
        }
        if (next === 'dogtown-ad' && prev === 'dogtown-news') {
          setAdIdx((i) => (i + 1) % HOME_DOGTOWN_ADS.length);
        }
        setSwapKey((k) => k + 1);
        return next;
      });
    }, rotateMs);
    return () => window.clearInterval(id);
  }, [mounted, rotateMs]);

  const news = HOME_DOGTOWN_NEWS[newsIdx];
  const ad = HOME_DOGTOWN_ADS[adIdx];
  const onDogtownChannel = panelView === 'dogtown-news' || panelView === 'dogtown-ad';
  const headTag =
    panelView === 'map'
      ? 'WIRE OVERLAY v2.077'
      : panelView === 'dogtown-news'
        ? 'SINAL PIRATA · N54'
        : 'INSERT PATROCINADO';

  const bodyClass = [styles.body, animationsOn ? styles.bodyAnimate : ''].filter(Boolean).join(' ');

  return (
    <section
      className={styles.holo}
      aria-label="Holoprojetor de distritos de Night City"
      onMouseEnter={() => {
        hoverPauseRef.current = true;
      }}
      onMouseLeave={() => {
        hoverPauseRef.current = false;
      }}
    >
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <span>
            {onDogtownChannel ? 'WATSON HOLOPROJ · FEED DOGTOWN' : 'WATSON HOLOPROJ · MAPA NC'}
          </span>
          <div className={styles.tabs} role="tablist" aria-label="Canal do holoprojetor">
            <button
              type="button"
              role="tab"
              aria-selected={panelView === 'map'}
              className={styles.tab}
              data-active={panelView === 'map' || undefined}
              onClick={goMap}
            >
              MAPA
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={onDogtownChannel}
              className={styles.tab}
              data-active={onDogtownChannel || undefined}
              onClick={goDogtown}
            >
              DOGTOWN
            </button>
          </div>
        </div>
        <span className={styles.tag}>{headTag}</span>
      </div>
      <div key={swapKey} className={bodyClass}>
        {panelView === 'map' ? (
          <HolomapMapBody selected={selected} pick={pick} />
        ) : panelView === 'dogtown-news' ? (
          <>
            <div className={styles.dogtownStamp} aria-hidden>
              <svg className={styles.dogtownSvg} viewBox="0 0 160 120">
                <rect
                  className={styles.dogtownWall}
                  x="12"
                  y="28"
                  width="136"
                  height="72"
                  rx="2"
                />
                <path className={styles.dogtownWall} d="M 12 28 L 80 8 L 148 28" fill="none" />
                <text className={styles.dogtownLabel} x="80" y="68" textAnchor="middle">
                  DOGTOWN
                </text>
                <text className={styles.dogtownSub} x="80" y="82" textAnchor="middle">
                  BARGHEST
                </text>
              </svg>
            </div>
            <article className={styles.dogtownDetail} aria-live="polite">
              <p className={styles.dogtownKicker}>{news.kicker}</p>
              <h3 className={styles.detailTitle}>{news.headline}</h3>
              <p>{news.body}</p>
              <p className={styles.dogtownDateline}>{news.dateline}</p>
            </article>
          </>
        ) : (
          <article className={styles.dogtownAd} aria-live="polite">
            <p className={styles.adSponsor}>{ad.sponsor}</p>
            <h3 className={styles.adTitle}>{ad.title}</h3>
            <p className={styles.adCopy}>{ad.copy}</p>
            <Link href={ad.href} className={styles.adCta} aria-label={ad.ariaLabel}>
              {ad.cta}
            </Link>
          </article>
        )}
      </div>
      {mounted ? (
        <p className={styles.rotateHint}>
          Rotação {Math.round(rotateMs / 1000)}s · mapa → notícias → patrocínio · pausa ao passar o
          mouse
        </p>
      ) : null}
    </section>
  );
};
