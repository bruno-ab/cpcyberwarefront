'use client';

import Link from 'next/link';
import { useCampaign } from '../../lib/campaign';
import { wantedLabel } from '../../lib/heat';
import styles from './HeatStrip.module.css';

export const HeatStrip = () => {
  const { heat, effects, campaign, loading } = useCampaign();

  if (loading && !campaign) return null;

  return (
    <Link href="/news" className={styles.strip} title="Abrir noticiário N54 / Heat">
      <span className={styles.stars}>{wantedLabel(heat.police)}</span>
      <span className={styles.meta}>
        CORPO {heat.corpo} · MÍDIA {heat.media}
        {effects ? ` · ×${effects.shopMarkup.toFixed(2)}` : ''}
      </span>
      <span className={styles.cta}>N54</span>
    </Link>
  );
};
