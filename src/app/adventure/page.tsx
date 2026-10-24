'use client';

import { useEffect, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { apiUrl } from '../../lib/api';

const AdventurePage = () => {
  const [adv, setAdv] = useState<any>(null);

  useEffect(() => {
    fetch(apiUrl('/api/adventures'))
      .then((r) => r.json())
      .then((d) => setAdv(Array.isArray(d) ? d[0] : d));
  }, []);

  return (
    <PageFrame>
      <HudPanel title={adv?.title || 'Aventura-exemplo'}>
        {(adv?.acts || []).map((act: any) => (
          <section key={act.id} style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ color: 'var(--cp-yellow)' }}>{act.title}</h3>
            <p>{act.summary}</p>
            <ul>
              {(act.scenes || []).map((s: string) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        ))}
        <p style={{ color: 'var(--cp-text-muted)' }}>
          Timeline: Anteriormente em Night City — use a mesa VTT (Braindance) para replay de sessão.
        </p>
      </HudPanel>
    </PageFrame>
  );
};

export default AdventurePage;
