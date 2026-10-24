'use client';

import React from 'react';
import { computeCyberwareCapacity } from '../../lib/cyberwareCapacity';
import { SLOT_LABELS, CyberWareSlot } from '../../data/cyberwareSlots';
import styles from './page.module.css';

type CyberCapacityProps = {
  characterData: {
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
      };
    };
  };
};

const CyberCapacity = ({ characterData }: CyberCapacityProps) => {
  const cyberwares = characterData.cyberwares || [];
  const capacity =
    characterData.cyberwareCapacity ||
    computeCyberwareCapacity(
      cyberwares.map((cw) => ({ implantCost: cw.implantCost ?? 1 })),
    );
  const edges = characterData.sheet?.other_traits?.edges ?? 0;

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
          <div>Edges (E)</div>
          <strong style={{ color: '#2be4ea', fontSize: '1.4rem' }}>{edges}</strong>
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

      {cyberwares.length === 0 ? (
        <p style={{ color: '#2be4ea' }}>Nenhum cyberware implantado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#2be4ea' }}>
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
                <td>
                  {SLOT_LABELS[cw.type as CyberWareSlot] || cw.type}
                </td>
                <td>{cw.edgeCost ?? '—'}</td>
                <td>{cw.implantCost ?? '—'}</td>
                <td>{cw.hackDifficulty ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default CyberCapacity;
