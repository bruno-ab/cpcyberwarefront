'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SLOT_LABELS, CyberWareSlot } from '../../data/cyberwareSlots';
import { CYBERWARE_CATALOG } from '../../data/cyberwareCatalog';
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
import {
  DEFAULT_CYBERWARE_FILTERS,
  matchesChromeFilters,
  sortChromeItems,
  type CyberwareFilterState,
} from '../../lib/cyberwareFilters';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import { CyberwareFilterBar } from './CyberwareFilterBar';
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
  /** Edges já pagos nesta unidade (reinstalação gratuita se removeu sem reembolso). */
  edgesPaid?: boolean;
  edgesSpent?: boolean;
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
  const [filters, setFilters] = useState<CyberwareFilterState>(
    DEFAULT_CYBERWARE_FILTERS,
  );
  const [edges, setEdges] = useState(sheetEdges(sheet));
  const [streetCred, setStreetCred] = useState(0);
  const [heat, setHeat] = useState<import('../../lib/heat').CampaignHeat | null>(
    null,
  );
  const [campaignEddies, setCampaignEddies] = useState(0);
  const [localSheet, setLocalSheet] = useState(sheet);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<InstalledItem | null>(null);

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

  const loadCatalog = async () => {
    try {
      const r = await fetch(apiUrl('/api/cyberware'), {
        headers: authHeaders(),
      });
      const d = await r.json();
      setCatalog(Array.isArray(d) ? d : []);
    } catch {
      setCatalog([]);
    }
  };

  const loadCampaignWallet = async () => {
    try {
      const c = await fetch(apiUrl(`/api/campaigns/${campaignId}`), {
        headers: authHeaders(),
      }).then((r) => (r.ok ? r.json() : null));
      if (!c) return;
      setStreetCred(Number(c?.streetCred || 0));
      setCampaignEddies(Number(c?.eddies || 0));
      setHeat(c?.heat || null);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [characterId]);

  useEffect(() => {
    loadCampaignWallet();
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

  const catalogEdgeCostOf = (item: CatalogItem | OwnedChrome | InstalledItem) => {
    const catalogItem =
      catalog.find((c) => Number(c.id) === Number(item.id)) || null;
    if (catalogItem) {
      return Math.max(
        0,
        Number(catalogItem.edge_cost ?? catalogItem.edgeCost ?? 0) || 0,
      );
    }
    const fromItem = Number(
      (item as CatalogItem).edge_cost ?? (item as InstalledItem).edgeCost ?? 0,
    );
    if (fromItem > 0) return fromItem;
    const byName = CYBERWARE_CATALOG.find(
      (c) => c.name.toLowerCase() === String(item.name || '').toLowerCase(),
    );
    return Math.max(0, Number(byName?.edgeCost ?? 0) || 0);
  };

  const displayPrice = (item: CatalogItem | InstalledItem | OwnedChrome) => {
    const cat = catalog.find((c) => Number(c.id) === Number(item.id));
    const base = itemEddiePrice(cat || item);
    return heatAwarePrice(base, streetCred, heat);
  };

  const edgesAlreadyPaid = (item: CatalogItem | OwnedChrome) => {
    const owned = (localSheet?.inventory?.cyberware || []).find(
      (row: OwnedChrome) => Number(row.id) === Number(item.id),
    ) as OwnedChrome | undefined;
    return Boolean(owned?.edgesPaid || owned?.edgesSpent);
  };

  /** Custo real a debitar agora (0 se Edges já foram pagos nesta peça). */
  const edgeCostOf = (item: CatalogItem | OwnedChrome) =>
    edgesAlreadyPaid(item) ? 0 : catalogEdgeCostOf(item);

  const effectiveFilters = useMemo((): CyberwareFilterState => {
    if (!slotFilter) return filters;
    return { ...filters, type: 'all' };
  }, [filters, slotFilter]);

  const filteredOwned = useMemo(() => {
    if (effectiveFilters.status === 'buyable') return [];
    if (effectiveFilters.status === 'installed') return [];
    const rows = ownedPending
      .filter((item) => {
        const cat = catalog.find((c) => Number(c.id) === Number(item.id));
        const type = cat?.type || item.type;
        if (
          slotFilter &&
          type &&
          !slotFilter.includes(type as CyberWareSlot)
        ) {
          return false;
        }
        return matchesChromeFilters(
          {
            id: item.id,
            name: item.name,
            type,
            rarity: cat?.rarity,
            description: cat?.description,
            effect: cat?.effect,
            price: Number(item.price) || displayPrice(cat || item),
            edgeCost: catalogEdgeCostOf(item),
          },
          { ...effectiveFilters, affordableOnly: false },
        );
      })
      .map((item) => {
        const cat = catalog.find((c) => Number(c.id) === Number(item.id));
        return {
          item,
          cat,
          price: Number(item.price) || displayPrice(cat || item),
          edgeCost: catalogEdgeCostOf(item),
          rarity: cat?.rarity,
          name: item.name,
        };
      });
    return sortChromeItems(rows, effectiveFilters.sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ownedPending,
    catalog,
    slotFilter,
    effectiveFilters,
    streetCred,
    heat,
  ]);

  const filteredInstalled = useMemo(() => {
    if (effectiveFilters.status === 'buyable') return [];
    if (effectiveFilters.status === 'owned') return [];
    const rows = installedHere
      .filter((item) =>
        matchesChromeFilters(
          {
            id: item.id,
            name: item.name,
            type: item.type,
            rarity: item.rarity,
            description: item.description,
            effect: item.effect,
            price: displayPrice(item),
            edgeCost: Number(item.edgeCost) || catalogEdgeCostOf(item),
          },
          { ...effectiveFilters, affordableOnly: false },
        ),
      )
      .map((item) => ({
        item,
        price: displayPrice(item),
        edgeCost: Number(item.edgeCost) || catalogEdgeCostOf(item),
        rarity: item.rarity,
        name: item.name,
      }));
    return sortChromeItems(rows, effectiveFilters.sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installedHere, catalog, effectiveFilters, streetCred, heat]);

  const available = useMemo(() => {
    if (effectiveFilters.status === 'owned') return [];
    if (effectiveFilters.status === 'installed') return [];
    const rows = catalog.filter((c) => {
      if (slotFilter && !slotFilter.includes(c.type as CyberWareSlot)) {
        return false;
      }
      if (installedIds.has(Number(c.id))) return false;
      if (
        effectiveFilters.status === 'buyable' &&
        ownedIds.has(Number(c.id))
      ) {
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
          price: displayPrice(c),
          edgeCost: Number(c.edge_cost ?? c.edgeCost ?? 0) || 0,
        },
        effectiveFilters,
        { wallet: campaignEddies },
      );
    });
    return sortChromeItems(
      rows.map((c) => ({
        ...c,
        price: displayPrice(c),
        edgeCost: Number(c.edge_cost ?? c.edgeCost ?? 0) || 0,
      })),
      effectiveFilters.sort,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    catalog,
    effectiveFilters,
    slotFilter,
    installedIds,
    ownedIds,
    campaignEddies,
    streetCred,
    heat,
  ]);

  const filterResultCount =
    filteredOwned.length + filteredInstalled.length + available.length;

  const showOwnedSection =
    effectiveFilters.status === 'all' || effectiveFilters.status === 'owned';
  const showInstalledSection =
    effectiveFilters.status === 'all' ||
    effectiveFilters.status === 'installed';
  const showCatalogSection =
    effectiveFilters.status === 'all' || effectiveFilters.status === 'buyable';

  const refreshAll = async () => {
    await Promise.all([
      Promise.resolve(onUpdated?.()),
      refreshCampaign(),
      loadCatalog(),
      loadCampaignWallet(),
    ]);
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

  const installOwned = async (
    item: CatalogItem | OwnedChrome,
    allowOverclock = false,
  ) => {
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
          body: JSON.stringify({
            cyberwareId: Number(item.id),
            allowOverclock: !!allowOverclock,
          }),
        },
      );
      const payload = await install.json().catch(() => ({}));
      if (!install.ok) {
        const capacityMsg = String(payload.message || '');
        if (
          !allowOverclock &&
          /capacity exceeded|allowOverclock|cyberpsychosis/i.test(capacityMsg)
        ) {
          const force = window.confirm(
            `${capacityMsg}\n\nForçar instalação (overclock) e arriscar cyberpsychosis?`,
          );
          setBusy(false);
          if (force) {
            await installOwned(item, true);
          }
          return;
        }
        throw new Error(
          capacityMsg ||
            'Não foi possível instalar (Edges / capacidade / slot).',
        );
      }
      playCyberSound('install');
      if (payload?.psychosis?.triggered) {
        playCyberSound('glitch');
        setMsg(
          `CYBERPSYCHOSIS · severidade ${payload.psychosis.severity} · capacidade ${payload.psychosis.remaining}`,
        );
      }
      const nextEdges =
        payload.edges != null ? Number(payload.edges) : Math.max(0, edges - cost);
      setEdges(nextEdges);
      setLocalSheet((prev) => {
        const list = (prev?.inventory?.cyberware || []) as OwnedChrome[];
        const cyberware = list.map((row) =>
          Number(row.id) === Number(item.id)
            ? { ...row, installed: true, edgesPaid: true }
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
      if (payload?.psychosis?.triggered) {
        q.set('psychosis', String(payload.psychosis.severity || 1));
      }
      router.push(`/installation?${q.toString()}`);
    } catch (e: any) {
      playCyberSound('deny');
      setMsg(e.message || 'Falha ao instalar');
      setBusy(false);
    }
  };

  const uninstall = async (item: InstalledItem, refundEdges: boolean) => {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(
        apiUrl(`/api/characters/${characterId}/cyberware`),
        {
          method: 'DELETE',
          headers: authHeaders(),
          body: JSON.stringify({
            cyberwareId: item.id,
            refundEdges,
          }),
        },
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.message || 'Não foi possível remover o chrome.');
      }
      if (payload.edges != null) {
        setEdges(Number(payload.edges));
      }
      playCyberSound(refundEdges ? 'confirm' : 'glitch');
      setMsg(
        payload.refundedEdges
          ? `Removido: ${item.name} (+${payload.refundedEdges} E devolvidos).`
          : `Removido: ${item.name} (Edges não devolvidos).`,
      );
      setRemoveTarget(null);
      await refreshAll();
    } catch (e: any) {
      playCyberSound('deny');
      setMsg(e.message || 'Falha ao remover');
    } finally {
      setBusy(false);
    }
  };

  const removeEdgeCost = removeTarget
    ? Math.max(
        0,
        Number(
          removeTarget.edgeCost ??
            catalogEdgeCostOf(removeTarget) ??
            0,
        ) || 0,
      )
    : 0;

  const slotHint = slotFilter
    ? slotFilter.map((s) => SLOT_LABELS[s]).join(' · ')
    : null;

  return (
    <section className={styles.shop}>
      {removeTarget && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => !busy && setRemoveTarget(null)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-chrome-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="remove-chrome-title">Remover chrome</h4>
            <p>
              Extrair <strong>{removeTarget.name}</strong> do corpo?
            </p>
            {removeEdgeCost > 0 ? (
              <p className={styles.modalHint}>
                Esta peça custou <strong>{removeEdgeCost} E</strong> na
                instalação. Devolver os Edges para a ficha?
              </p>
            ) : (
              <p className={styles.modalHint}>
                Esta peça não consumiu Edges na instalação.
              </p>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                disabled={busy}
                onClick={() => setRemoveTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => uninstall(removeTarget, false)}
              >
                Remover sem devolver
              </button>
              {removeEdgeCost > 0 && (
                <button
                  type="button"
                  className={styles.modalPrimary}
                  disabled={busy}
                  onClick={() => uninstall(removeTarget, true)}
                >
                  Devolver {removeEdgeCost} E e remover
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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

      <CyberwareFilterBar
        value={filters}
        onChange={setFilters}
        hideType={Boolean(slotFilter)}
        resultCount={filterResultCount}
        searchPlaceholder={
          partLabel
            ? `Buscar chrome para ${partLabel.toLowerCase()}…`
            : 'Buscar por nome, tipo, efeito…'
        }
      />

      {showOwnedSection &&
        (filteredOwned.length > 0 ||
          effectiveFilters.status === 'owned') && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Comprado — aguardando instalação
          </h4>
          {filteredOwned.length === 0 ? (
            <p className={styles.empty}>
              Nenhum chrome no inventário com esses filtros.
            </p>
          ) : (
            <div className={styles.grid}>
              {filteredOwned.map(({ item, cat }) => {
                const catalogCost = catalogEdgeCostOf(item);
                const prepaid = edgesAlreadyPaid(item);
                const cost = prepaid ? 0 : catalogCost;
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
                        {cat?.rarity ? ` · ${cat.rarity}` : ''}
                        {' · pago '}
                        {formatEddies(Number(item.price) || 0)}
                        {prepaid
                          ? ' · Edges já pagos'
                          : catalogCost > 0
                            ? ` · inst. ${catalogCost} E`
                            : ''}
                      </span>
                      <p>
                        {cat?.effect ||
                          cat?.description ||
                          'Pronto para instalar.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busy || !canInstall}
                      title={
                        canInstall
                          ? prepaid
                            ? 'Reinstalação sem custo de Edges'
                            : undefined
                          : `Precisa ${cost} E (ficha tem ${edges} E)`
                      }
                      onClick={() => installOwned(item)}
                    >
                      {canInstall
                        ? prepaid
                          ? 'Reinstalar (0 E)'
                          : `Instalar (${cost} E)`
                        : `Sem E (${cost})`}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {showInstalledSection && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>
            {partLabel
              ? `Chrome instalado — ${partLabel}`
              : 'Chrome instalado'}
          </h4>
          {filteredInstalled.length === 0 ? (
            <p className={styles.empty}>
              {partLabel
                ? 'Nenhuma peça nesta região com esses filtros.'
                : 'Nenhum chrome implantado com esses filtros.'}
            </p>
          ) : (
            <div className={styles.grid}>
              {filteredInstalled.map(({ item }) => (
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
                    onClick={() => {
                      playCyberSound('ui');
                      setRemoveTarget(item);
                    }}
                  >
                    Remover
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {showCatalogSection && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>
            {partLabel
              ? `Catálogo para ${partLabel}`
              : 'Catálogo do ripperdoc'}
          </h4>
          {available.length === 0 ? (
            <p className={styles.empty}>
              Nenhuma peça disponível
              {partLabel ? ` para ${partLabel.toLowerCase()}` : ''} com esses
              filtros.
            </p>
          ) : (
            <div className={styles.grid}>
              {available.map((item) => {
                const catalogCost = catalogEdgeCostOf(item);
                const prepaid = edgesAlreadyPaid(item);
                const edgeCost = prepaid ? 0 : catalogCost;
                const eddiePrice = Number(item.price) || displayPrice(item);
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
                        {prepaid
                          ? ' · Edges já pagos'
                          : catalogCost > 0
                            ? ` · inst. ${catalogCost} E`
                            : ''}{' '}
                        · carga {item.implant_cost ?? item.implantCost ?? '—'}
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
                              ? prepaid
                                ? 'Reinstalação sem custo de Edges'
                                : undefined
                              : `Precisa ${edgeCost} E (ficha tem ${edges} E)`
                          }
                          onClick={() => installOwned(item)}
                        >
                          {canInstall
                            ? prepaid
                              ? 'Reinstalar (0 E)'
                              : `Instalar (${edgeCost} E)`
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
      )}
    </section>
  );
};

export default CyberwareShop;
