'use client';

import { useEffect, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';

type Gig = {
  id: string;
  name: string;
  fixer: string;
  districtId: string;
  risk: number;
  pay: number;
  streetCredReq: number;
  summary: string;
};

type Campaign = {
  id: number;
  streetCred: number;
  eddies: number;
  activeGigIds: string[];
  completedGigIds: string[];
  factionRep: Record<string, number>;
};

const GigsPage = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const campaignId = 1;

  const reload = () => {
    fetch(apiUrl('/api/gigs'))
      .then((r) => r.json())
      .then((d) => setGigs(Array.isArray(d) ? d : []));
    fetch(apiUrl(`/api/campaigns/${campaignId}`))
      .then((r) => r.json())
      .then(setCampaign)
      .catch(() => setCampaign(null));
  };

  useEffect(() => {
    reload();
  }, []);

  const accept = async (gigId: string) => {
    await fetch(apiUrl(`/api/campaigns/${campaignId}/gigs/${gigId}/accept`), {
      method: 'POST',
      headers: authHeaders(),
    });
    reload();
  };

  const complete = async (gigId: string) => {
    await fetch(apiUrl(`/api/campaigns/${campaignId}/gigs/${gigId}/complete`), {
      method: 'POST',
      headers: authHeaders(),
    });
    reload();
  };

  return (
    <PageFrame>
      <HudPanel title="Quadro de gigs">
        {campaign && (
          <p>
            Street Cred {campaign.streetCred}/100 · Eddies ¤{campaign.eddies}
          </p>
        )}
        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          {gigs.map((g) => {
            const active = campaign?.activeGigIds?.includes(g.id);
            const done = campaign?.completedGigIds?.includes(g.id);
            return (
              <article
                key={g.id}
                style={{
                  border: '1px solid var(--cp-border)',
                  padding: '0.75rem',
                  background: 'var(--cp-bg-elevated)',
                }}
              >
                <h3 style={{ margin: 0, color: 'var(--cp-yellow)' }}>{g.name}</h3>
                <p style={{ margin: '0.35rem 0', color: 'var(--cp-text-muted)' }}>
                  Fixer {g.fixer} · {g.districtId} · risco {g.risk} · ¤{g.pay} · Cred{' '}
                  {g.streetCredReq}+
                </p>
                <p>{g.summary}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!active && !done && (
                    <HudButton onClick={() => accept(g.id)}>Aceitar</HudButton>
                  )}
                  {active && (
                    <HudButton onClick={() => complete(g.id)}>Completar</HudButton>
                  )}
                  {done && <span style={{ color: 'var(--cp-cyan)' }}>Concluído</span>}
                </div>
              </article>
            );
          })}
        </div>
        {campaign?.factionRep && (
          <div style={{ marginTop: '1.25rem' }}>
            <h3>Reputação</h3>
            <ul>
              {Object.entries(campaign.factionRep).map(([k, v]) => (
                <li key={k}>
                  {k}: {v}
                </li>
              ))}
            </ul>
          </div>
        )}
      </HudPanel>
    </PageFrame>
  );
};

export default GigsPage;
