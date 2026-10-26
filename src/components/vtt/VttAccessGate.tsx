'use client';

import Link from 'next/link';
import { HudPanel } from '../ui/HudPanel';
import { HudButton } from '../ui/HudButton';
import styles from './vttAccessGate.module.css';

export type VttAccessGateProps = {
  loading?: boolean;
  title: string;
  message: string;
  campaignId?: number;
  showLogin?: boolean;
};

export const VttAccessGate = ({
  loading,
  title,
  message,
  campaignId,
  showLogin,
}: VttAccessGateProps) => (
  <div className={styles.wrap}>
    <HudPanel title={title}>
      {loading ? (
        <div
          className={styles.loadingBlock}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className={styles.spinner} aria-hidden />
          <p className={styles.msg}>{message}</p>
        </div>
      ) : (
        <p className={styles.msg}>{message}</p>
      )}
      {!loading ? (
        <div className={styles.actions}>
          {showLogin ? (
            <Link href="/login?next=/table">
              <HudButton>Entrar na conta</HudButton>
            </Link>
          ) : null}
          <Link href="/campaigns">
            <HudButton variant="ghost">Ir para campanhas</HudButton>
          </Link>
          {campaignId && campaignId > 0 ? (
            <Link href={`/campaigns/${campaignId}`}>
              <HudButton variant="ghost">Detalhes da campanha</HudButton>
            </Link>
          ) : null}
        </div>
      ) : null}
    </HudPanel>
  </div>
);
