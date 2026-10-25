'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SLOT_LABELS, CyberWareSlot } from '../../data/cyberwareSlots';
import {
  BodyPart,
  BODY_PART_LABELS,
  BODY_PART_SLOTS,
} from '../../data/bodyPartSlots';
import { apiUrl, authHeaders } from '../../lib/api';
import { useCampaign } from '../../lib/campaign';
import { cyberwareImageSrc } from '../../lib/media';
import {
  formatEddies,
  itemEddiePrice,
  heatAwarePrice,
} from '../../lib/shopPricing';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import styles from './CyberwareShop.module.css';

type CatalogItem = {
  id: number;
  name: string;
  type: string;
  image?: string;
  edge_cost?: number;
  edgeCost?: number;
  implant_cost?: number;
  implantCost?: number;
  price?: number;
  hack_difficulty?: number;
  rarity?: string;
  description?: string;
  effect?: string;
};

type InstalledItem = {
  id: number;
  name: string;
  type: string;
  image?: string;
  effect?: string;
  description?: string;
  rarity?: string;
  implantCost?: number;
  edgeCost?: number;
  price?: number;
};

type OwnedChrome = {
  id: string | number;
  name: string;
  type?: string | null;
  price?: number;
  installed?: boolean;
  installable?: boolean;
};

type Props = {
  characterId: string | number;
  sheet: Record<string, any>;
  installed?: InstalledItem[];
  selectedPart?: BodyPart | null;
  onClearPart?: () => void;
  onUpdated?: () => void | Promise<void>;
};

const sheetEdges = (sheet: Record<string, any> | null | undefined) =>
  Math.max(0, Number(sheet?.other_traits?.edges ?? 0) || 0);

