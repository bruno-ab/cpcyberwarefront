'use client';

import { useEffect, useMemo, useState } from 'react';
import { SLOT_LABELS, CyberWareSlot } from '../../data/cyberwareSlots';
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

type Props = {
  characterId: number;
  sheet: Record<string, any>;
  onUpdated?: () => void;
};

export const CyberwareShop = ({ characterId, sheet, onUpdated }: Props) => {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [filter, setFilter] = useState('');
  const [edges, setEdges] = useState(Number(sheet?.other_traits?.edges ?? 0));
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEdges(Number(sheet?.other_traits?.edges ?? 0));
  }, [sheet]);

  useEffect(() => {
    fetch(apiUrl('/api/cyberware'), { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setCatalog(Array.isArray(d) ? d : []))
      .catch(() => setCatalog([]));
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) ||
        c.rarity?.toLowerCase().includes(q),
    );
  }, [catalog, filter]);

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
        other_traits: { ...(sheet.other_traits || {}), edges: Math.max(0, Number(edges) || 0) },
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
      const install = await fetch(apiUrl(`/api/characters/${characterId}/cyberware`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ cyberwareId: item.id }),
      });
      if (!install.ok) {
        await saveSheet(sheet);
        const err = await install.json().catch(() => ({}));
        throw new Error(err.message || 'Não foi possível instalar (capacidade/slot).');
      }
      setEdges(nextEdges);
      setMsg(`Instalado: ${item.name} (−${cost} E).`);
      onUpdated?.();
    } catch (e: any) {
      setMsg(e.message || 'Falha na compra');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.shop}>
      <header className={styles.head}>
        <h3>Ripperdoc — comprar e instalar</h3>
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
      <input
        className={styles.search}
        type="search"
        placeholder="Buscar peça de chrome…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className={styles.grid}>
        {filtered.map((item) => {
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
    </section>
  );
};

export default CyberwareShop;
