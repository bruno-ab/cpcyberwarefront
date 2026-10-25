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
import styles from './shop.module.css';

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
        <div className={styles.stack}>
          {campaign && (
            <p className={styles.ledger}>
              Eddies campanha {formatEddies(campaign.eddies)} · Street Cred{' '}
              {campaign.streetCred} (desconto até 30%)
            </p>
          )}

          <label className={styles.buyer}>
            Comprar para
            <select
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
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

          {msg && <p className={styles.msg}>{msg}</p>}

          {ownedChrome.length > 0 && (
            <div className={styles.pending}>
              <div className={styles.pendingTitle}>
                Chrome comprado — aguardando instalação
              </div>
              {ownedChrome.map((c) => (
                <div key={`own-${c.id}-${c.name}`} className={styles.row}>
                  <span className={styles.rowName}>{c.name}</span>
                  <HudButton
                    onClick={() =>
                      router.push(
                        `/cyberware?id=${encodeURIComponent(characterId)}`,
                      )
                    }
                  >
                    Instalar
                  </HudButton>
                </div>
              ))}
            </div>
          )}

          <section className={styles.section}>
            <h3>Armas & gear</h3>
            <div className={styles.list}>
              {gear.map((g) => (
                <div key={g.id} className={styles.row}>
                  <div className={styles.rowMeta}>
                    <span className={styles.rowName}>{g.name}</span>
                    <span className={styles.rowPrice}>{priceLabel(g)}</span>
                  </div>
                  <HudButton
                    disabled={busy || !characterId}
                    onClick={() => buy(g.id, 'gear')}
                  >
                    Comprar
                  </HudButton>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3>Chrome (instalável)</h3>
            <p className={styles.hint}>
              Comprar coloca o chrome no inventário da ficha. Instalar abre o
              ripperdoc do personagem.
            </p>
            <div className={styles.list}>
              {cyberware.map((c) => (
                <div key={c.id} className={styles.row}>
                  <div className={styles.rowMeta}>
                    <span className={styles.rowName}>{c.name}</span>
                    <span className={styles.rowPrice}>{priceLabel(c)}</span>
                  </div>
                  <div className={styles.rowActions}>
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
          </section>

          <section className={styles.section}>
            <h3>Veículos / hideout</h3>
            {campaign?.hideout && (
              <p className={styles.hint}>
                Hideout nv.{campaign.hideout.level} · slots veículo{' '}
                {campaign.hideout.vehicleSlots} ·{' '}
                {(campaign.hideout.upgrades || []).join(', ')}
              </p>
            )}
            <div className={styles.list}>
              {vehicles.map((v) => (
                <div key={v.id} className={styles.row}>
                  <div className={styles.rowMeta}>
                    <span className={styles.rowName}>{v.name}</span>
                    <span className={styles.rowPrice}>{priceLabel(v)}</span>
                  </div>
                  <HudButton
                    disabled={busy || !characterId}
                    onClick={() => buy(v.id, 'vehicle')}
                  >
                    Comprar
                  </HudButton>
                </div>
              ))}
            </div>
          </section>
        </div>
      </HudPanel>
    </PageFrame>
  );
};

export default ShopPage;
