'use client';

import { findRoleKit } from '../../data/roleAbilities';
import styles from './roleAbilities.module.css';

type Props = {
  characterData: {
    role?: string;
    sheet?: {
      header?: { role?: string };
      other_traits?: { role_ability_rank?: number };
    };
  };
  compact?: boolean;
};

export const RoleAbilities = ({ characterData, compact }: Props) => {
  const roleName =
    characterData.role ||
    characterData.sheet?.header?.role ||
    '';
  const kit = findRoleKit(roleName);
  const rank = Number(
    characterData.sheet?.other_traits?.role_ability_rank ?? 1,
  );

  if (!kit) {
    return (
      <div className={styles.empty}>
        Sem Role definida — escolha no wizard ou no header da ficha.
      </div>
    );
  }

  return (
    <div className={styles.wrap} data-compact={compact ? 'true' : undefined}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Role Ability</p>
          <h4>{kit.name}</h4>
          {!compact && <p className={styles.blurb}>{kit.blurb}</p>}
          {!compact && kit.world && (
            <p className={styles.world}>{kit.world}</p>
          )}
          {!compact && kit.focus && (
            <p className={styles.focus}>
              <span>Foco</span> {kit.focus}
            </p>
          )}
        </div>
        <span className={styles.rank}>Rank {rank}</span>
      </header>
      <ul className={styles.list}>
        {kit.abilities.map((a) => (
          <li key={a.id} className={styles.card}>
            <div className={styles.cardTop}>
              <strong>{a.name}</strong>
              <em>{a.ranks}</em>
            </div>
            <p>{a.summary}</p>
            {!compact && (
              <p className={styles.mech}>
                <span>Mesa</span>
                {a.mechanical}
              </p>
            )}
            {compact && (
              <p className={styles.mechShort}>{a.mechanical}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoleAbilities;
