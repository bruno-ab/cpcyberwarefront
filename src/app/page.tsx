'use client';

import Link from 'next/link';
import { PageFrame } from '../components/layout/PageFrame';
import { HudButton } from '../components/ui/HudButton';
import { HudPanel } from '../components/ui/HudPanel';
import { useTranslations } from '../i18n/useTranslations';
import styles from './home.module.css';

const Home = () => {
  const { t } = useTranslations();

  return (
    <PageFrame>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t('common.tagline')}</p>
          <h1 className={styles.title}>{t('home.hero')}</h1>
          <p className={styles.sub}>{t('home.sub')}</p>
          <div className={styles.ctaRow}>
            <Link href="/login">
              <HudButton>{t('common.cta.enter')}</HudButton>
            </Link>
            <Link href="/catalog">
              <HudButton variant="ghost">{t('common.cta.catalog')}</HudButton>
            </Link>
            <Link href="/book">
              <HudButton variant="ghost">{t('common.cta.book')}</HudButton>
            </Link>
          </div>
          <p className={styles.soon}>
            <Link href="/table">{t('home.soonTable')}</Link>
          </p>
        </div>
        <div className={styles.skyline} aria-hidden>
          <svg viewBox="0 0 640 360" className={styles.skySvg}>
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a1030" />
                <stop offset="100%" stopColor="#0a0a0c" />
              </linearGradient>
            </defs>
            <rect width="640" height="360" fill="url(#sky)" />
            <g fill="#12141a" stroke="#fcee0a" strokeWidth="1.5">
              <path d="M0 300 L40 300 L40 180 L80 180 L80 220 L120 220 L120 140 L160 140 L160 300 Z" />
              <path d="M170 300 L170 120 L210 90 L250 120 L250 300 Z" />
              <path d="M260 300 L260 160 L320 160 L320 100 L360 100 L360 300 Z" />
              <path d="M380 300 L380 200 L420 200 L420 80 L460 80 L480 110 L500 80 L540 80 L540 300 Z" />
              <path d="M550 300 L550 190 L600 190 L600 240 L640 240 L640 300 Z" />
            </g>
            <g stroke="#2be4ea" strokeWidth="1" opacity="0.7">
              <line x1="0" y1="310" x2="640" y2="310" />
              <line x1="80" y1="200" x2="80" y2="210" />
              <line x1="140" y1="160" x2="140" y2="170" />
              <line x1="300" y1="120" x2="300" y2="130" />
              <line x1="450" y1="100" x2="450" y2="115" />
            </g>
            <text x="24" y="40" fill="#ff2a6d" fontFamily="Share Tech Mono" fontSize="14">
              NIGHT CITY UPLINK
            </text>
          </svg>
        </div>
      </section>

      <div className={styles.grid}>
        <HudPanel title="Chrome">
          Capacidade 10, Edges, Hack e cyberpsicose — catálogo Storyteller pronto para a mesa.
        </HudPanel>
        <HudPanel title="Lore">
          Distritos, facções e gigs. Texto original noir para conduzir sessões em Night City.
        </HudPanel>
        <HudPanel title="Mesa">
          VTT com tokens, dados no servidor e Breach Protocol — em construção na rota /table.
        </HudPanel>
      </div>
    </PageFrame>
  );
};

export default Home;
