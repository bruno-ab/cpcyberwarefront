'use client';

import { HudButton } from '../ui/HudButton';
import styles from './CampaignMigrationModal.module.css';

export type MigrationConflict = {
  previousCampaignName: string;
  previousCampaignId?: number;
};

type Props = {
  open: boolean;
  conflict: MigrationConflict | null;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const CampaignMigrationModal = ({
  open,
  conflict,
  busy,
  onConfirm,
  onCancel,
}: Props) => {
  if (!open || !conflict) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.panel}>
        <h2>Trocar de campanha?</h2>
        <p>
          Este personagem está vinculado a{' '}
          <strong>{conflict.previousCampaignName}</strong>. Ao continuar, ele
          será <strong>desvinculado</strong> da campanha anterior e entrará no
          roster desta mesa (um personagem por campanha).
        </p>
        <div className={styles.actions}>
          <HudButton variant="ghost" type="button" disabled={busy} onClick={onCancel}>
            Cancelar
          </HudButton>
          <HudButton type="button" disabled={busy} onClick={onConfirm}>
            {busy ? 'Migrando…' : 'Confirmar desvincular'}
          </HudButton>
        </div>
      </div>
    </div>
  );
};

export default CampaignMigrationModal;
