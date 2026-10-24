'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { computeCyberwareCapacity } from '../../lib/cyberwareCapacity';
import { SLOT_LABELS, CyberWareSlot } from '../../data/cyberwareSlots';
import { apiUrl, authHeaders } from '../../lib/api';
import styles from './page.module.css';

type CatalogItem = {
  id: number;
  name: string;
  type: string;
  edge_cost?: number;
  edgeCost?: number;
  implant_cost?: number;
  implantCost?: number;
  hack_difficulty?: number;
  rarity?: string;
  effect?: string;
};

type CyberCapacityProps = {
  characterData: {
    id: number;
    cyberwares?: Array<{
      name: string;
      type: string;
      implantCost?: number;
      edgeCost?: number;
      hackDifficulty?: number;
      effect?: string;
    }>;
    cyberwareCapacity?: {
      remaining: number;
      used: number;
      baseCapacity: number;
      inCyberpsychosis: boolean;
      cyberpsychosisSeverity: number;
    };
    sheet?: {
      other_traits?: {
        edges?: number;
        implant_capacity?: number;
        humanity?: number;
      };
      [key: string]: unknown;
    };
  };
  onRefresh?: () => void;
};

const CyberCapacity = ({ characterData, onRefresh }: CyberCapacityProps) => {
  const cyberwares = characterData.cyberwares || [];
  const capacity =
    characterData.cyberwareCapacity ||
    computeCyberwareCapacity(
      cyberwares.map((cw) => ({ implantCost: cw.implantCost ?? 1 })),
    );

  const sheet = characterData.sheet || {};
  const [edges, setEdges] = useState(
    Number(characterData.sheet?.other_traits?.edges ?? 0),
  );
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEdges(Number(characterData.sheet?.other_traits?.edges ?? 0));
  }, [characterData]);

  useEffect(() => {
    fetch(apiUrl('/api/cyberware'), { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setCatalog(Array.isArray(d) ? d : []))
      .catch(() => setCatalog([]));
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return catalog.slice(0, 40);
    return catalog
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.type?.toLowerCase().includes(q) ||
          c.rarity?.toLowerCase().includes(q),
      )
      .slice(0, 40);
  }, [catalog, filter]);

  const saveSheet = async (nextSheet: Record<string, unknown>) => {
    const res = await fetch(apiUrl(`/api/characters/${characterData.id}/sheet`), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(nextSheet),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao salvar ficha');
    }
  };

  const saveEdges = async () => {
    setBusy(true);
    setMsg('');
    try {
      const next = {
        ...sheet,
        other_traits: {
          ...(sheet.other_traits || {}),
          edges: Math.max(0, Number(edges) || 0),
        },
      };
      await saveSheet(next);
      setMsg('Edges salvos.');
      onRefresh?.();
    } catch (e: any) {
      setMsg(e.message || 'Erro ao salvar Edges');
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
        other_traits: {
          ...(sheet.other_traits || {}),
          edges: nextEdges,
        },
      };
      await saveSheet(nextSheet);

      const install = await fetch(
        apiUrl(`/api/characters/${characterData.id}/cyberware`),
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ cyberwareId: item.id, allowOverclock: false }),
        },
      );
      if (!install.ok) {
        // rollback edges
        await saveSheet(sheet as any);
        const err = await install.json().catch(() => ({}));
        throw new Error(
          err.message || 'Não foi possível instalar (capacidade/slot).',
        );
      }
      setEdges(nextEdges);
      setMsg(`Comprou e instalou ${item.name} (−${cost} E).`);
      onRefresh?.();
    } catch (e: any) {
      setMsg(e.message || 'Falha na compra');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ margin: '1rem 0', color: '#fed33f' }}>
      <h3 className={styles.attributesSection}>Cyberware & Edges</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ border: '1px solid #fed33f', padding: '0.75rem' }}>
          <div>Capacidade livre</div>
          <strong style={{ color: capacity.remaining < 0 ? '#e8615a' : '#2be4ea', fontSize: '1.4rem' }}>
            {capacity.remaining}
          </strong>
          <div style={{ fontSize: '0.85rem' }}>
            usada {capacity.used} / base {capacity.baseCapacity}
          </div>
        </div>
        <div style={{ border: '1px solid #fed33f', padding: '0.75rem' }}>
          <div>Edges (dinheiro / E)</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem' }}>
            <input
              type="number"
              min={0}
              value={edges}
              onChange={(e) => setEdges(Number(e.target.value))}
              style={{
                width: '5rem',
                background: '#111',
                border: '1px solid #8814ff',
                color: '#2be4ea',
                fontSize: '1.2rem',
                padding: '0.25rem',
              }}
              aria-label="Edges"
            />
            <button
              type="button"
              onClick={saveEdges}
              disabled={busy}
              style={{
                background: 'transparent',
                border: '1px solid #1fb6ff',
                color: '#fed33f',
                cursor: 'pointer',
                padding: '0.35rem 0.6rem',
              }}
            >
              Salvar
            </button>
          </div>
        </div>
        <div style={{ border: '1px solid #fed33f', padding: '0.75rem' }}>
          <div>Cyberpsicose</div>
          <strong style={{ color: capacity.inCyberpsychosis ? '#e8615a' : '#2bfea0', fontSize: '1.1rem' }}>
            {capacity.inCyberpsychosis
              ? `Ativa (sev. ${capacity.cyberpsychosisSeverity})`
              : 'Estável'}
          </strong>
        </div>
      </div>

      {msg && (
        <p style={{ color: '#2be4ea', marginBottom: '0.75rem' }}>{msg}</p>
      )}

      {cyberwares.length === 0 ? (
        <p style={{ color: '#2be4ea' }}>Nenhum cyberware implantado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#2be4ea', marginBottom: '1.25rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #fed33f', textAlign: 'left' }}>
              <th>Peça</th>
              <th>Slot</th>
              <th>E</th>
              <th>Implante</th>
              <th>Hack</th>
            </tr>
          </thead>
          <tbody>
            {cyberwares.map((cw, index) => (
              <tr key={`${cw.name}-${index}`} style={{ borderBottom: '1px solid #452' }}>
                <td>{cw.name}</td>
                <td>{SLOT_LABELS[cw.type as CyberWareSlot] || cw.type}</td>
                <td>{cw.edgeCost ?? '—'}</td>
                <td>{cw.implantCost ?? '—'}</td>
                <td>{cw.hackDifficulty ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className={styles.attributesSection}>Comprar cyberware</h3>
      <p style={{ color: '#c3c3c3', fontSize: '0.9rem' }}>
        Gasta Edges (E) e instala no personagem (respeita capacidade de implante).
      </p>
      <input
        type="search"
        placeholder="Buscar no catálogo…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          width: 'min(320px, 100%)',
          marginBottom: '0.75rem',
          background: '#111',
          border: '1px solid #777',
          color: '#fff',
          padding: '0.4rem 0.6rem',
        }}
      />
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {filtered.map((item) => {
          const cost = Number(item.edge_cost ?? item.edgeCost ?? 0);
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: '0.75rem',
                border: '1px solid #777',
                padding: '0.55rem 0.75rem',
                background: 'rgba(0,0,0,0.35)',
              }}
            >
              <div>
                <strong style={{ color: '#fff' }}>{item.name}</strong>
                <div style={{ fontSize: '0.85rem', color: '#c3c3c3' }}>
                  {SLOT_LABELS[item.type as CyberWareSlot] || item.type}
                  {' · '}
                  {item.rarity || '—'}
                  {' · '}
                  {cost} E
                  {' · implante '}
                  {item.implant_cost ?? item.implantCost ?? '—'}
                </div>
              </div>
              <button
                type="button"
                disabled={busy || edges < cost}
                onClick={() => buyAndInstall(item)}
                style={{
                  background: edges < cost ? '#333' : 'transparent',
                  border: '1px solid #fed33f',
                  color: '#fed33f',
                  cursor: edges < cost ? 'not-allowed' : 'pointer',
                  padding: '0.35rem 0.75rem',
                  fontFamily: 'Audiowide, serif',
                  fontSize: '0.75rem',
                }}
              >
                Comprar & instalar
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CyberCapacity;
