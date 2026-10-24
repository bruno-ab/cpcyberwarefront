'use client';

import { useEffect, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { apiUrl, authHeaders } from '../../lib/api';
import styles from './achievements.module.css';

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlocked?: boolean;
};

const AchievementsPage = () => {
  const [items, setItems] = useState<Achievement[]>([]);
  const campaignId = 1;

  useEffect(() => {
    fetch(apiUrl(`/api/campaigns/${campaignId}/achievements`), {
      headers: authHeaders(),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d)) {
          setItems(d);
          return;
        }
        return fetch(apiUrl('/api/achievements'))
          .then((r) => r.json())
          .then((list) =>
            setItems(
              (Array.isArray(list) ? list : []).map((a: Achievement) => ({
                ...a,
                unlocked: false,
              })),
            ),
          );
      })
      .catch(() => setItems([]));
  }, []);

  const unlocked = items.filter((i) => i.unlocked).length;

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1>Conquistas</h1>
            <p>
              Marcas da campanha Neon Debt — {unlocked}/{items.length}{' '}
              desbloqueadas.
            </p>
          </div>
        </header>
        <div className={styles.grid}>
          {items.map((a) => (
            <article
              key={a.id}
              className={styles.card}
              data-unlocked={a.unlocked ? 'true' : 'false'}
            >
              <span className={styles.icon} aria-hidden>
                {a.icon || '◆'}
              </span>
              <div>
                <h2>{a.name}</h2>
                <p>{a.description}</p>
                <em>{a.unlocked ? 'UNLOCKED' : 'LOCKED'}</em>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageFrame>
  );
};

export default AchievementsPage;
