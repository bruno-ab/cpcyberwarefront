'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { useTranslations } from '../../i18n/useTranslations';
import { apiUrl } from '../../lib/api';
import styles from './book.module.css';

type Chapter = {
  id: string;
  order: number;
  title: string;
  summary?: string;
  body: string;
  tags?: string[];
};

const BookPage = () => {
  const { t } = useTranslations('book');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState<string>('');
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/rules'))
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setChapters(list.sort((a: Chapter, b: Chapter) => a.order - b.order));
        if (list[0]) setActive(list[0].id);
      })
      .catch(() => setChapters([]));
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return chapters;
    return chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.body.toLowerCase().includes(term) ||
        (c.tags || []).some((tag) => tag.includes(term)),
    );
  }, [chapters, q]);

  const current = filtered.find((c) => c.id === active) || filtered[0];

  return (
    <PageFrame>
      <div className={styles.layout}>
        <aside className={styles.toc}>
          <h1>{t('title')}</h1>
          <input
            className={styles.search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search')}
            aria-label={t('search')}
          />
          <ul>
            {filtered.map((c) => (
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
          <a className={styles.export} href={apiUrl('/api/book/export.md')}>
            Exportar Markdown
          </a>
        </aside>
        <HudPanel className={styles.reader} title={current?.title || '—'}>
          <pre className={styles.body}>{current?.body || 'Sem capítulos.'}</pre>
        </HudPanel>
      </div>
    </PageFrame>
  );
};

export default BookPage;
