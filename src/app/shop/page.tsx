'use client';

import { useEffect, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';

type Gear = { id: string; name: string; price: number; rarity?: string; category?: string };
type Vehicle = { id: string; name: string; price: number };
type Campaign = { eddies: number; streetCred: number; hideout?: any };

const ShopPage = () => {
  const [gear, setGear] = useState<Gear[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [cyberware, setCyberware] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [msg, setMsg] = useState('');
  const campaignId = 1;

  const reload = () => {
    fetch(apiUrl('/api/gear')).then((r) => r.json()).then((d) => setGear(Array.isArray(d) ? d : []));
    fetch(apiUrl('/api/vehicles'))
      .then((r) => r.json())
      .then((d) => setVehicles(Array.isArray(d) ? d : []));
    fetch(apiUrl('/api/cyberware'))
      .then((r) => r.json())
      .then((d) => setCyberware(Array.isArray(d) ? d.slice(0, 12) : []))
      .catch(() => setCyberware([]));
    fetch(apiUrl(`/api/campaigns/${campaignId}`))
      .then((r) => r.json())
      .then(setCampaign)
      .catch(() => null);
  };

  useEffect(() => {
    reload();
  }, []);

  const buy = async (itemId: string, kind: 'gear' | 'vehicle' | 'cyberware') => {
    setMsg('');
    const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/shop/buy`), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ itemId, kind, characterId: kind === 'cyberware' ? 1 : undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.message || 'Falha na compra');
      return;
    }
    setMsg(`Comprado por ¤${data.price}`);
    reload();
  };

  return (
    <PageFrame>
      <HudPanel title="Ripperdoc / Loja">
        {campaign && (
          <p>
            Eddies ¤{campaign.eddies} · Street Cred {campaign.streetCred} (desconto até 30%)
          </p>
        )}
        {msg && <p style={{ color: 'var(--cp-cyan)' }}>{msg}</p>}

        <h3>Armas & gear</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {gear.map((g) => (
            <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>
                {g.name} · ¤{g.price}
              </span>
              <HudButton onClick={() => buy(g.id, 'gear')}>Comprar</HudButton>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '1.25rem' }}>Chrome (instalação −Humanidade)</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {cyberware.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>
                {c.name} · ¤{c.price || c.implant_cost || 0}
              </span>
              <HudButton onClick={() => buy(String(c.id), 'cyberware')}>Instalar</HudButton>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '1.25rem' }}>Veículos / hideout</h3>
        {campaign?.hideout && (
          <p>
            Hideout nv.{campaign.hideout.level} · slots veículo {campaign.hideout.vehicleSlots} ·{' '}
            {(campaign.hideout.upgrades || []).join(', ')}
          </p>
        )}
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {vehicles.map((v) => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span>
                {v.name} · ¤{v.price}
              </span>
              <HudButton onClick={() => buy(v.id, 'vehicle')}>Comprar</HudButton>
            </div>
          ))}
        </div>
      </HudPanel>
    </PageFrame>
  );
};

export default ShopPage;
