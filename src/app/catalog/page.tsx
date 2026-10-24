'use client';

import React, { useMemo, useState } from 'react';
import Header from '../header/Header';
import { CYBERWARE_CATALOG } from '../../data/cyberwareCatalog';
import { SLOT_LABELS, CyberWareSlot } from '../../data/cyberwareSlots';
import styles from './catalog.module.css';

const CatalogPage = () => {
  const [slotFilter, setSlotFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const items = useMemo(() => {
    return CYBERWARE_CATALOG.filter((item) => {
      const slotOk = slotFilter === 'all' || item.type === slotFilter;
      const sourceOk = sourceFilter === 'all' || item.source === sourceFilter;
      return slotOk && sourceOk;
    });
  }, [slotFilter, sourceFilter]);

  return (
    <section className={styles.page}>
      <Header />
      <h2>Catálogo de Cyberware</h2>
      <p className={styles.intro}>
        Peças baseadas em Cyberpunk 2077 e Edgerunners para mesa Storyteller. Colunas:{' '}
        <strong>E</strong> (Edges), <strong>Hack</strong> (dificuldade),{' '}
        <strong>Implante</strong> (carga na capacidade 10) e <strong>Slot</strong>.
      </p>

      <div className={styles.filters}>
        <label>
          Slot{' '}
          <select value={slotFilter} onChange={(e) => setSlotFilter(e.target.value)}>
            <option value="all">Todos</option>
            {Object.entries(SLOT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fonte{' '}
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="cp2077">CP2077</option>
            <option value="edgerunners">Edgerunners</option>
            <option value="both">Ambos</option>
          </select>
        </label>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Slot</th>
              <th>E</th>
              <th>Hack</th>
              <th>Implante</th>
              <th>Raridade</th>
              <th>Fonte</th>
              <th>Efeito</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name}>
                <td>
                  <strong>{item.name}</strong>
                  <div className={styles.desc}>{item.description}</div>
                </td>
                <td>{SLOT_LABELS[item.type as CyberWareSlot]}</td>
                <td>{item.edgeCost}</td>
                <td>{item.hackDifficulty}</td>
                <td>{item.implantCost}</td>
                <td>{item.rarity}</td>
                <td>{item.source}</td>
                <td>{item.effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CatalogPage;
