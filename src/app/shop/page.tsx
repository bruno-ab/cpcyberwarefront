'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';
import {
  formatEddies,
  itemEddiePrice,
  streetCredPrice,
} from '../../lib/shopPricing';

type Gear = { id: string; name: string; price: number; rarity?: string; category?: string };
type Vehicle = { id: string; name: string; price: number };
type Campaign = { eddies: number; streetCred: number; hideout?: any };
type Character = {
  id: string;
  name: string;
  credits?: number;
  sheet?: {
    inventory?: {
      gear?: Array<{ id: string | number; name: string; installed?: boolean }>;
      cyberware?: Array<{
        id: string | number;
        name: string;
        installable?: boolean;
        installed?: boolean;
      }>;
      vehicles?: Array<{ id: string | number; name: string }>;
    };
  };
};

const ShopPage = () => {
  const router = useRouter();
  const [gear, setGear] = useState<Gear[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [cyberware, setCyberware] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterId, setCharacterId] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const campaignId = 1;

  const selected = useMemo(
    () => characters.find((c) => String(c.id) === String(characterId)) || null,
    [characters, characterId],
  );

  const ownedChrome = useMemo(() => {
    const list = selected?.sheet?.inventory?.cyberware || [];
    return list.filter((c) => c.installable !== false && !c.installed);
  }, [selected]);

  const streetCred = campaign?.streetCred || 0;

  const reload = async () => {
    const [g, v, c, camp, chars] = await Promise.all([
      fetch(apiUrl('/api/gear')).then((r) => r.json()).catch(() => []),
      fetch(apiUrl('/api/vehicles')).then((r) => r.json()).catch(() => []),
      fetch(apiUrl('/api/cyberware')).then((r) => r.json()).catch(() => []),
      fetch(apiUrl(`/api/campaigns/${campaignId}`))
        .then((r) => r.json())
        .catch(() => null),
      fetch(apiUrl('/api/characters/player/characters'), {
        headers: authHeaders(),
      })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]);
    setGear(Array.isArray(g) ? g : []);
    setVehicles(Array.isArray(v) ? v : []);
    setCyberware(Array.isArray(c) ? c.slice(0, 16) : []);
    setCampaign(camp);
    const list = Array.isArray(chars) ? chars : [];
    setCharacters(list);
    if (!characterId && list[0]) setCharacterId(String(list[0].id));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buy = async (itemId: string, kind: 'gear' | 'vehicle' | 'cyberware') => {
    if (!characterId) {
      setMsg('Escolha um personagem — a compra vai para a ficha.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/shop/buy`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ itemId, kind, characterId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.message || 'Falha na compra');
        return;
      }
      setMsg(
        `Comprado por ${formatEddies(data.price)} → inventário de ${
          selected?.name || 'runner'
        }.`,
      );
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const priceLabel = (item: { price?: number; implant_cost?: number }) => {
    const base = itemEddiePrice(item);
    const final = streetCredPrice(base, streetCred);
    if (final !== base) {
      return `${formatEddies(final)} (lista ${formatEddies(base)})`;
    }
    return formatEddies(base);
  };

  return (
    <PageFrame>
      <HudPanel title="Ripperdoc / Loja">
        {campaign && (
          <p>
            Eddies campanha {formatEddies(campaign.eddies)} · Street Cred{' '}
            {campaign.streetCred} (desconto até 30%)
          </p>
        )}

        <label
          style={{
            display: 'grid',
            gap: '0.25rem',
            maxWidth: '20rem',
            marginBottom: '0.85rem',
            fontFamily: 'var(--cp-font-mono)',
            fontSize: '0.75rem',
            color: 'var(--cp-cyan)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Comprar para
          <select
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            style={{
              background: '#0a0a12',
              border: '1px solid var(--cp-border-strong)',
              color: '#fff',
              padding: '0.4rem',
            }}
          >
            {characters.length === 0 && (
              <option value="">Nenhum personagem</option>
            )}
            {characters.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name} · {formatEddies(Number(c.credits) || 0)}
              </option>
            ))}
          </select>
        </label>

        {msg && <p style={{ color: 'var(--cp-cyan)' }}>{msg}</p>}

        {ownedChrome.length > 0 && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              border: '1px solid var(--cp-yellow)',
              display: 'grid',
              gap: '0.45rem',
            }}
          >
            <strong style={{ color: 'var(--cp-yellow)' }}>
              Chrome comprado (não instalado)
            </strong>
            {ownedChrome.map((c) => (
              <div
                key={`own-${c.id}-${c.name}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <span>{c.name}</span>
                <HudButton
                  onClick={() =>
                    router.push(`/cyberware?id=${encodeURIComponent(characterId)}`)
                  }
                >
                  Instalar
                </HudButton>
              </div>
            ))}
          </div>
        )}

        <h3>Armas & gear</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {gear.map((g) => (
            <div
              key={g.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <span>
                {g.name} · {priceLabel(g)}
              </span>
              <HudButton disabled={busy || !characterId} onClick={() => buy(g.id, 'gear')}>
                Comprar
              </HudButton>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '1.25rem' }}>Chrome (instalável)</h3>
        <p style={{ color: 'var(--cp-text-dim)', fontSize: '0.85rem' }}>
          Comprar coloca o chrome no inventário da ficha. Instalar abre o
          ripperdoc do personagem.
        </p>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {cyberware.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                alignItems: 'center',
              }}
            >
              <span>
                {c.name} · {priceLabel(c)}
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <HudButton
                  disabled={busy || !characterId}
                  onClick={() => buy(String(c.id), 'cyberware')}
                >
                  Comprar
                </HudButton>
                <HudButton
                  variant="ghost"
                  disabled={!characterId}
                  onClick={() =>
                    router.push(
                      `/cyberware?id=${encodeURIComponent(characterId)}`,
                    )
                  }
                >
                  Instalar
                </HudButton>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '1.25rem' }}>Veículos / hideout</h3>
        {campaign?.hideout && (
          <p>
            Hideout nv.{campaign.hideout.level} · slots veículo{' '}
            {campaign.hideout.vehicleSlots} ·{' '}
            {(campaign.hideout.upgrades || []).join(', ')}
          </p>
        )}
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {vehicles.map((v) => (
            <div
              key={v.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <span>
                {v.name} · {priceLabel(v)}
              </span>
              <HudButton
                disabled={busy || !characterId}
                onClick={() => buy(v.id, 'vehicle')}
              >
                Comprar
              </HudButton>
            </div>
          ))}
        </div>
      </HudPanel>
    </PageFrame>
  );
};

export default ShopPage;
