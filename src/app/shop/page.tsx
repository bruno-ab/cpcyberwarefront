'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { CyberwareFilterBar } from '../../components/cyberware/CyberwareFilterBar';
import { apiUrl, authHeaders } from '../../lib/api';
import {
  DEFAULT_CYBERWARE_FILTERS,
  matchesChromeFilters,
  sortChromeItems,
  type CyberwareFilterState,
} from '../../lib/cyberwareFilters';
import {
  formatEddies,
  itemEddiePrice,
  heatAwarePrice,
} from '../../lib/shopPricing';
import type { CampaignHeat } from '../../lib/heat';
import { heatShopMarkup } from '../../lib/heat';
import { useCampaign } from '../../lib/campaign';
import styles from './shop.module.css';

type Gear = { id: string; name: string; price: number; rarity?: string; category?: string };
type Vehicle = { id: string; name: string; price: number };
type Campaign = {
  eddies: number;
  streetCred: number;
  hideout?: any;
  heat?: CampaignHeat;
};
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
        price?: number;
        type?: string;
        installable?: boolean;
        installed?: boolean;
      }>;
      vehicles?: Array<{ id: string | number; name: string }>;
    };
  };
};

const ShopPage = () => {
  const router = useRouter();
  const { campaignId, refresh: refreshCampaign } = useCampaign();
  const [gear, setGear] = useState<Gear[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [cyberware, setCyberware] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterId, setCharacterId] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [chromeFilters, setChromeFilters] = useState<CyberwareFilterState>(
    DEFAULT_CYBERWARE_FILTERS,
  );

  const selected = useMemo(
    () => characters.find((c) => String(c.id) === String(characterId)) || null,
    [characters, characterId],
  );

  const ownedChrome = useMemo(() => {
    const list = selected?.sheet?.inventory?.cyberware || [];
    return list.filter((c) => c.installable !== false && !c.installed);
  }, [selected]);

  const installedIds = useMemo(() => {
    const inv = selected?.sheet?.inventory?.cyberware || [];
    return new Set(
      inv
        .filter((c) => c.installed)
        .map((c) => Number(c.id))
        .filter((id) => Number.isFinite(id)),
    );
  }, [selected]);

  const ownedIds = useMemo(
    () => new Set(ownedChrome.map((c) => Number(c.id))),
    [ownedChrome],
  );

  const streetCred = campaign?.streetCred || 0;
  const heat = campaign?.heat;
  const heatMod = heatShopMarkup(heat);
  const priceOf = (base: number) => heatAwarePrice(base, streetCred, heat);
  const wallet = Number(campaign?.eddies || 0);

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
    setCyberware(Array.isArray(c) ? c : []);
    setCampaign(camp);
    const list = Array.isArray(chars) ? chars : [];
    setCharacters(list);
    if (!characterId && list[0]) setCharacterId(String(list[0].id));
    await refreshCampaign();
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

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
    const final = priceOf(base);
    if (final !== base) {
      return `${formatEddies(final)} (lista ${formatEddies(base)})`;
    }
    return formatEddies(base);
  };

  const filteredOwnedChrome = useMemo(() => {
    if (
      chromeFilters.status === 'buyable' ||
      chromeFilters.status === 'installed'
    ) {
      return [];
    }
    const rows = ownedChrome
      .map((c) => {
        const cat = cyberware.find((x) => Number(x.id) === Number(c.id));
        return {
          ...c,
          rarity: cat?.rarity,
          type: cat?.type,
          description: cat?.description || cat?.effect,
          effect: cat?.effect,
          price: Number(c.price) || priceOf(itemEddiePrice(cat || c)),
          edgeCost: Number(cat?.edge_cost ?? cat?.edgeCost ?? 0) || 0,
        };
      })
      .filter((c) =>
        matchesChromeFilters(
          c,
          { ...chromeFilters, affordableOnly: false },
        ),
      );
    return sortChromeItems(rows, chromeFilters.sort);
  }, [ownedChrome, cyberware, chromeFilters, streetCred, heat]);

  const filteredCyberware = useMemo(() => {
    if (
      chromeFilters.status === 'owned' ||
      chromeFilters.status === 'installed'
    ) {
      return [];
    }
    const rows = cyberware
      .filter((c) => {
        const id = Number(c.id);
        if (installedIds.has(id)) return false;
        if (chromeFilters.status === 'buyable' && ownedIds.has(id)) {
          return false;
        }
        return matchesChromeFilters(
          {
            id: c.id,
            name: c.name,
            type: c.type,
            rarity: c.rarity,
            description: c.description,
            effect: c.effect,
            price: priceOf(itemEddiePrice(c)),
            edgeCost: Number(c.edge_cost ?? c.edgeCost ?? 0) || 0,
          },
          chromeFilters,
          { wallet },
        );
      })
      .map((c) => ({
        ...c,
        price: priceOf(itemEddiePrice(c)),
        edgeCost: Number(c.edge_cost ?? c.edgeCost ?? 0) || 0,
      }));
    return sortChromeItems(rows, chromeFilters.sort);
  }, [
    cyberware,
    chromeFilters,
    installedIds,
    ownedIds,
    wallet,
    streetCred,
    heat,
  ]);

  const chromeResultCount =
    filteredOwnedChrome.length + filteredCyberware.length;

  return (
    <PageFrame>
      <HudPanel title="Ripperdoc / Loja">
        <div className={styles.stack}>
          {campaign && (
            <p className={styles.ledger}>
              Eddies campanha {formatEddies(campaign.eddies)} · Street Cred{' '}
              {campaign.streetCred} · Heat ×{heatMod.toFixed(2)}{' '}
              <a href="/news" style={{ color: 'inherit' }}>
                (noticiário)
              </a>
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
            <CyberwareFilterBar
              value={chromeFilters}
              onChange={setChromeFilters}
              showAffordable
              resultCount={chromeResultCount}
              searchPlaceholder="Filtrar chrome por nome, raridade…"
            />
            {(chromeFilters.status === 'all' ||
              chromeFilters.status === 'owned') &&
              (filteredOwnedChrome.length > 0 ||
                chromeFilters.status === 'owned') && (
                <div className={styles.pending}>
                  <div className={styles.pendingTitle}>
                    Chrome comprado — aguardando instalação
                  </div>
                  {filteredOwnedChrome.length === 0 ? (
                    <p className={styles.hint}>
                      Nenhum chrome no inventário com esses filtros.
                    </p>
                  ) : (
                    filteredOwnedChrome.map((c) => (
                      <div
                        key={`own-${c.id}-${c.name}`}
                        className={styles.row}
                      >
                        <div className={styles.rowMeta}>
                          <span className={styles.rowName}>{c.name}</span>
                          <span className={styles.rowPrice}>
                            {c.rarity ? `${c.rarity} · ` : ''}
                            pago {formatEddies(Number(c.price) || 0)}
                          </span>
                        </div>
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
                    ))
                  )}
                </div>
              )}
            {(chromeFilters.status === 'all' ||
              chromeFilters.status === 'buyable') && (
              <div className={styles.list}>
                {filteredCyberware.length === 0 ? (
                  <p className={styles.hint}>
                    Nenhuma peça à venda com esses filtros.
                  </p>
                ) : (
                  filteredCyberware.map((c) => (
                    <div key={c.id} className={styles.row}>
                      <div className={styles.rowMeta}>
                        <span className={styles.rowName}>{c.name}</span>
                        <span className={styles.rowPrice}>
                          {c.rarity ? `${c.rarity} · ` : ''}
                          {priceLabel(c)}
                        </span>
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
                  ))
                )}
              </div>
            )}
            {chromeFilters.status === 'installed' && (
              <p className={styles.hint}>
                Chrome instalado fica no ripperdoc — abra{' '}
                <button
                  type="button"
                  className={styles.linkish}
                  disabled={!characterId}
                  onClick={() =>
                    router.push(
                      `/cyberware?id=${encodeURIComponent(characterId)}`,
                    )
                  }
                >
                  /cyberware
                </button>{' '}
                para filtrar peças implantadas.
              </p>
            )}
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
