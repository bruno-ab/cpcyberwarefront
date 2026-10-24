'use client';

import React from 'react';
import Link from 'next/link';
import { computeCyberwareCapacity } from '../../lib/cyberwareCapacity';
import { SLOT_LABELS, CyberWareSlot } from '../../data/cyberwareSlots';
import { cyberwareImageSrc } from '../../lib/media';
import styles from './page.module.css';

type CyberCapacityProps = {
  characterData: {
    id: number;
    cyberwares?: Array<{
      name: string;
      type: string;
      image?: string;
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
          <div style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
            Comprar/instalar em{' '}
            <Link href={`/cyberware?id=${characterData.id}`} style={{ color: '#fed33f' }}>
              Cyberwares →
            </Link>
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

      {cyberwares.length === 0 ? (
        <p style={{ color: '#2be4ea' }}>Nenhum cyberware implantado.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {cyberwares.map((cw, index) => (
            <article
              key={`${cw.name}-${index}`}
              style={{
                border: '1px solid #777',
                background: 'rgba(0,0,0,0.35)',
                padding: '0.5rem',
              }}
            >
              <img
                src={cyberwareImageSrc(cw)}
                alt={cw.name}
                width={72}
                height={72}
                style={{ objectFit: 'cover', border: '1px solid #8814ff' }}
              />
              <div style={{ color: '#fff', marginTop: '0.35rem' }}>{cw.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#c3c3c3' }}>
                {SLOT_LABELS[cw.type as CyberWareSlot] || cw.type} · {cw.edgeCost ?? '—'} E
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default CyberCapacity;