export const CyberwareShop = ({
  characterId,
  sheet,
  installed = [],
  selectedPart = null,
  onClearPart,
  onUpdated,
}: Props) => {
  const router = useRouter();
  const { campaignId, refresh: refreshCampaign } = useCampaign();
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [filter, setFilter] = useState('');
  const [edges, setEdges] = useState(sheetEdges(sheet));
  const [streetCred, setStreetCred] = useState(0);
  const [heat, setHeat] = useState<import('../../lib/heat').CampaignHeat | null>(
    null,
  );
  const [campaignEddies, setCampaignEddies] = useState(0);
  const [localSheet, setLocalSheet] = useState(sheet);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const slotFilter = selectedPart ? BODY_PART_SLOTS[selectedPart] : null;
  const partLabel = selectedPart ? BODY_PART_LABELS[selectedPart] : null;

  useEffect(() => {
    setLocalSheet(sheet);
    setEdges(sheetEdges(sheet));
  }, [sheet]);

  const installedIds = useMemo(
    () => new Set(installed.map((cw) => Number(cw.id))),
    [installed],
  );

  /** Comprado e ainda não linkado como implantado (fonte: character_cyberwares). */
  const ownedPending = useMemo(() => {
    const list = (localSheet?.inventory?.cyberware || []) as OwnedChrome[];
    const seen = new Set<number>();
    return list.filter((c) => {
      const id = Number(c.id);
      if (!Number.isFinite(id) || seen.has(id)) return false;
      if (c.installable === false) return false;
      if (installedIds.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [localSheet, installedIds]);

  useEffect(() => {
    fetch(apiUrl('/api/cyberware'), { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setCatalog(Array.isArray(d) ? d : []))
      .catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    fetch(apiUrl(`/api/campaigns/${campaignId}`))
      .then((r) => r.json())
      .then((c) => {
        setStreetCred(Number(c?.streetCred || 0));
        setCampaignEddies(Number(c?.eddies || 0));
        setHeat(c?.heat || null);
      })
      .catch(() => undefined);
  }, [campaignId]);

  const installedHere = useMemo(() => {
    if (!slotFilter) return installed;
    return installed.filter((cw) =>
      slotFilter.includes(cw.type as CyberWareSlot),
    );
  }, [installed, slotFilter]);

  const ownedIds = useMemo(
    () => new Set(ownedPending.map((c) => Number(c.id))),
    [ownedPending],
  );

  const available = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return catalog.filter((c) => {
      if (slotFilter && !slotFilter.includes(c.type as CyberWareSlot)) {
        return false;
      }
      if (installedIds.has(Number(c.id))) return false;
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) ||
        c.rarity?.toLowerCase().includes(q)
      );
    });
  }, [catalog, filter, slotFilter, installedIds]);

  const displayPrice = (item: CatalogItem) => {
    const base = itemEddiePrice(item);
    return heatAwarePrice(base, streetCred, heat);
  };

  const edgeCostOf = (item: CatalogItem | OwnedChrome) => {
    const catalogItem =
      catalog.find((c) => Number(c.id) === Number(item.id)) || null;
    if (catalogItem) {
      return Math.max(
        0,
        Number(catalogItem.edge_cost ?? catalogItem.edgeCost ?? 0) || 0,
      );
    }
    return Math.max(
      0,
      Number((item as CatalogItem).edge_cost ?? (item as any).edgeCost ?? 0) ||
        0,
    );
  };

  const refreshAll = async () => {
    await Promise.all([Promise.resolve(onUpdated?.()), refreshCampaign()]);
    try {
      const c = await fetch(apiUrl(`/api/campaigns/${campaignId}`)).then((r) =>
        r.json(),
      );
      setStreetCred(Number(c?.streetCred || 0));
      setCampaignEddies(Number(c?.eddies || 0));
      setHeat(c?.heat || null);
    } catch {
      /* ignore */
    }
  };

  /** Compra com o mesmo preço da /shop — vai para inventário da ficha. */
  const buyOnly = async (item: CatalogItem) => {
    const price = displayPrice(item);
    if (campaignEddies < price) {
      playCyberSound('deny');
      setMsg(
        `Eddies insuficientes (tem ${formatEddies(campaignEddies)}, precisa ${formatEddies(price)}).`,
      );
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(
        apiUrl(`/api/campaigns/${campaignId}/shop/buy`),
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            itemId: String(item.id),
            kind: 'cyberware',
            characterId: String(characterId),
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Falha na compra');
      }
      playCyberSound('coin');
      const paid = Number(data.price ?? price);
      if (data.campaign?.eddies != null) {
        setCampaignEddies(Number(data.campaign.eddies));
      } else {
        setCampaignEddies((e) => Math.max(0, e - paid));
      }
      setLocalSheet((prev) => {
        const inv = {
          gear: [...(prev?.inventory?.gear || [])],
          vehicles: [...(prev?.inventory?.vehicles || [])],
          cyberware: [
            ...(prev?.inventory?.cyberware || []),
            {
              id: item.id,
              name: item.name,
              type: item.type,
              price: paid,
              installable: true,
              installed: false,
            },
          ],
        };
        return { ...prev, inventory: inv };
      });
      setMsg(
        `Comprado por ${formatEddies(paid)} — no inventário. Clique em Instalar (${edgeCostOf(item)} E).`,
      );
      await refreshAll();
    } catch (e: any) {
      playCyberSound('deny');
      setMsg(e.message || 'Falha na compra');
    } finally {
      setBusy(false);
    }
  };

  const installOwned = async (item: CatalogItem | OwnedChrome) => {
    const cost = edgeCostOf(item);
    if (edges < cost) {
      playCyberSound('deny');
      setMsg(
        `Edges insuficientes na ficha (tem ${edges} E, precisa ${cost} E). Ajuste em Ficha → Recursos.`,
      );
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const install = await fetch(
        apiUrl(`/api/characters/${characterId}/cyberware`),
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ cyberwareId: Number(item.id) }),
        },
      );
      const payload = await install.json().catch(() => ({}));
      if (!install.ok) {
        throw new Error(
          payload.message ||
            'Não foi possível instalar (Edges / capacidade / slot).',
        );
      }
      playCyberSound('install');
      const nextEdges =
        payload.edges != null ? Number(payload.edges) : Math.max(0, edges - cost);
      setEdges(nextEdges);
      setLocalSheet((prev) => {
        const list = (prev?.inventory?.cyberware || []) as OwnedChrome[];
        const cyberware = list.map((row) =>
          Number(row.id) === Number(item.id)
            ? { ...row, installed: true }
            : row,
        );
        return {
          ...prev,
          other_traits: { ...(prev.other_traits || {}), edges: nextEdges },
          inventory: {
            gear: [...(prev?.inventory?.gear || [])],
            vehicles: [...(prev?.inventory?.vehicles || [])],
            cyberware,
          },
        };
      });
      await refreshAll();
      const q = new URLSearchParams({
        id: String(characterId),
        name: String(item.name || 'chrome'),
      });
      router.push(`/installation?${q.toString()}`);
    } catch (e: any) {
      playCyberSound('deny');
      setMsg(e.message || 'Falha ao instalar');
      setBusy(false);
    }
  };

  const uninstall = async (item: InstalledItem) => {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(
        apiUrl(`/api/characters/${characterId}/cyberware`),
        {
          method: 'DELETE',
          headers: authHeaders(),
          body: JSON.stringify({ cyberwareId: item.id }),
        },
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.message || 'Não foi possível remover o chrome.');
      }
      if (payload.edges != null) {
        setEdges(Number(payload.edges));
      }
      setMsg(
        payload.refundedEdges
          ? `Removido: ${item.name} (+${payload.refundedEdges} E devolvidos).`
          : `Removido: ${item.name}.`,
      );
      await refreshAll();
    } catch (e: any) {
      setMsg(e.message || 'Falha ao remover');
    } finally {
      setBusy(false);
    }
  };

  const slotHint = slotFilter
    ? slotFilter.map((s) => SLOT_LABELS[s]).join(' · ')
    : null;

  return (
    <section className={styles.shop}>
      <header className={styles.head}>
        <div>
          <h3>Ripperdoc — comprar e instalar</h3>
          <p className={styles.partFilter}>
            Preços ¤ iguais à{' '}
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => router.push('/shop')}
            >
              /shop
            </button>
            · Eddies campanha {formatEddies(campaignEddies)} · SC {streetCred}
          </p>
          {partLabel ? (
            <p className={styles.partFilter}>
              Região: <strong>{partLabel}</strong>
              {slotHint ? <span> — {slotHint}</span> : null}
              {onClearPart && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={onClearPart}
                >
                  Ver tudo
                </button>
              )}
            </p>
          ) : (
            <p className={styles.partFilter}>
              Clique numa parte do corpo para filtrar o chrome compatível.
            </p>
          )}
        </div>
        <div className={styles.edgesRow}>
          <div className={styles.edgesReadout}>
            <span className={styles.edgesLabel}>Edges na ficha</span>
            <strong className={styles.edgesValue}>{edges} E</strong>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => router.push(`/sheet?id=${characterId}`)}
            >
              Editar na ficha
            </button>
          </div>
        </div>
      </header>
      {msg && <p className={styles.msg}>{msg}</p>}

      {ownedPending.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Comprado — aguardando instalação</h4>
          <div className={styles.grid}>
            {ownedPending.map((item) => {
              const cat = catalog.find((c) => Number(c.id) === Number(item.id));
              const cost = edgeCostOf(item);
              const canInstall = edges >= cost;
              return (
                <article
                  key={`owned-${item.id}`}
                  className={`${styles.card} ${styles.owned}`}
                >
                  <img
                    src={cyberwareImageSrc(cat || { name: item.name })}
                    alt={item.name}
                    className={styles.thumb}
                  />
                  <div className={styles.body}>
                    <strong>{item.name}</strong>
                    <span>
                      {cat
                        ? SLOT_LABELS[cat.type as CyberWareSlot] || cat.type
                        : item.type || 'chrome'}
                      {' · pago '}
                      {formatEddies(Number(item.price) || 0)}
                      {cost > 0 ? ` · inst. ${cost} E` : ''}
                    </span>
                    <p>{cat?.effect || cat?.description || 'Pronto para instalar.'}</p>
                  </div>
                  <button
                    type="button"
                    disabled={busy || !canInstall}
                    title={
                      canInstall
                        ? undefined
                        : `Precisa ${cost} E (ficha tem ${edges} E)`
                    }
                    onClick={() => installOwned(item)}
                  >
                    {canInstall ? `Instalar (${cost} E)` : `Sem E (${cost})`}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          {partLabel
            ? `Chrome instalado — ${partLabel}`
            : 'Chrome instalado'}
        </h4>
        {installedHere.length === 0 ? (
          <p className={styles.empty}>
            {partLabel
              ? 'Nenhuma peça nesta região.'
              : 'Nenhum chrome implantado ainda.'}
          </p>
        ) : (
          <div className={styles.grid}>
            {installedHere.map((item) => (
              <article
                key={`in-${item.id}`}
                className={`${styles.card} ${styles.installed}`}
              >
                <img
                  src={cyberwareImageSrc(item)}
                  alt={item.name}
                  className={styles.thumb}
                />
                <div className={styles.body}>
                  <strong>{item.name}</strong>
                  <span>
                    {SLOT_LABELS[item.type as CyberWareSlot] || item.type}
                    {item.rarity ? ` · ${item.rarity}` : ''}
                    {item.edgeCost != null ? ` · ${item.edgeCost} E` : ''}
                  </span>
                  <p>{item.effect || item.description}</p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => uninstall(item)}
                >
                  Remover
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <input
        className={styles.search}
        type="search"
        placeholder={
          partLabel
            ? `Buscar chrome para ${partLabel.toLowerCase()}…`
            : 'Buscar peça de chrome…'
        }
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          {partLabel
            ? `Catálogo para ${partLabel}`
            : 'Catálogo do ripperdoc'}
        </h4>
        {available.length === 0 ? (
          <p className={styles.empty}>
            Nenhuma peça disponível
            {partLabel ? ` para ${partLabel.toLowerCase()}` : ''}.
          </p>
        ) : (
          <div className={styles.grid}>
            {available.map((item) => {
              const edgeCost = edgeCostOf(item);
              const eddiePrice = displayPrice(item);
              const alreadyOwned = ownedIds.has(Number(item.id));
              const canAfford = campaignEddies >= eddiePrice;
              const canInstall = edges >= edgeCost;
              return (
                <article key={item.id} className={styles.card}>
                  <img
                    src={cyberwareImageSrc(item)}
                    alt={item.name}
                    className={styles.thumb}
                  />
                  <div className={styles.body}>
                    <strong>{item.name}</strong>
                    <span>
                      {SLOT_LABELS[item.type as CyberWareSlot] || item.type} ·{' '}
                      {item.rarity || '—'} · {formatEddies(eddiePrice)}
                      {edgeCost > 0 ? ` · inst. ${edgeCost} E` : ''} · carga{' '}
                      {item.implant_cost ?? item.implantCost ?? '—'}
                    </span>
                    <p>{item.effect || item.description}</p>
                  </div>
                  <div className={styles.actions}>
                    {alreadyOwned ? (
                      <button
                        type="button"
                        disabled={busy || !canInstall}
                        title={
                          canInstall
                            ? undefined
                            : `Precisa ${edgeCost} E (ficha tem ${edges} E)`
                        }
                        onClick={() => installOwned(item)}
                      >
                        {canInstall
                          ? `Instalar (${edgeCost} E)`
                          : `Sem E (${edgeCost})`}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy || !canAfford}
                        title={
                          canAfford
                            ? undefined
                            : `Precisa ${formatEddies(eddiePrice)} (tem ${formatEddies(campaignEddies)})`
                        }
                        onClick={() => buyOnly(item)}
                      >
                        {canAfford
                          ? `Comprar ${formatEddies(eddiePrice)}`
                          : `Sem ¤ (${formatEddies(eddiePrice)})`}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
};

export default CyberwareShop;
