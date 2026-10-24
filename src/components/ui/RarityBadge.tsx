import styles from './hud.module.css';

const normalize = (rarity: string) => {
  const key = rarity.trim();
  if (/legendary/i.test(key)) return 'legendary';
  if (/epic/i.test(key)) return 'epic';
  if (/rare/i.test(key)) return 'rare';
  if (/uncommon/i.test(key)) return 'uncommon';
  return 'common';
};

export const RarityBadge = ({ rarity }: { rarity: string }) => (
  <span className={`${styles.badge} ${styles[`rarity_${normalize(rarity)}`]}`}>
    {rarity}
  </span>
);
