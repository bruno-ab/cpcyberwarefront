'use client';

import { useEffect, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { apiUrl } from '../../lib/api';
import styles from '../book/book.module.css';

type Lore = { id: string; title: string; body: string; order: number };

const LorePage = () => {
  const [chapters, setChapters] = useState<Lore[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/lore'))
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setChapters(list);
        if (list[0]) setActive(list[0].id);
      })
      .catch(() => setChapters([]));
  }, []);

  const current = chapters.find((c) => c.id === active) || chapters[0];

  return (
    <PageFrame>
      <div className={styles.layout}>
        <aside className={styles.toc}>
          <h1>Lore</h1>
          <ul>
            {chapters.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={c.id === current?.id ? styles.active : undefined}
                  onClick={() => setActive(c.id)}
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <HudPanel title={current?.title || 'Lore'}>
          <pre className={styles.body}>{current?.body || 'Sem lore carregado.'}</pre>
        </HudPanel>
      </div>
    </PageFrame>
  );
};

export default LorePage;
