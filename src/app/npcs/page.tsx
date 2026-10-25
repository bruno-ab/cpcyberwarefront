'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageFrame } from '../../components/layout/PageFrame';
import { NPC_SHEETS } from '../../data/npcSheets';
import { computeCyberwareCapacity } from '../../lib/cyberwareCapacity';
import { npcImageSrc } from '../../lib/media';
import styles from './npcs.module.css';

const NpcsPage = () => {
  const [sourceFilter, setSourceFilter] = useState<string>('cp2077');

  const items = useMemo(() => {
    if (sourceFilter === 'all') return NPC_SHEETS;
    return NPC_SHEETS.filter((npc) => npc.source === sourceFilter);
  }, [sourceFilter]);

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.heroHead}>
          <div>
            <h1>NPCs</h1>
            <p className={styles.intro}>
              Fichas Storyteller de Night City — atributos, Edges, chrome e
              ganchos de sessão.
            </p>
          </div>
        </header>

        <div className={styles.filters}>
          <label>
            Fonte{' '}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="cp2077">CP2077</option>
              <option value="phantom-liberty">Phantom Liberty</option>
              <option value="edgerunners">Edgerunners</option>
              <option value="all">Todas</option>
            </select>
          </label>
        </div>

        <div className={styles.grid}>
          {items.map((npc) => {
            const capacity = computeCyberwareCapacity(
              npc.sheet.cyberwareLoad.map((cw) => ({
                implantCost: cw.implantCost,
              })),
            );
            return (
              <article key={npc.id} className={styles.card}>
                <img
                  src={npcImageSrc(npc)}
                  alt={npc.name}
                  className={styles.portrait}
                  width={120}
                  height={150}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (el.dataset.fallback === '1') return;
                    el.dataset.fallback = '1';
                    el.src = `/images/npcs/${npc.id}.svg`;
                    el.onerror = null;
                  }}
                />
                <header className={styles.cardHeader}>
                  <h3>{npc.name}</h3>
                  <span className={styles.badge}>{npc.threat}</span>
                </header>
                <p className={styles.meta}>
                  {npc.role} · {npc.affiliation} · {npc.source}
                </p>
                <p>{npc.summary}</p>
                <p>
                  <strong>Conceito:</strong> {npc.concept}
                </p>
                <p>
                  <strong>Vitalidade:</strong> {npc.sheet.vitality} ·{' '}
                  <strong>Willpower:</strong>{' '}
                  {npc.sheet.other_traits.willpower} · <strong>E:</strong>{' '}
                  {npc.sheet.other_traits.edges}
                </p>
                <p>
                  <strong>Capacidade chrome:</strong>{' '}
                  <span
                    className={
                      capacity.remaining < 0
                        ? styles.capBad
                        : styles.capOk
                    }
                  >
                    {capacity.remaining}
                  </span>{' '}
                  livres ({capacity.used} usados)
                </p>
                <Link className={styles.link} href={`/npcs/${npc.id}`}>
                  Abrir ficha completa →
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </PageFrame>
  );
};

export default NpcsPage;
