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
import { cyberwareImageSrc } from '../../lib/media';
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
};

type Props = {
  characterId: string | number;
  sheet: Record<string, any>;
  installed?: InstalledItem[];
  selectedPart?: BodyPart | null;
  onClearPart?: () => void;
  onUpdated?: () => void;
};

export const CyberwareShop = ({
  characterId,
  sheet,
  installed = [],
  selectedPart = null,
  onClearPart,
  onUpdated,
}: Props) => {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [filter, setFilter] = useState('');
  const [edges, setEdges] = useState(Number(sheet?.other_traits?.edges ?? 0));
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const slotFilter = selectedPart ? BODY_PART_SLOTS[selectedPart] : null;
  const partLabel = selectedPart ? BODY_PART_LABELS[selectedPart] : null;

  useEffect(() => {
    setEdges(Number(sheet?.other_traits?.edges ?? 0));
  }, [sheet]);

  useEffect(() => {
    fetch(apiUrl('/api/cyberware'), { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setCatalog(Array.isArray(d) ? d : []))
      .catch(() => setCatalog([]));
  }, []);

  const installedHere = useMemo(() => {
    if (!slotFilter) return installed;
    return installed.filter((cw) =>
      slotFilter.includes(cw.type as CyberWareSlot),
    );
  }, [installed, slotFilter]);

  const installedIds = useMemo(
    () => new Set(installed.map((cw) => cw.id)),
    [installed],
  );

  const available = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return catalog.filter((c) => {
      if (slotFilter && !slotFilter.includes(c.type as CyberWareSlot)) {
        return false;
      }
      if (installedIds.has(c.id)) return false;
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) ||
        c.rarity?.toLowerCase().includes(q)
      );
    });
  }, [catalog, filter, slotFilter, installedIds]);

  const saveSheet = async (nextSheet: Record<string, unknown>) => {
    const res = await fetch(apiUrl(`/api/characters/${characterId}/sheet`), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(nextSheet),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao salvar Edges');
    }
  };

  const saveEdges = async () => {
    setBusy(true);
    setMsg('');
    try {
      await saveSheet({
        ...sheet,
        other_traits: {
          ...(sheet.other_traits || {}),
          edges: Math.max(0, Number(edges) || 0),
        },
      });
      setMsg('Edges salvos.');
      onUpdated?.();
    } catch (e: any) {
      setMsg(e.message || 'Erro ao salvar');
    } finally {
      setBusy(false);
    }
  };

  const buyAndInstall = async (item: CatalogItem) => {
    const cost = Number(item.edge_cost ?? item.edgeCost ?? 0);
    if (edges < cost) {
      setMsg(`Edges insuficientes (precisa ${cost} E).`);
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const nextEdges = edges - cost;
      const nextSheet = {
        ...sheet,
        other_traits: { ...(sheet.other_traits || {}), edges: nextEdges },
      };
      await saveSheet(nextSheet);
      const install = await fetch(
        apiUrl(`/api/characters/${characterId}/cyberware`),
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ cyberwareId: item.id }),
        },
      );
      if (!install.ok) {
        await saveSheet(sheet);
        const err = await install.json().catch(() => ({}));
        throw new Error(
          err.message || 'Não foi possível instalar (capacidade/slot).',
        );
      }
      setEdges(nextEdges);
      const q = new URLSearchParams({
        id: String(characterId),
        name: item.name,
      });
      router.push(`/installation?${q.toString()}`);
    } catch (e: any) {
      setMsg(e.message || 'Falha na compra');
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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Não foi possível remover o chrome.');
      }
      setMsg(`Removido: ${item.name}.`);
      onUpdated?.();
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
          <label>
            Edges (E)
            <input
              type="number"
              min={0}
              value={edges}
              onChange={(e) => setEdges(Number(e.target.value))}
            />
          </label>
          <button type="button" disabled={busy} onClick={saveEdges}>
            Salvar Edges
          </button>
        </div>
      </header>
      {msg && <p className={styles.msg}>{msg}</p>}

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
            ? `Disponíveis para ${partLabel}`
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
              const cost = Number(item.edge_cost ?? item.edgeCost ?? 0);
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
                      {item.rarity || '—'} · {cost} E · implante{' '}
                      {item.implant_cost ?? item.implantCost ?? '—'}
                    </span>
                    <p>{item.effect || item.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={busy || edges < cost}
                    onClick={() => buyAndInstall(item)}
                  >
                    Comprar e instalar
                  </button>
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
