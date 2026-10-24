'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';

type WikiPage = {
  id: number;
  slug: string;
  title: string;
  body: string;
  visibility: string;
};

const renderLinks = (body: string) =>
  body.replace(/\[\[([^\]]+)\]\]/g, (_m, slug) => `⟦${slug}⟧`);

const WikiPageView = () => {
  const [role, setRole] = useState<'player' | 'gm'>('player');
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [active, setActive] = useState('');
  const campaignId = 1;

  const load = () => {
    fetch(apiUrl(`/api/campaigns/${campaignId}/wiki?role=${role}`))
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setPages(list);
        if (list[0]) setActive(list[0].slug);
      });
  };

  useEffect(() => {
    load();
  }, [role]);

  const current = pages.find((p) => p.slug === active) || pages[0];
  const privateHidden = useMemo(
    () => role === 'player' && !pages.some((p) => p.visibility === 'private'),
    [pages, role],
  );

  return (
    <PageFrame>
      <HudPanel title="Wiki da campanha">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <HudButton variant={role === 'player' ? 'primary' : 'ghost'} onClick={() => setRole('player')}>
            Vista jogador
          </HudButton>
          <HudButton variant={role === 'gm' ? 'primary' : 'ghost'} onClick={() => setRole('gm')}>
            Vista GM
          </HudButton>
        </div>
        {privateHidden && (
          <p style={{ color: 'var(--cp-cyan)', fontSize: '0.85rem' }}>
            Notas privadas do GM ocultas nesta vista.
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {pages.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => setActive(p.slug)}>
                  {p.title}
                  {p.visibility === 'private' ? ' 🔒' : ''}
                </button>
              </li>
            ))}
          </ul>
          <article>
            <h2>{current?.title}</h2>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{renderLinks(current?.body || '')}</pre>
          </article>
        </div>
      </HudPanel>
    </PageFrame>
  );
};

export default WikiPageView;
